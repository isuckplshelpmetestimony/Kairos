import pandas as pd
import numpy as np
import re
import requests
from bs4 import BeautifulSoup as bs
import time
import random
from tqdm import tqdm
import os

from src.utils.last_word import get_word_after_last_comma

def scraper(province, property_type, num):
    """
    Scrapes Lamudi website for properties.

    Args:
        province (str): Province to search for properties.
        property_type (str): Type of property to search for.
        num (int): Number of properties to scrape.

    Returns:
        pd.DataFrame: DataFrame containing scraped properties.
    """
    data = []
    listing = []
    links = []
    skus = set()  # Use a set to keep track of unique SKUs
    count = 0  # Initialize a counter
    print('SCRAPING. . .')

    # Get the maximum page number
    # Updated 2025-10-01: Fix URL case sensitivity
    province_lower = province.lower().replace('_', '-')
    base_list_url = f'https://www.lamudi.com.ph/buy/{province_lower}/{property_type}/'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': base_list_url,
    }
    # Reuse a single HTTP session to preserve cookies and reduce blocks
    session = requests.Session()
    try:
        session.headers.update(headers)
    except Exception:
        pass
    URL = base_list_url
    page = session.get(URL, timeout=15)
    soup = bs(page.content, 'html.parser')
    div = soup.find('div', class_='BaseSection Pagination')
    # Primary: use pagination container's data attribute
    try:
        max_page_num = int(div.get('data-pagination-end')) if div else 1
    except Exception:
        max_page_num = 1
    # Fallback: scan for page links like ?page=2 and take the max
    if max_page_num == 1:
        try:
            page_hrefs = [a.get('href', '') for a in soup.find_all('a', href=True)]
            page_numbers = []
            for href in page_hrefs:
                if 'page=' in href:
                    try:
                        page_num_candidate = int(re.findall(r'[?&]page=(\d+)', href)[0])
                        page_numbers.append(page_num_candidate)
                    except Exception:
                        pass
            if len(page_numbers):
                max_page_num = max(1, max(page_numbers))
        except Exception:
            pass

    # Apply soft cap for pages to scan via env SCRAPER_MAX_PAGES (default 5)
    try:
        max_pages_cap = int(os.getenv('SCRAPER_MAX_PAGES', '10'))
        if max_pages_cap < 1:
            max_pages_cap = 1
    except Exception:
        max_pages_cap = 10
    capped_max_page_num = min(max_page_num, max_pages_cap)
    # Use detected/capped pagination only
    pages_upper_bound = capped_max_page_num

    pages_scanned = 0

    for page_num in range(1, pages_upper_bound + 1):
        try:
            if page_num == 1:
                URL = base_list_url
            else:
                URL = f'https://www.lamudi.com.ph/buy/{province}/{property_type}/?page={page_num}'
            print(f"Scraping page {page_num}...")
            page = session.get(URL, timeout=15)
            pages_scanned += 1
            soup = bs(page.content, 'html.parser')
            results_link = soup.find_all("div", attrs={"class": "row ListingCell-row ListingCell-agent-redesign"})
            results_sku = soup.find_all("div", attrs={"class": "ListingCell-MainImage"})
            primary_count = len(results_sku)
            print(f"Found {primary_count} results on page {page_num} (primary selectors)...")

            # Fallback strategy: attribute/URL-based
            # 1) Attributes: [data-sku] or [data-listing-id] + first child <a>
            # 2) URL-based: anchors whose href contains '/property/' → derive SKU from href
            fallback_pairs = []
            sku_nodes = []
            try:
                sku_nodes = soup.select('[data-sku], [data-listing-id]')
            except Exception:
                sku_nodes = []
            for node in sku_nodes:
                try:
                    sku_val = node.get('data-sku') or node.get('data-listing-id')
                    if not sku_val:
                        continue
                    a_tag = node.find('a', href=True)
                    if not a_tag:
                        continue
                    href = a_tag.get('href')
                    if not href:
                        continue
                    # Only accept lamudi property paths (absolute or relative)
                    if ('lamudi.com.ph' in href) or href.startswith('/'):
                        # Normalize relative URL to absolute
                        if href.startswith('/'):
                            href = f'https://www.lamudi.com.ph{href}'
                        fallback_pairs.append((sku_val, href))
                except Exception:
                    continue

            # URL-based anchor scan (always, to capture extra links on page)
            try:
                anchors = soup.find_all('a', href=True)
                for a in anchors:
                    href = a.get('href') or ''
                    if '/property/' not in href:
                        continue
                    # Normalize
                    if href.startswith('/'):
                        href_abs = f'https://www.lamudi.com.ph{href}'
                    elif href.startswith('http'):
                        href_abs = href
                    else:
                        continue
                    # Updated 2025-10-01: Capture property slugs instead of numeric endings
                    match = re.findall(r'/property/([^/?#]+)', href_abs)
                    if not match:
                        continue
                    sku_val = match[-1]
                    fallback_pairs.append((sku_val, href_abs))
            except Exception:
                pass

            # Merge primary + fallback for candidates count only; dedupe via skus on insert
            merged_candidates = []
            try:
                if len(results_sku) and len(results_link):
                    merged_candidates.extend([(getattr(sku_tag.find('div'), 'get', lambda *_: None)('data-sku'), link_tag.find('a')['href']) for sku_tag, link_tag in zip(results_sku, results_link)])
            except Exception:
                pass
            merged_candidates.extend(fallback_pairs)
            total_candidates = len(merged_candidates)
            # Adaptive backoff: if first page shows zero candidates and looks like a bot challenge
            if page_num == 1 and total_candidates == 0:
                try:
                    text_sample = (soup.get_text(' ', strip=True) or '')[:2000].lower()
                    if ('security verification' in text_sample) or ('solve this math problem' in text_sample):
                        time.sleep(5)
                except Exception:
                    pass
            try:
                print({
                    'level': 'info',
                    'event': 'list_page_candidates',
                    'page': page_num,
                    'candidates_on_page': total_candidates,
                })
            except Exception:
                pass
            # Note: Previously, we short-circuited on page 1 with zero candidates.
            # We now continue to subsequent pages to improve resilience against
            # partial selector misses on the first page.
        except Exception as e:
            print(f"Error on page {page_num}: {e}")
            continue  # Continue to the next page instead of breaking

        if len(results_sku) and len(results_link):
            for sku_tag, link_tag in zip(results_sku, results_link):
                sku = sku_tag.find('div')["data-sku"]
                if sku in skus:  # If SKU is already in the set, skip it
                    continue
                skus.add(sku)  # Add SKU to the set
                link = link_tag.find('a')['href']
                listing.append([sku, link])
                count += 1
                if count >= num:
                    break
        # Always consider fallback-derived candidates as well
        if count < num and len(fallback_pairs):
            for sku, link in fallback_pairs:
                if sku in skus:
                    continue
                skus.add(sku)
                listing.append([sku, link])
                count += 1
                if count >= num:
                    break

        if count >= num:
            break

    # Convert the listing list to a DataFrame
    listing_df = pd.DataFrame(listing, columns=['SKU', 'link'])
    # Log pages_scanned for observability (server logs only)
    try:
        print({
            'level': 'info',
            'event': 'list_pages_scanned',
            'pages_scanned': pages_scanned,
            'capped_max_page_num': capped_max_page_num,
            'requested_num': int(num),
            'collected_links': int(len(listing_df)),
        })
    except Exception:
        pass
    # If no listings found, write empty CSVs and return empty DataFrame
    if listing_df.empty:
        os.makedirs("data/scraped/full", exist_ok=True)
        os.makedirs("data/scraped/info", exist_ok=True)
        os.makedirs("data/scraped/amenities", exist_ok=True)
        empty = pd.DataFrame(columns=['SKU','Name','Location','City/Town','TCP','Floor_Area','Bedrooms','Baths','Source'])
        file_name = f"{province}_{property_type}.csv"
        file_name_info = f"{province}_{property_type}_info.csv"
        file_name_amenities = f"{province}_{property_type}_amenities.csv"
        empty.to_csv(f"data/scraped/full/{file_name}", index=False)
        empty.to_csv(f"data/scraped/info/{file_name_info}", index=False)
        empty.to_csv(f"data/scraped/amenities/{file_name_amenities}", index=False)
        return empty

    links = listing_df['link']

    for index, each in tqdm(enumerate(links), total=len(links), desc="Processing details"):
        prop_details = {}
        amenities = []
        temp = []
        features = {}
        URL = each
        page = requests.get(URL, headers=headers, timeout=15)
        soup = bs(page.content, 'html.parser')

        all_sku = soup.find("div", attrs={"class": "Banner-Images"})
        all_amenities = soup.find_all("span", attrs={"class": "material-icons material-icons-outlined"})
        # Updated 2025-10-01: Lamudi redesign
        all_loc = soup.find_all("div", attrs={"class": "view-map__text"}) + soup.find_all("div", attrs={"class": "location-map__location-address-map"})
        all_price = soup.find_all("div", attrs={"class": "prices-and-fees__price"})
        all_features = soup.find_all("div", attrs={"class": "details-item-value"})
        all_lat_long = soup.find_all("div", attrs={"class": "LandmarksPDP-Wrapper"})

        try:
            all_agent_name = soup.find("div", attrs={"class": "AgentInfoV2-agent-name"}).get_text().strip()
            all_agent_agency = soup.find("div", attrs={"class": "AgentInfoV2-agent-agency"}).get_text().strip()
            all_overview = soup.find("div", attrs={"class": "ViewMore-text-description"}).get_text().strip().replace(
                '\n', '').replace('\xa0', '')
        except:
            all_agent_name = ''
            all_agent_agency = ''
            all_overview = ''

        for each in all_amenities:
            amenities.append(each.get_text().strip())

        loc_final = ''
        for each in all_loc:
            loc_text = each.get_text().strip().replace('\n', '')
            loc_final = re.sub(' +', ' ', loc_text)

        price = 0
        for each in all_price:
            try:
                price = each.get_text().replace('₱', '').replace(',', '').strip()
                price = int(price)
            except:
                price = each.get_text().replace('₱', '').replace(',', '').strip().split('\n')
                price = price[0].strip()
                try:
                    price = int(price)
                except:
                    price = 0

        # Fallback for price: attribute-based (data-price) or scoped numeric near Title-pdp-price
        if not price or price == 0:
            try:
                node = soup.select_one('[data-price]')
                if node:
                    raw = str(node.get('data-price', '')).replace(',', '').strip()
                    if raw:
                        price = int(float(raw))
            except Exception:
                pass
        if not price or price == 0:
            try:
                price_container = soup.find('div', attrs={'class': 'Title-pdp-price'})
                if price_container:
                    m = re.search(r'(\d[\d,]*)', price_container.get_text(' ', strip=True) or '')
                    if m:
                        price = int(m.group(1).replace(',', ''))
            except Exception:
                pass

        temp = []
        for each in all_features:
            details = each.get_text().strip().split('\n')
            for detail in details:
                detail = detail.strip()
                if detail != '':
                    temp.append(detail)

        features = {}
        for i in range(len(temp)):
            if i % 2 == 0:
                try:
                    features[temp[i]] = temp[i + 1]
                except:
                    pass

        # Attribute/text fallbacks for key fields when primary misses
        # Floor area (m²)
        try:
            fa_val = features.get('Floor area (m²)', '') if isinstance(features, dict) else ''
            if not fa_val:
                node = soup.select_one('[data-floor-area]')
                if node:
                    features['Floor area (m²)'] = str(node.get('data-floor-area', '')).strip()
            if 'Floor area (m²)' not in features or not str(features.get('Floor area (m²)', '')).strip():
                # Minimal regex: number + m² in a compact text node
                try:
                    candidate = soup.find(text=re.compile(r'\b\d[\d\.,]*\s*m²\b'))
                    if candidate:
                        m = re.search(r'(\d[\d\.,]*)\s*m²', candidate)
                        if m:
                            features['Floor area (m²)'] = m.group(1).replace(',', '')
                except Exception:
                    pass
        except Exception:
            pass

        # Bedrooms
        try:
            br_val = features.get('Bedrooms', '') if isinstance(features, dict) else ''
            if not br_val:
                node = soup.select_one('[data-bedrooms]')
                if node:
                    raw = str(node.get('data-bedrooms', '')).strip()
                    if raw:
                        features['Bedrooms'] = raw
            if 'Bedrooms' not in features or not str(features.get('Bedrooms', '')).strip():
                m = re.search(r'(\d+)\s*Bedrooms?', soup.get_text(' ', strip=True))
                if m:
                    features['Bedrooms'] = m.group(1)
        except Exception:
            pass

        # Baths
        try:
            ba_val = features.get('Baths', '') if isinstance(features, dict) else ''
            if not ba_val:
                node = soup.select_one('[data-bathrooms], [data-baths]')
                if node:
                    raw = (str(node.get('data-bathrooms', '') or node.get('data-baths', '')).strip())
                    if raw:
                        features['Baths'] = raw
            if 'Baths' not in features or not str(features.get('Baths', '')).strip():
                m = re.search(r'(\d+)\s*Baths?', soup.get_text(' ', strip=True))
                if m:
                    features['Baths'] = m.group(1)
        except Exception:
            pass

        latitude = ''
        longitude = ''
        for each in all_lat_long:
            longitude = each.get('data-lon', '')
            latitude = each.get('data-lat', '')

        try:
            # Updated 2025-10-01: Use SKU from listing DataFrame (URL-derived) instead of page attribute
            prop_details["SKU"] = listing_df.iloc[index]['SKU'] if index < len(listing_df) else ''
            prop_details['text_location'] = loc_final
            prop_details['price'] = price
            prop_details['amenities'] = amenities
            prop_details['features'] = features
            prop_details['latitude'] = latitude
            prop_details['longitude'] = longitude
            prop_details['agent_name'] = all_agent_name
            prop_details['agency_name'] = all_agent_agency
            prop_details['overview'] = all_overview

        except:
            pass

        data.append(prop_details)
        # Jittered delay between detail page fetches (0.3–0.8s)
        time.sleep(random.uniform(0.3, 0.8))

    listing_details_df = pd.DataFrame(data)

    # Exploding Amenities (guard for empty results)
    if len(listing_details_df) == 0:
        # No results; create empty frames to keep pipeline safe
        amenities_res = pd.DataFrame(index=listing_details_df.index)
        raw_df = listing_details_df.copy()
    else:
        amenities = pd.get_dummies(listing_details_df['amenities'].explode())
        amenities_res = amenities.groupby(amenities.index).sum()
        raw_df = pd.concat([listing_details_df, amenities_res], axis=1, ignore_index=False)
        raw_df = raw_df.join(pd.DataFrame.from_records(raw_df['features'].mask(raw_df.features.isna(), {}).tolist())).fillna(0)
    raw_df.drop(columns=['features', 'amenities'], inplace=True, errors='ignore')
    raw_df.drop_duplicates(keep='first', inplace=True)

    # Feature Selection
    staging_df = raw_df.merge(listing_df[['SKU', 'link']], on='SKU', how='left')
    cols = ['SKU', 'Condominium Name', 'text_location', 'price', 'Floor area (m²)', 'Bedrooms', 'Baths', 'gite', 'fitness_center', 'pool', 'security', 'camera_indoor', 'room_service', 'local_parking', 'link']
    staging_df = staging_df[[c for c in cols if c in staging_df.columns]]

    column_name_mapping = {
        'Condominium Name': 'Name',
        'text_location': 'Location',
        'price': 'TCP',
        'Floor area (m²)': 'Floor_Area',
        'gite': 'Club House',
        'fitness_center': 'Gym',
        'pool': 'Swimming Pool',
        'security': 'Security',
        'camera_indoor': 'CCTV',
        'room_service': 'Reception Area',
        'local_parking': 'Parking Area',
        'link': 'Source'
    }

    staging_df.rename(columns=column_name_mapping, inplace=True)
    if 'Location' in staging_df.columns:
        staging_df['Location'] = staging_df['Location'].astype(str)
        staging_df['City/Town'] = staging_df['Location'].apply(get_word_after_last_comma)
    staging_df['Province'] = province.upper() if len(staging_df) else province.upper()
    if 'Name' in staging_df.columns:
        staging_df['Name'] = staging_df['Name'].astype(str)
        staging_df['Name'] = staging_df['Name'].str.upper()

    info_cols = [c for c in ['SKU', 'Name', 'Location', 'City/Town', 'TCP', 'Floor_Area'] if c in staging_df.columns]
    amen_cols = [c for c in ['SKU', 'Name', 'Bedrooms', 'Baths', 'Club House', 'Gym', 'Swimming Pool', 'Security', 'CCTV', 'Reception Area', 'Parking Area', 'Source'] if c in staging_df.columns]
    info_df = staging_df[info_cols] if info_cols else pd.DataFrame(columns=['SKU','Name','Location','City/Town','TCP','Floor_Area'])
    amenities_df = staging_df[amen_cols] if amen_cols else pd.DataFrame(columns=['SKU','Name','Bedrooms','Baths','Club House','Gym','Swimming Pool','Security','CCTV','Reception Area','Parking Area','Source'])

    # Define File name
    file_name = f"{province}_{property_type}.csv"
    file_name_info = f"{province}_{property_type}_info.csv"
    file_name_amenities = f"{province}_{property_type}_amenities.csv"

    # Define File path
    path = f"data/scraped/full/{file_name}"
    path_info = f"data/scraped/info/{file_name_info}"
    path_amenities = f"data/scraped/amenities/{file_name_amenities}"

    # Ensure output directories exist
    try:
        os.makedirs("data/scraped/full", exist_ok=True)
        os.makedirs("data/scraped/info", exist_ok=True)
        os.makedirs("data/scraped/amenities", exist_ok=True)
    except Exception:
        pass

    # Save as csv
    staging_df.to_csv(path, index=False)
    info_df.to_csv(path_info, index=False)
    amenities_df.to_csv(path_amenities, index=False)

    return staging_df


# Example usage, which will only run if the script is executed directly
if __name__ == "__main__":
    province = input("Please enter the province: ")
    property_type = input("Please enter the property type: ")
    num = int(input("Please enter the number of properties to scrape: "))