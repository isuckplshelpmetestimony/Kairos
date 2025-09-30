import os
import pandas as pd

from src.scraper.scraper import scraper

def main():
    # Prompt the user for inputs
    province = input("Please enter the province: ")
    property_type = input("Please enter the property type: ")
    num = int(input("Please enter the number of properties to scrape: "))

    # Call the scraper function with user inputs
    df = scraper(province, property_type, num)
    # Ensure backend data directory exists and write unified output.csv
    try:
        os.makedirs("data", exist_ok=True)
        df.to_csv("data/output.csv", index=False)
    except Exception:
        # Fallback: print head for manual runs
        print(df.head(10))

if __name__ == "__main__":
    main()