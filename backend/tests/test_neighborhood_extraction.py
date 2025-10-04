import unittest
from src.utils.last_word import get_neighborhood_from_address


class TestNeighborhoodExtraction(unittest.TestCase):
    
    def test_basic_neighborhood_extraction(self):
        """Test basic neighborhood extraction from address strings."""
        # Test cases with various address formats
        test_cases = [
            ("BGC, Taguig", "BGC"),
            ("Makati CBD, Makati City", "Makati CBD"),
            ("Ortigas Center, Pasig", "Ortigas Center"),
            ("Eastwood City, Quezon City", "Eastwood City"),
            ("Bonifacio Global City, Taguig City", "Bonifacio Global City"),
            ("", ""),  # Empty string
            ("No comma here", ""),  # No comma
            ("Single,", "Single"),  # Single word before comma
            ("Multiple, commas, here", "Multiple"),  # Multiple commas
        ]
        
        for address, expected in test_cases:
            with self.subTest(address=address):
                result = get_neighborhood_from_address(address)
                self.assertEqual(result, expected)
    
    def test_edge_cases(self):
        """Test edge cases for neighborhood extraction."""
        # None input
        self.assertEqual(get_neighborhood_from_address(None), "")
        
        # Whitespace handling
        self.assertEqual(get_neighborhood_from_address("  BGC  , Taguig  "), "BGC")
        
        # Only comma
        self.assertEqual(get_neighborhood_from_address(","), "")
        
        # Comma at start
        self.assertEqual(get_neighborhood_from_address(", Taguig"), "")
    
    def test_philippine_addresses(self):
        """Test with common Philippine address formats."""
        test_cases = [
            ("Fort Bonifacio, Taguig", "Fort Bonifacio"),
            ("Rockwell Center, Makati", "Rockwell Center"),
            ("Ayala Center, Makati City", "Ayala Center"),
            ("Greenhills, San Juan", "Greenhills"),
            ("Cubao, Quezon City", "Cubao"),
        ]
        
        for address, expected in test_cases:
            with self.subTest(address=address):
                result = get_neighborhood_from_address(address)
                self.assertEqual(result, expected)


if __name__ == '__main__':
    unittest.main()
