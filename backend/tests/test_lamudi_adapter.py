import pandas as pd

from src.adapters.lamudi_adapter import _normalize_row


def test_normalize_row_minimal_mapping():
    row = pd.Series({
        'SKU': 'ABC123',
        'Location': 'Taguig, Metro Manila',
        'TCP': '₱5,500,000',
        'Bedrooms': '2',
        'Baths': '1',
        'Floor_Area': '45',
        'Source': 'https://www.lamudi.com.ph/sample',
        'latitude': '14.52',
        'longitude': '121.05',
    })

    got = _normalize_row(row, 'condo')

    assert got['source'] == 'lamudi'
    assert got['property_id'] == 'ABC123'
    assert got['address'] == 'Taguig, Metro Manila'
    assert got['price'] == 5500000.0
    assert got['bedrooms'] == 2
    assert got['bathrooms'] == 1
    assert got['sqm'] == 45.0
    assert got['property_type'] == 'condo'
    assert got['coordinates'] == [14.52, 121.05]
    assert got['url'] == 'https://www.lamudi.com.ph/sample'
    assert isinstance(got['raw_data'], dict)


