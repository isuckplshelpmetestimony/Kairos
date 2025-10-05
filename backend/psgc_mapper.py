"""
PSGC → Lamudi province mapper (minimal v1)
- Whitelist only. Reject unknowns explicitly.
- Keep mapping small and maintainable for demo; expand over time.
"""
from typing import Dict, Optional

# Expanded whitelist: NCR + major provinces nationwide
_PSGC_TO_LAMUDI: Dict[str, str] = {
    # NCR and nearby provinces (original codes)
    "1376": "metro-manila",  # NCR - Metro Manila
    "3400": "cavite",        # Cavite (original code)
    "4000": "laguna",        # Laguna (original code)
    
    # Additional major provinces (using original format)
    "0722": "cebu",          # Cebu
    "0630": "iloilo",        # Iloilo
    "0645": "negros-occidental",  # Negros Occidental
    "0973": "zamboanga-del-sur",  # Zamboanga del Sur
    "1043": "misamis-oriental",   # Misamis Oriental
    "1124": "davao-del-sur",      # Davao del Sur
    "1411": "benguet",       # Benguet (Baguio)
    "0458": "rizal",         # Rizal
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
