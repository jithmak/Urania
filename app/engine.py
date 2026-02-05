# ------------------------------
# engine.py
# Compatibility "brain" (v0 fake)
# ------------------------------

# # Helper: clamp a number between 0 and 100
def _clamp(n: int, low: int = 0, high: int = 100) -> int:
    # # Ensure score stays inside 0-100
    return max(low, min(high, n))

# # Helper: deterministic string hash (stable across runs)
def _simple_hash(text: str) -> int:
    # # A small deterministic hash (not Python's built-in hash)
    h = 0
    for ch in text:
        h = (h * 31 + ord(ch)) % 1000000007
    return h

# # Main function that main.py imports
def compute_compatibility(you: dict, partner: dict) -> dict:
    # # Build a deterministic seed from inputs
    seed_text = (
        f"{you.get('dob','')}|{you.get('time','')}|{you.get('place','')}|{you.get('lagna','')}"
        f"::"
        f"{partner.get('dob','')}|{partner.get('time','')}|{partner.get('place','')}|{partner.get('lagna','')}"
    )
    seed = _simple_hash(seed_text)

    # # Base score (55..95)
    base = 55 + (seed % 41)

    # # Bonus: if birth months are close, add a small bonus
    try:
        month_a = int(str(you.get("dob", ""))[5:7])
        month_b = int(str(partner.get("dob", ""))[5:7])
        month_bonus = 10 - abs(month_a - month_b)  # closer month -> higher
    except Exception:
        month_bonus = 0

    overall = _clamp(int(round(base + month_bonus / 2)))

    # # Mini scores around overall (deterministic offsets)
    minis = [
        {"label": "Love", "value": _clamp(overall + ((seed // 3) % 11) - 5)},
        {"label": "Trust", "value": _clamp(overall + ((seed // 7) % 11) - 5)},
        {"label": "Communication", "value": _clamp(overall + ((seed // 11) % 11) - 5)},
        {"label": "Growth", "value": _clamp(overall + ((seed // 15) % 11) - 5)},
        {"label": "Energy", "value": _clamp(overall + ((seed // 19) % 11) - 5)},
    ]

    strengths = [
        "You two recover quickly after small conflicts.",
        "Good balance: one initiates, the other stabilizes.",
        "Strong forward momentum when you agree on a goal.",
    ]

    watchouts = [
        "Don’t assume — communicate the obvious clearly.",
        "Avoid trying to ‘win’ arguments; focus on solving.",
    ]

    # # Return result pack
    return {
        "overall": overall,
        "minis": minis,
        "strengths": strengths,
        "watchouts": watchouts,
    }
