"""Windows OS actions for GestureFlow."""

import os, time, datetime, threading
import pyautogui

# Lazy-load pycaw and sbc in a thread to avoid blocking startup
PYCAW_OK = False
SBC_OK = False
_vol = None

def _init_audio():
    global PYCAW_OK, _vol
    try:
        from ctypes import cast, POINTER
        from comtypes import CLSCTX_ALL
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
        _vol = cast(
            AudioUtilities.GetSpeakers().Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None),
            POINTER(IAudioEndpointVolume)
        )
        PYCAW_OK = True
    except Exception as e:
        print(f"[audio] pycaw unavailable: {e}")

def _init_brightness():
    global SBC_OK
    try:
        import screen_brightness_control as _sbc
        _sbc.get_brightness(display=0)
        SBC_OK = True
    except Exception as e:
        print(f"[brightness] sbc unavailable: {e}")

threading.Thread(target=_init_audio, daemon=True).start()
threading.Thread(target=_init_brightness, daemon=True).start()

pyautogui.FAILSAFE = False
_SW, _SH = pyautogui.size()

# ── Volume ──────────────────────────────────────────────────────────────────
def volume_up():
    try:
        from ctypes import cast, POINTER
        from comtypes import CLSCTX_ALL
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
        vol = cast(AudioUtilities.GetSpeakers().Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None), POINTER(IAudioEndpointVolume))
        vol.SetMasterVolumeLevelScalar(min(1.0, vol.GetMasterVolumeLevelScalar() + 0.05), None)
    except Exception:
        pyautogui.press("volumeup")

def volume_down():
    try:
        from ctypes import cast, POINTER
        from comtypes import CLSCTX_ALL
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
        vol = cast(AudioUtilities.GetSpeakers().Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None), POINTER(IAudioEndpointVolume))
        vol.SetMasterVolumeLevelScalar(max(0.0, vol.GetMasterVolumeLevelScalar() - 0.05), None)
    except Exception:
        pyautogui.press("volumedown")

def mute_toggle():
    try:
        from ctypes import cast, POINTER
        from comtypes import CLSCTX_ALL
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
        vol = cast(AudioUtilities.GetSpeakers().Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None), POINTER(IAudioEndpointVolume))
        vol.SetMute(not vol.GetMute(), None)
    except Exception:
        pyautogui.press("volumemute")

# ── Scroll ───────────────────────────────────────────────────────────────────
def scroll_up():   pyautogui.scroll(8)
def scroll_down(): pyautogui.scroll(-8)

# ── Mouse ────────────────────────────────────────────────────────────────────
_prev_x, _prev_y = _SW // 2, _SH // 2

def mouse_control(norm_x: float, norm_y: float):
    global _prev_x, _prev_y
    # Flip x (camera is mirrored), clamp
    tx = int((1 - norm_x) * _SW)
    ty = int(norm_y * _SH)
    # Smooth lerp — 35% towards target each frame
    nx = int(_prev_x + (tx - _prev_x) * 0.35)
    ny = int(_prev_y + (ty - _prev_y) * 0.35)
    pyautogui.moveTo(nx, ny, _pause=False)
    _prev_x, _prev_y = nx, ny

def left_click():
    pyautogui.click()

# ── Screenshot ───────────────────────────────────────────────────────────────
def screenshot():
    folder = os.path.join(os.path.expanduser("~"), "Pictures", "GestureFlow")
    os.makedirs(folder, exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(folder, f"gesture_{ts}.png")
    pyautogui.screenshot(path)

# ── Brightness ───────────────────────────────────────────────────────────────
def brightness_up():
    if not SBC_OK: return
    try:
        import screen_brightness_control as sbc
        sbc.set_brightness(min(100, sbc.get_brightness(display=0)[0] + 5), display=0)
    except Exception: pass

def brightness_down():
    if not SBC_OK: return
    try:
        import screen_brightness_control as sbc
        sbc.set_brightness(max(0, sbc.get_brightness(display=0)[0] - 5), display=0)
    except Exception: pass

# ── Zoom ─────────────────────────────────────────────────────────────────────
def zoom_in():  pyautogui.hotkey("ctrl", "+")
def zoom_out(): pyautogui.hotkey("ctrl", "-")

# ── Dispatcher ───────────────────────────────────────────────────────────────
CONTINUOUS = {"mouse_control"}
COOLDOWN   = 0.35
_last: dict[str, float] = {}

ACTION_FN = {
    "volume_up":       volume_up,
    "volume_down":     volume_down,
    "mute_toggle":     mute_toggle,
    "scroll_up":       scroll_up,
    "scroll_down":     scroll_down,
    "mouse_control":   mouse_control,
    "left_click":      left_click,
    "screenshot":      screenshot,
    "brightness_up":   brightness_up,
    "brightness_down": brightness_down,
    "zoom_in":         zoom_in,
    "zoom_out":        zoom_out,
}

def execute(operation_id: str, **kwargs) -> bool:
    fn = ACTION_FN.get(operation_id)
    if not fn:
        return False

    now = time.time()
    if operation_id not in CONTINUOUS:
        if now - _last.get(operation_id, 0) < COOLDOWN:
            return False
        _last[operation_id] = now

    try:
        fn(**kwargs)
        return True
    except Exception as e:
        print(f"[action] {operation_id} failed: {e}")
        return False