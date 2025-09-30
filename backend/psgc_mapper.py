"""
PSGC → Lamudi province mapper (minimal v1)
- Whitelist only. Reject unknowns explicitly.
- Keep mapping small and maintainable for demo; expand over time.
"""
from typing import Dict, Optional

# Minimal whitelist: NCR + nearby provinces
_PSGC_TO_LAMUDI: Dict[str, str] = {
    "1376": "metro-manila",  # NCR
    "3400": "cavite",
    "4000": "laguna",
}


def to_lamudi_province(psgc_province_code: str) -> Optional[str]:
    """Return Lamudi province slug or None if unmapped/unknown.

    - Accepts string PSGC code (e.g., "1376").
    - Returns province slug expected by the Lamudi scraper (e.g., "metro-manila").
    - Unknown codes return None; caller should handle with a sanitized 400.
    """
    code = (psgc_province_code or "").strip()
    if not code or len(code) > 8:
        return None
    return _PSGC_TO_LAMUDI.get(code)


def is_supported(psgc_province_code: str) -> bool:
    """True if the PSGC code is in the whitelist."""
    return to_lamudi_province(psgc_province_code) is not None


__all__ = [
    "to_lamudi_province",
    "is_supported",
]
