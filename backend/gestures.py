"""
Central definitions for GestureFlow.
15 gestures × 10 operations.
"""

GESTURES = [
    {"id": "open_palm",      "name": "Open Palm",      "emoji": "✋", "desc": "All five fingers spread open"},
    {"id": "fist",           "name": "Closed Fist",    "emoji": "✊", "desc": "All fingers curled into a fist"},
    {"id": "index_up",       "name": "Point Up",       "emoji": "☝️", "desc": "Only index finger pointing up"},
    {"id": "peace",          "name": "Peace Sign",     "emoji": "✌️", "desc": "Index and middle fingers in a V"},
    {"id": "three_fingers",  "name": "Three Fingers",  "emoji": "🤟", "desc": "Index, middle, and ring extended"},
    {"id": "four_fingers",   "name": "Four Fingers",   "emoji": "🖐️", "desc": "All fingers except thumb"},
    {"id": "thumbs_up",      "name": "Thumbs Up",      "emoji": "👍", "desc": "Thumb pointing upward"},
    {"id": "thumbs_down",    "name": "Thumbs Down",    "emoji": "👎", "desc": "Thumb pointing downward"},
    {"id": "hang_loose",     "name": "Hang Loose",     "emoji": "🤙", "desc": "Thumb and pinky extended"},
    {"id": "rock_on",        "name": "Rock On",        "emoji": "🤘", "desc": "Index and pinky extended"},
    {"id": "pinch_close",    "name": "Pinch Close",    "emoji": "🤏", "desc": "Thumb and index tips touching"},
    {"id": "pinch_open",     "name": "Pinch Open",     "emoji": "🫰", "desc": "Thumb and index spread wide"},
    {"id": "ok_sign",        "name": "OK Sign",        "emoji": "👌", "desc": "Thumb and index form a circle"},
    {"id": "vulcan",         "name": "Vulcan",         "emoji": "🖖", "desc": "Middle+ring split from index+pinky"},
    {"id": "point_forward",  "name": "Point Forward",  "emoji": "👉", "desc": "Index finger pointing sideways"},
]

OPERATIONS = [
    {"id": "volume_up",       "name": "Volume Up",       "emoji": "🔊", "group": "Audio"},
    {"id": "volume_down",     "name": "Volume Down",     "emoji": "🔉", "group": "Audio"},
    {"id": "mute_toggle",     "name": "Mute / Unmute",   "emoji": "🔇", "group": "Audio"},
    {"id": "scroll_up",       "name": "Scroll Up",       "emoji": "⬆️",  "group": "Navigation"},
    {"id": "scroll_down",     "name": "Scroll Down",     "emoji": "⬇️",  "group": "Navigation"},
    {"id": "mouse_control",   "name": "Mouse Control",   "emoji": "🖱️",  "group": "Mouse"},
    {"id": "left_click",      "name": "Left Click",      "emoji": "👆",  "group": "Mouse"},
    {"id": "screenshot",      "name": "Screenshot",      "emoji": "📸", "group": "System"},
    {"id": "brightness_up",   "name": "Brightness Up",   "emoji": "☀️",  "group": "Display"},
    {"id": "brightness_down", "name": "Brightness Down", "emoji": "🌙", "group": "Display"},
]

# Default mapping: operation_id -> gesture_id
DEFAULT_MAPPING = {
    "volume_up":       "thumbs_up",
    "volume_down":     "thumbs_down",
    "mute_toggle":     "rock_on",
    "scroll_up":       "peace",
    "scroll_down":     "three_fingers",
    "mouse_control":   "index_up",
    "left_click":      "ok_sign",
    "screenshot":      "open_palm",
    "brightness_up":   "hang_loose",
    "brightness_down": "fist",
}