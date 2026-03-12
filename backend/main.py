"""
GestureFlow backend — FastAPI + WebSocket
Camera loop runs in a thread; frames are broadcast to all WS clients
via asyncio.run_coroutine_threadsafe (correct pattern, no lag).
"""

import asyncio, base64, json, os, signal, threading, time
import cv2
import mediapipe as mp
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from actions import execute
from config_manager import load, save, reset
from gesture_detector import GestureDetector
from gestures import GESTURES, OPERATIONS

# ── App ───────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _main_loop
    _main_loop = asyncio.get_event_loop()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── State ─────────────────────────────────────────────────────────────────────
_main_loop: asyncio.AbstractEventLoop = None
_clients: set[WebSocket] = set()
_running = False

# Load saved config on boot so operations work immediately
_saved = load()
if _saved:
    _mapping = {v: k for k, v in _saved.items()}  # gesture -> operation
else:
    _mapping = {}

_camera_thread: threading.Thread = None

mp_drawing = mp.solutions.drawing_utils
mp_hands_mod = mp.solutions.hands

# ── WebSocket broadcast (called from camera thread) ──────────────────────────
async def _broadcast(msg: str):
    dead = set()
    for ws in list(_clients):
        try:
            await ws.send_text(msg)
        except Exception:
            dead.add(ws)
    _clients.difference_update(dead)

def broadcast_from_thread(msg: str):
    if _main_loop and _clients:
        asyncio.run_coroutine_threadsafe(_broadcast(msg), _main_loop)

# ── Camera loop ───────────────────────────────────────────────────────────────
def _camera_loop():
    detector = GestureDetector()
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # minimal buffer = less lag

    print("[camera] started")

    try:
        while _running:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.02)
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            gesture, extra, hand_lm = detector.process(rgb)

            # Draw landmarks
            if hand_lm is not None:
                try:
                    mp_drawing.draw_landmarks(
                        frame, hand_lm, mp_hands_mod.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 255, 136), thickness=2, circle_radius=3),
                        mp_drawing.DrawingSpec(color=(200, 200, 200), thickness=1),
                    )
                except Exception:
                    pass

            # Execute mapped operation
            operation = "none"
            if gesture not in ("none", "unknown"):
                operation = _mapping.get(gesture, "none")
                if operation and operation != "none":
                    if operation == "mouse_control":
                        execute(operation, norm_x=extra.get("x", 0.5), norm_y=extra.get("y", 0.5))
                    else:
                        execute(operation)

            # Overlay text
            label = f"{gesture.replace('_',' ').upper()}"
            cv2.putText(frame, label, (10, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 136), 2)

            # Encode to JPEG
            _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 65])
            frame_b64 = base64.b64encode(buf.tobytes()).decode()

            broadcast_from_thread(json.dumps({
                "gesture": gesture,
                "operation": operation,
                "frame": frame_b64,
            }))

    finally:
        cap.release()
        detector.close()
        print("[camera] stopped")

# ── REST endpoints ────────────────────────────────────────────────────────────
@app.get("/ping")
def ping(): return "ok"

@app.get("/gestures")
def get_gestures(): return GESTURES

@app.get("/operations")
def get_operations(): return OPERATIONS

@app.get("/config")
def get_config():
    cfg = load()
    return {"configured": cfg is not None, "mapping": cfg or {}}

@app.post("/config")
def post_config(body: dict):
    """Save operation->gesture mapping, build reverse map for fast lookup."""
    global _mapping
    op_to_gesture = body.get("mapping", {})
    save(op_to_gesture)
    # Reverse: gesture -> operation (for camera loop)
    _mapping = {v: k for k, v in op_to_gesture.items()}
    return {"ok": True}

@app.post("/config/reset")
def reset_config():
    global _mapping
    reset()
    _mapping = {}
    return {"ok": True}

@app.post("/start")
def start():
    global _running, _camera_thread
    if _running:
        return {"ok": True}
    _running = True
    _camera_thread = threading.Thread(target=_camera_loop, daemon=True)
    _camera_thread.start()
    return {"ok": True}

@app.post("/stop")
def stop():
    global _running
    _running = False
    return {"ok": True}

@app.get("/status")
def status():
    return {"running": _running}

@app.post("/quit")
def quit_server():
    global _running
    _running = False
    def _kill():
        time.sleep(0.4)
        os.kill(os.getpid(), signal.SIGTERM)
    threading.Thread(target=_kill, daemon=True).start()
    return {"ok": True}

# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    _clients.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        _clients.discard(ws)
    except Exception:
        _clients.discard(ws)

# ── Entry ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8765, reload=False, log_level="warning")