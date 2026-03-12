"""
MediaPipe-based gesture classifier for GestureFlow.
Detects all 15 defined gestures reliably.
"""

import math
import mediapipe as mp

mp_hands = mp.solutions.hands

# Landmark indices
WRIST, THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP = 0, 1, 2, 3, 4
INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP = 5, 6, 7, 8
MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP = 9, 10, 11, 12
RING_MCP, RING_PIP, RING_DIP, RING_TIP = 13, 14, 15, 16
PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP = 17, 18, 19, 20


def _dist(a, b) -> float:
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def _finger_up(tip, pip) -> bool:
    return tip.y < pip.y - 0.01


def classify(lm) -> tuple[str, dict]:
    """Classify landmarks into a gesture id + extra data."""

    # ── Finger states ─────────────────────────────────────────────────────
    idx  = _finger_up(lm[INDEX_TIP],  lm[INDEX_PIP])
    mid  = _finger_up(lm[MIDDLE_TIP], lm[MIDDLE_PIP])
    ring = _finger_up(lm[RING_TIP],   lm[RING_PIP])
    pnk  = _finger_up(lm[PINKY_TIP],  lm[PINKY_PIP])

    # Thumb: extended if tip is far from index MCP laterally
    thumb = _dist(lm[THUMB_TIP], lm[INDEX_MCP]) > 0.1

    count = sum([idx, mid, ring, pnk])

    # Index tip position (for mouse control)
    extra = {
        "x": lm[INDEX_TIP].x,
        "y": lm[INDEX_TIP].y,
        "wrist_x": lm[WRIST].x,
        "wrist_y": lm[WRIST].y,
    }

    # Pinch distances
    thumb_index_dist = _dist(lm[THUMB_TIP], lm[INDEX_TIP])
    thumb_mid_dist   = _dist(lm[THUMB_TIP], lm[MIDDLE_TIP])

    # ── Classification (order matters — specific first) ────────────────────

    # ── Fist FIRST — before any pinch checks ─────────────────────────────────
    # Fist: nothing extended
    if count == 0 and not thumb:
        return "fist", extra

    # Thumbs up: only thumb up
    if count == 0 and thumb and lm[THUMB_TIP].y < lm[THUMB_MCP].y:
        return "thumbs_up", extra

    # Thumbs down: only thumb down
    if count == 0 and thumb and lm[THUMB_TIP].y >= lm[THUMB_MCP].y:
        return "thumbs_down", extra

    # OK sign: thumb + index form circle, others up
    if thumb_index_dist < 0.05 and mid and ring and pnk:
        return "ok_sign", extra

    # Pinch close: thumb + index close, others curled
    if thumb_index_dist < 0.05 and not mid and not ring and not pnk:
        return "pinch_close", extra

    # Pinch open: index up, thumb extended sideways, others curled
    if idx and not mid and not ring and not pnk and thumb and thumb_index_dist > 0.15:
        return "pinch_open", extra

    # Open palm: all 4 + thumb
    if count == 4 and thumb:
        return "open_palm", extra

    # Four fingers: all 4, no thumb
    if count == 4 and not thumb:
        return "four_fingers", extra

    # Index only: pointing up / forward
    if idx and not mid and not ring and not pnk:
        if abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y) < 0.05:
            return "point_forward", extra
        return "index_up", extra

    # Peace: index + middle
    if idx and mid and not ring and not pnk:
        return "peace", extra

    # Three fingers: index + middle + ring
    if idx and mid and ring and not pnk:
        return "three_fingers", extra

    # Rock on: index + pinky
    if idx and not mid and not ring and pnk:
        return "rock_on", extra

    # Hang loose: thumb + pinky
    if not idx and not mid and not ring and pnk and thumb:
        return "hang_loose", extra

    # Vulcan: index+middle up together, ring+pinky up together, gap between pairs
    if idx and mid and ring and pnk:
        gap = abs(lm[MIDDLE_TIP].x - lm[RING_TIP].x)
        if gap > 0.05:
            return "vulcan", extra
        return "four_fingers", extra

    return "unknown", extra


class GestureDetector:
    def __init__(self):
        self.hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.72,
            min_tracking_confidence=0.65,
            model_complexity=0,   # fastest model
        )

    def process(self, rgb_frame):
        results = self.hands.process(rgb_frame)
        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            gesture, extra = classify(hand.landmark)
            return gesture, extra, hand   # return full hand object, not hand.landmark
        return "none", {}, None

    def close(self):
        self.hands.close()