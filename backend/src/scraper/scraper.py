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
    base_list_url = f'https://www.lamudi.com.ph/buy/{province}/{property_type}/'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': base_list_url,
    }
    URL = base_list_url
    page = requests.get(URL, headers=headers, timeout=15)
    soup = bs(page.content, 'html.parser')
    div = soup.find('div', class_='BaseSection Pagination')
    # Guard: if pagination container is missing, assume single page
    try:
        max_page_num = int(div.get('data-pagination-end')) if div else 1
    except Exception:
        max_page_num = 1

    for page_num in range(1, max_page_num + 1):
        try:
            if page_num == 1:
                URL = base_list_url
            else:
                URL = f'https://www.lamudi.com.ph/buy/{province}/{property_type}/?page={page_num}'
            print(f"Scraping page {page_num}...")
            page = requests.get(URL, headers=headers, timeout=15)
            soup = bs(page.content, 'html.parser')
            results_link = soup.find_all("div", attrs={"class": "row ListingCell-row ListingCell-agent-redesign"})
            results_sku = soup.find_all("div", attrs={"class": "ListingCell-MainImage"})
            print(f"Found {len(results_sku)} results on page {page_num}...")
            # Short-circuit if page 1 has zero listings
            if page_num == 1 and len(results_sku) == 0:
                try:
                    status_code = getattr(page, 'status_code', None)
                except Exception:
                    status_code = None
                print({
                    'level': 'warn',
                    'event': 'no_cards_found',
                    'page': 1,
                    'status_code': status_code,
                    'url': URL,
                    'reason': 'selector_miss',
                })
                # Return empty DataFrame immediately
                empty = pd.DataFrame(columns=['SKU','Name','Location','City/Town','TCP','Floor_Area'])
                return empty
        except Exception as e:
            print(f"Error on page {page_num}: {e}")
            continue  # Continue to the next page instead of breaking

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

        if count >= num:
            break

    # Convert the listing list to a DataFrame
    listing_df = pd.DataFrame(listing, columns=['SKU', 'link'])
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
        all_loc = soup.find_all("h3", attrs={"class": "Title-pdp-address"})
        all_price = soup.find_all("div", attrs={"class": "Title-pdp-price"})
        all_features = soup.find_all("div", attrs={"class": "columns medium-6 small-6 striped"})
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

        latitude = ''
        longitude = ''
        for each in all_lat_long:
            longitude = each.get('data-lon', '')
            latitude = each.get('data-lat', '')

        try:
            prop_details["SKU"] = all_sku["data-sku"] if all_sku else ''
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