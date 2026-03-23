#!/usr/bin/env python3
"""
FraudX Backend API Testing Suite
Tests all backend endpoints for the FraudX fraud detection app
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://fraudx-ai-detect.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class FraudXTester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FraudX-Test-Client/1.0'
        })
    
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        print()
    
    def test_health_check(self):
        """Test 1: GET /api/health"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("Health Check", True, f"Service: {data.get('service', 'Unknown')}, Version: {data.get('version', 'Unknown')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected status: {data.get('status')}", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
        return False
    
    def test_signup(self):
        """Test 2: POST /api/auth/signup"""
        try:
            # Use unique mobile number for testing
            test_mobile = f"8888888{int(time.time()) % 1000:03d}"
            signup_data = {
                "mobile": test_mobile,
                "password": "testpass123",
                "name": "Test User"
            }
            
            response = self.session.post(f"{API_BASE}/auth/signup", json=signup_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.log_test("User Signup", True, f"Created user: {data['user']['name']} ({data['user']['mobile']})")
                    return True
                else:
                    self.log_test("User Signup", False, "Missing success flag or token", data)
            else:
                self.log_test("User Signup", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("User Signup", False, f"Exception: {str(e)}")
        return False
    
    def test_login(self):
        """Test 3: POST /api/auth/login - Login with demo user"""
        try:
            login_data = {
                "mobile": "9999999999",
                "password": "test123",
                "device_id": "test-device-001"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.token = data['token']
                    self.user_id = data['user']['id']
                    self.session.headers['Authorization'] = f"Bearer {self.token}"
                    self.log_test("User Login", True, f"Logged in as: {data['user']['name']} (Balance: ₹{data['user']['balance']})")
                    return True
                else:
                    self.log_test("User Login", False, "Missing success flag or token", data)
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
        return False
    
    def test_get_profile(self):
        """Test 4: GET /api/user/profile"""
        if not self.token:
            self.log_test("Get User Profile", False, "No authentication token available")
            return False
        
        try:
            response = self.session.get(f"{API_BASE}/user/profile")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'name', 'mobile', 'balance', 'is_frozen']
                if all(field in data for field in required_fields):
                    self.log_test("Get User Profile", True, 
                                f"User: {data['name']}, Balance: ₹{data['balance']}, Frozen: {data['is_frozen']}")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Get User Profile", False, f"Missing fields: {missing}", data)
            else:
                self.log_test("Get User Profile", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get User Profile", False, f"Exception: {str(e)}")
        return False
    
    def test_get_transactions(self):
        """Test 5: GET /api/transactions"""
        if not self.token:
            self.log_test("Get Transactions", False, "No authentication token available")
            return False
        
        try:
            response = self.session.get(f"{API_BASE}/transactions")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check first transaction structure
                        tx = data[0]
                        required_fields = ['id', 'amount', 'receiver', 'risk_score', 'risk_level', 'status', 'fraud_reasons']
                        if all(field in tx for field in required_fields):
                            self.log_test("Get Transactions", True, 
                                        f"Retrieved {len(data)} transactions. Sample: ₹{tx['amount']} to {tx['receiver']} (Risk: {tx['risk_level']})")
                            return True
                        else:
                            missing = [f for f in required_fields if f not in tx]
                            self.log_test("Get Transactions", False, f"Missing fields in transaction: {missing}", tx)
                    else:
                        self.log_test("Get Transactions", True, "No transactions found (empty list)")
                        return True
                else:
                    self.log_test("Get Transactions", False, "Response is not a list", data)
            else:
                self.log_test("Get Transactions", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Transactions", False, f"Exception: {str(e)}")
        return False
    
    def test_create_low_risk_transaction(self):
        """Test 6: POST /api/transaction/create - Low risk transaction"""
        if not self.token:
            self.log_test("Create Low-Risk Transaction", False, "No authentication token available")
            return False
        
        try:
            tx_data = {
                "amount": 500,
                "upi_id": "grocery@paytm",
                "receiver_name": "Grocery Store",
                "location": {
                    "city": "Mumbai",
                    "lat": 19.076,
                    "lng": 72.877
                },
                "device_id": "test-device-001"
            }
            
            response = self.session.post(f"{API_BASE}/transaction/create", json=tx_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    is_suspicious = data.get('is_suspicious', True)
                    fraud_check = data.get('fraud_check', {})
                    self.log_test("Create Low-Risk Transaction", True, 
                                f"Transaction ID: {data.get('transaction_id')}, Status: {data.get('status')}, "
                                f"Suspicious: {is_suspicious}, Risk Score: {fraud_check.get('risk_score', 'N/A')}")
                    return data.get('transaction_id')
                else:
                    self.log_test("Create Low-Risk Transaction", False, "Transaction creation failed", data)
            else:
                self.log_test("Create Low-Risk Transaction", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create Low-Risk Transaction", False, f"Exception: {str(e)}")
        return None
    
    def test_create_high_risk_transaction(self):
        """Test 7: POST /api/transaction/create - High risk transaction"""
        if not self.token:
            self.log_test("Create High-Risk Transaction", False, "No authentication token available")
            return False
        
        try:
            tx_data = {
                "amount": 25000,
                "upi_id": "unknown@upi",
                "receiver_name": "Unknown Merchant",
                "location": {
                    "city": "Delhi",
                    "lat": 28.704,
                    "lng": 77.102
                },
                "device_id": "new-device-999"
            }
            
            response = self.session.post(f"{API_BASE}/transaction/create", json=tx_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    is_suspicious = data.get('is_suspicious', False)
                    fraud_check = data.get('fraud_check', {})
                    tx_id = data.get('transaction_id')
                    self.log_test("Create High-Risk Transaction", True, 
                                f"Transaction ID: {tx_id}, Status: {data.get('status')}, "
                                f"Suspicious: {is_suspicious}, Risk Score: {fraud_check.get('risk_score', 'N/A')}")
                    return tx_id
                else:
                    self.log_test("Create High-Risk Transaction", False, "Transaction creation failed", data)
            else:
                self.log_test("Create High-Risk Transaction", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create High-Risk Transaction", False, f"Exception: {str(e)}")
        return None
    
    def test_transaction_action(self, tx_id, action="block"):
        """Test 8: POST /api/transaction/{tx_id}/action"""
        if not self.token or not tx_id:
            self.log_test(f"Transaction Action ({action})", False, "No authentication token or transaction ID available")
            return False
        
        try:
            action_data = {"action": action}
            response = self.session.post(f"{API_BASE}/transaction/{tx_id}/action", json=action_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    message = data.get('message', 'Action completed')
                    freeze_info = f", Frozen until: {data.get('freeze_until', 'N/A')}" if action == "block" else ""
                    self.log_test(f"Transaction Action ({action})", True, 
                                f"Status: {data.get('status')}, Balance: ₹{data.get('new_balance')}{freeze_info}")
                    return True
                else:
                    self.log_test(f"Transaction Action ({action})", False, "Action failed", data)
            else:
                self.log_test(f"Transaction Action ({action})", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test(f"Transaction Action ({action})", False, f"Exception: {str(e)}")
        return False
    
    def test_unfreeze_account(self):
        """Test 9: POST /api/account/unfreeze"""
        if not self.token:
            self.log_test("Account Unfreeze", False, "No authentication token available")
            return False
        
        try:
            response = self.session.post(f"{API_BASE}/account/unfreeze")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Account Unfreeze", True, data.get('message', 'Account unfrozen'))
                    return True
                else:
                    self.log_test("Account Unfreeze", False, "Unfreeze failed", data)
            else:
                self.log_test("Account Unfreeze", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Account Unfreeze", False, f"Exception: {str(e)}")
        return False
    
    def test_qr_validation(self):
        """Test 10: POST /api/scan/validate"""
        if not self.token:
            self.log_test("QR Validation", False, "No authentication token available")
            return False
        
        try:
            qr_data = {
                "qr_string": "upi://pay?pa=merchant@upi&pn=TestMerchant&am=100"
            }
            
            response = self.session.post(f"{API_BASE}/scan/validate", json=qr_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('valid'):
                    self.log_test("QR Validation", True, 
                                f"UPI ID: {data.get('upi_id')}, Name: {data.get('name')}, Amount: ₹{data.get('amount', 'N/A')}")
                    return True
                else:
                    self.log_test("QR Validation", False, "QR marked as invalid", data)
            else:
                self.log_test("QR Validation", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("QR Validation", False, f"Exception: {str(e)}")
        return False
    
    def test_chatbot(self):
        """Test 11: POST /api/chatbot"""
        if not self.token:
            self.log_test("AI Chatbot", False, "No authentication token available")
            return False
        
        try:
            chat_data = {
                "message": "How to stay safe from UPI fraud?",
                "session_id": "test-session-001"
            }
            
            response = self.session.post(f"{API_BASE}/chatbot", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('response'):
                    response_text = data['response'][:100] + "..." if len(data['response']) > 100 else data['response']
                    self.log_test("AI Chatbot", True, f"Response: {response_text}")
                    return True
                else:
                    self.log_test("AI Chatbot", False, "No response from chatbot", data)
            else:
                self.log_test("AI Chatbot", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Chatbot", False, f"Exception: {str(e)}")
        return False
    
    def test_location_update(self):
        """Test 12: POST /api/location/update"""
        if not self.token:
            self.log_test("Location Update", False, "No authentication token available")
            return False
        
        try:
            location_data = {
                "latitude": 19.076,
                "longitude": 72.877,
                "city": "Mumbai"
            }
            
            response = self.session.post(f"{API_BASE}/location/update", json=location_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Location Update", True, data.get('message', 'Location updated'))
                    return True
                else:
                    self.log_test("Location Update", False, "Location update failed", data)
            else:
                self.log_test("Location Update", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Location Update", False, f"Exception: {str(e)}")
        return False
    
    def test_error_cases(self):
        """Test error cases"""
        print("=== Testing Error Cases ===")
        
        # Test 1: Login with wrong password
        try:
            wrong_login = {
                "mobile": "9999999999",
                "password": "wrongpassword"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=wrong_login)
            if response.status_code == 401:
                self.log_test("Wrong Password Login", True, "Correctly rejected invalid credentials")
            else:
                self.log_test("Wrong Password Login", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Wrong Password Login", False, f"Exception: {str(e)}")
        
        # Test 2: Access protected endpoint without token
        try:
            temp_headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.get(f"{API_BASE}/user/profile")
            if response.status_code == 401:
                self.log_test("No Token Access", True, "Correctly rejected request without token")
            else:
                self.log_test("No Token Access", False, f"Expected 401, got {response.status_code}")
            
            # Restore headers
            self.session.headers.update(temp_headers)
        except Exception as e:
            self.log_test("No Token Access", False, f"Exception: {str(e)}")
        
        # Test 3: Signup with existing mobile
        try:
            existing_signup = {
                "mobile": "9999999999",  # Demo user mobile
                "password": "newpass",
                "name": "Duplicate User"
            }
            response = self.session.post(f"{API_BASE}/auth/signup", json=existing_signup)
            if response.status_code == 400:
                self.log_test("Duplicate Mobile Signup", True, "Correctly rejected duplicate mobile")
            else:
                self.log_test("Duplicate Mobile Signup", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Duplicate Mobile Signup", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting FraudX Backend API Tests")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_health_check()
        self.test_signup()
        
        # Login and get token
        if not self.test_login():
            print("❌ Cannot proceed without authentication token")
            return
        
        # Authenticated tests
        self.test_get_profile()
        self.test_get_transactions()
        
        # Transaction tests
        low_risk_tx = self.test_create_low_risk_transaction()
        high_risk_tx = self.test_create_high_risk_transaction()
        
        # Transaction action test (block the high-risk transaction)
        if high_risk_tx:
            self.test_transaction_action(high_risk_tx, "block")
        
        # Account management
        self.test_unfreeze_account()
        
        # Other features
        self.test_qr_validation()
        self.test_chatbot()
        self.test_location_update()
        
        # Error cases
        self.test_error_cases()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        print(f"\n🏁 Testing completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return passed, total

if __name__ == "__main__":
    tester = FraudXTester()
    passed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)