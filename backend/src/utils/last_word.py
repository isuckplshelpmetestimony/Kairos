import pandas
import numpy
import re


def get_word_after_last_comma(address):
    """
    Extracts the word or phrase that comes after the last comma in a given address string.

    Parameters:
    address (str): The address string to search within.

    Returns:
    str: The word or phrase following the last comma. If no comma is found, returns an empty string.
    """
    match = re.search(r',\s*([^,]+)\s*$', address)
    return match.group(1).strip() if match else ''


def get_neighborhood_from_address(address):
    """
    Extracts the neighborhood/district from address string.
    Format: "Neighborhood, City" → returns "Neighborhood"
    
    Parameters:
    address (str): The address string to extract neighborhood from.
    
    Returns:
    str: The neighborhood part before the first comma. If no comma is found, returns an empty string.
    """
    if not address or ',' not in address:
        return ''
    return address.split(',')[0].strip()

# Example usage, which will only run if the script is executed directly
if __name__ == "__main__":
    address = input("Please enter an address: ")
    result = get_word_after_last_comma(address)
    print(f"The word after the last comma is: '{result}'")