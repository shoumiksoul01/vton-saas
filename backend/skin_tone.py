import cv2
import numpy as np
from sklearn.cluster import KMeans
import base64


# ── Seasonal palette definitions ──────────────────────────────────────────────
SEASONAL_PALETTES = {
    "Spring": {
        "undertone": "Warm",
        "description": "Light, warm, and clear tones",
        "colors": [
            {"hex": "#FF7F50", "name": "Coral"},
            {"hex": "#FFB347", "name": "Peach"},
            {"hex": "#FFDAB9", "name": "Warm Ivory"},
            {"hex": "#90EE90", "name": "Light Green"},
            {"hex": "#FFD700", "name": "Golden Yellow"},
            {"hex": "#FF6B6B", "name": "Warm Pink"},
        ]
    },
    "Summer": {
        "undertone": "Cool",
        "description": "Light, cool, and muted tones",
        "colors": [
            {"hex": "#B0C4DE", "name": "Steel Blue"},
            {"hex": "#DDA0DD", "name": "Plum"},
            {"hex": "#E6E6FA", "name": "Lavender"},
            {"hex": "#BC8F8F", "name": "Dusty Rose"},
            {"hex": "#708090", "name": "Slate Grey"},
            {"hex": "#C0A0A0", "name": "Mauve"},
        ]
    },
    "Autumn": {
        "undertone": "Warm",
        "description": "Deep, warm, and muted tones",
        "colors": [
            {"hex": "#8B4513", "name": "Saddle Brown"},
            {"hex": "#D2691E", "name": "Chocolate"},
            {"hex": "#DAA520", "name": "Goldenrod"},
            {"hex": "#556B2F", "name": "Olive Green"},
            {"hex": "#8B0000", "name": "Deep Red"},
            {"hex": "#CD853F", "name": "Peru"},
        ]
    },
    "Winter": {
        "undertone": "Cool",
        "description": "Deep, cool, and clear tones",
        "colors": [
            {"hex": "#000080", "name": "Navy Blue"},
            {"hex": "#006400", "name": "Emerald"},
            {"hex": "#8B0000", "name": "Burgundy"},
            {"hex": "#1C1C1C", "name": "Charcoal"},
            {"hex": "#FFFFFF", "name": "Pure White"},
            {"hex": "#800080", "name": "Royal Purple"},
        ]
    }
}


def decode_base64_image(b64_string: str) -> np.ndarray:
    """Decode a base64 image string to a numpy array (BGR)."""
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    img_bytes = base64.b64decode(b64_string)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return img


def extract_skin_pixels(img_bgr: np.ndarray) -> np.ndarray:
    """
    Extract skin-colored pixels from image using HSV range filtering.
    Focuses on the upper third of the image (face/neck area).
    """
    h, w = img_bgr.shape[:2]
    # Crop to upper third — face/neck area
    upper = img_bgr[:h // 3, :]

    img_hsv = cv2.cvtColor(upper, cv2.COLOR_BGR2HSV)

    # HSV range covering most human skin tones
    lower = np.array([0, 20, 70], dtype=np.uint8)
    upper_bound = np.array([35, 180, 255], dtype=np.uint8)
    mask = cv2.inRange(img_hsv, lower, upper_bound)

    skin_pixels = upper[mask > 0]
    return skin_pixels


def get_dominant_color(pixels: np.ndarray, k: int = 3) -> np.ndarray:
    """Run k-means on skin pixels and return the dominant cluster center."""
    if len(pixels) < k:
        # Not enough pixels — return a neutral mid-tone
        return np.array([172, 130, 100])

    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    kmeans.fit(pixels)

    # Pick the largest cluster
    counts = np.bincount(kmeans.labels_)
    dominant = kmeans.cluster_centers_[np.argmax(counts)]
    return dominant  # BGR order


def bgr_to_hex(bgr: np.ndarray) -> str:
    b, g, r = int(bgr[0]), int(bgr[1]), int(bgr[2])
    return f"#{r:02X}{g:02X}{b:02X}"


def classify_season(bgr: np.ndarray) -> str:
    """
    Classify skin tone into a seasonal color category.
    Uses brightness (value) and warm/cool hue to determine season.
    """
    img_pixel = np.uint8([[bgr]])
    hsv = cv2.cvtColor(img_pixel, cv2.COLOR_BGR2HSV)[0][0]
    hue, sat, val = int(hsv[0]), int(hsv[1]), int(hsv[2])

    # Warm hue: 0-25 (red-orange-yellow range in OpenCV's 0-179 scale)
    is_warm = hue <= 25 or hue >= 160
    is_light = val >= 140

    if is_warm and is_light:
        return "Spring"
    elif not is_warm and is_light:
        return "Summer"
    elif is_warm and not is_light:
        return "Autumn"
    else:
        return "Winter"


def analyze_skin_tone(person_image_b64: str) -> dict:
    """
    Main entry point. Takes a base64 person image, returns skin tone analysis.
    Returns a safe fallback dict if anything fails — never raises an exception.
    """
    try:
        img = decode_base64_image(person_image_b64)
        if img is None:
            raise ValueError("Could not decode image")

        skin_pixels = extract_skin_pixels(img)

        if len(skin_pixels) < 10:
            # Too few skin pixels detected — lighting or crop issue
            return _fallback_result()

        dominant_bgr = get_dominant_color(skin_pixels)
        hex_color = bgr_to_hex(dominant_bgr)
        season = classify_season(dominant_bgr)
        palette_info = SEASONAL_PALETTES[season]

        return {
            "season": season,
            "undertone": palette_info["undertone"],
            "detected_hex": hex_color,
            "suggested_palette": palette_info["colors"]
        }

    except Exception:
        return _fallback_result()


def _fallback_result() -> dict:
    """Returned when skin detection fails — neutral universal palette."""
    return {
        "season": "Universal",
        "undertone": "Neutral",
        "detected_hex": "#C68642",
        "suggested_palette": [
            {"hex": "#FFFFFF", "name": "White"},
            {"hex": "#1C1C1C", "name": "Charcoal"},
            {"hex": "#000080", "name": "Navy"},
            {"hex": "#556B2F", "name": "Olive"},
            {"hex": "#8B0000", "name": "Burgundy"},
            {"hex": "#DAA520", "name": "Goldenrod"},
        ]
    }
