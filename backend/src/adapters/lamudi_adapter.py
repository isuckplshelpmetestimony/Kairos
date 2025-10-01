import time
from typing import Any, Dict, List, Tuple, Optional

import pandas as pd

# Local import without introducing new deps
from src.scraper.scraper import scraper as lamudi_scraper


def _coerce_float(value: Any, default: float = 0.0) -> float:
    try:
        if pd.isna(value):
            return float(default)
        if isinstance(value, (int, float)):
            return float(value)
        # Strip currency/commas/common noise
        text = str(value).replace(',', '').replace('₱', '').strip()
        if text == '':
            return float(default)
        return float(text)
    except Exception:
        return float(default)


def _coerce_int(value: Any, default: int = 0) -> int:
    try:
        if pd.isna(value):
            return int(default)
        if isinstance(value, (int,)):
            return int(value)
        text = str(value).strip()
        if text == '':
            return int(default)
        return int(float(text))
    except Exception:
        return int(default)


def _build_coordinates(row: pd.Series) -> Optional[List[float]]:
    lat = row.get('latitude', None)
    lon = row.get('longitude', None)
    if lat in (None, '') or lon in (None, ''):
        return None
    try:
        return [float(lat), float(lon)]
    except Exception:
        return None


def _normalize_row(row: pd.Series, property_type: str) -> Dict[str, Any]:
    price_float = _coerce_float(row.get('TCP', 0.0), 0.0)
    normalized: Dict[str, Any] = {
        'source': 'lamudi',
        'property_id': ('' if pd.isna(row.get('SKU', None)) else str(row.get('SKU', ''))),
        'address': ('' if pd.isna(row.get('Location', None)) else str(row.get('Location', ''))),
        'price': price_float,
        'bedrooms': _coerce_int(row.get('Bedrooms', 0), 0),
        'bathrooms': _coerce_int(row.get('Baths', 0), 0),
        'sqm': _coerce_float(row.get('Floor_Area', 0.0), 0.0),
        'property_type': property_type,
        'coordinates': _build_coordinates(row),
        'url': ('' if pd.isna(row.get('Source', None)) else str(row.get('Source', ''))),
    }
    return normalized


def scrape_and_normalize(province_slug: str, property_type: str, count: int) -> Tuple[List[Dict[str, Any]], List[float]]:
    """
    Execute the existing Lamudi scraper and map the resulting staging DataFrame
    into a canonical property list and price series.

    Returns up to 10 properties to keep response size consistent with current API.
    """
    start_ts = time.time()
    properties: List[Dict[str, Any]] = []
    price_series: List[float] = []
    reason: Optional[str] = None

    try:
        staging_df: pd.DataFrame = lamudi_scraper(province_slug, property_type, count)
        if staging_df is None or staging_df.empty:
            reason = 'selector_miss'  # conservative default for empty
            duration_ms = int((time.time() - start_ts) * 1000)
            print({
                'level': 'warn',
                'event': 'lamudi_adapter_empty',
                'province': province_slug,
                'property_type': property_type,
                'count': int(count),
                'duration_ms': duration_ms,
                'properties_len': 0,
                'reason': reason,
            })
            return [], []

        # Ensure expected columns exist to avoid KeyErrors during normalization
        for missing in ['SKU', 'Location', 'TCP', 'Bedrooms', 'Baths', 'Floor_Area', 'Source']:
            if missing not in staging_df.columns:
                staging_df[missing] = pd.NA

        # Map rows
        for _, row in staging_df.iterrows():
            normalized = _normalize_row(row, property_type)
            properties.append(normalized)
            price_series.append(float(normalized['price']))

        # Cap properties to 100 for response parity, but keep full price_series for stats
        if len(properties) > 100:
            properties = properties[:100]

        duration_ms = int((time.time() - start_ts) * 1000)
        print({
            'level': 'info',
            'event': 'lamudi_adapter_success',
            'province': province_slug,
            'property_type': property_type,
            'count': int(count),
            'duration_ms': duration_ms,
            'properties_len': len(properties),
        })
        return properties, price_series
    except Exception:
        duration_ms = int((time.time() - start_ts) * 1000)
        print({
            'level': 'error',
            'event': 'lamudi_adapter_exception',
            'province': province_slug,
            'property_type': property_type,
            'count': int(count),
            'duration_ms': duration_ms,
        })
        return [], []


