import json, os
from gestures import DEFAULT_MAPPING

CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'gesture_config.json')

def load() -> dict:
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                data = json.load(f)
            return {**DEFAULT_MAPPING, **data.get("mapping", {})}
        except Exception:
            pass
    return None   # None means "not configured yet"

def save(mapping: dict):
    with open(CONFIG_PATH, 'w') as f:
        json.dump({"mapping": mapping}, f, indent=2)

def reset():
    if os.path.exists(CONFIG_PATH):
        os.remove(CONFIG_PATH)
