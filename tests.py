import unittest
import json
from app import app

class TestPayoutDashboardAPI(unittest.TestCase):
    """Test cases for Payout Dashboard API endpoints"""
    
    def setUp(self):
        """Set up test client"""
        self.app = app.test_client()
        self.app.testing = True
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_missing_destination_id(self):
        """Test API response when destination_id is missing"""
        response = self.app.get('/api/payout/dashboard')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'destination_id is required')
    
    # Add more tests as needed

if __name__ == '__main__':
    unittest.main() 