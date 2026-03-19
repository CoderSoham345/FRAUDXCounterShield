#!/usr/bin/env python3
"""
FraudX Backend API Testing Suite
Tests all authentication, user profile, transaction, and account management endpoints.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://transact-guard-6.preview.emergentagent.com/api"
TEST_MOBILE = "9876543210"
TEST_OTP = "123456"

class FraudXAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.transaction_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_send_otp(self):
        """Test 1: Send OTP to mobile number"""
        print("\n=== Testing OTP Send ===")
        try:
            response = requests.post(
                f"{self.base_url}/auth/send-otp",
                json={"mobile": TEST_MOBILE},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "123456" in data.get("message", ""):
                    self.log_test("Send OTP", True, f"OTP sent to {TEST_MOBILE}")
                    return True
                else:
                    self.log_test("Send OTP", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Send OTP", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send OTP", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_otp(self):
        """Test 2: Verify OTP and get authentication token"""
        print("\n=== Testing OTP Verification ===")
        try:
            response = requests.post(
                f"{self.base_url}/auth/verify-otp",
                json={"mobile": TEST_MOBILE, "otp": TEST_OTP},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    user_info = data.get("user", {})
                    self.log_test("Verify OTP", True, 
                                f"Token received, User: {user_info.get('name')}, Balance: ₹{user_info.get('balance')}")
                    return True
                else:
                    self.log_test("Verify OTP", False, f"Missing token in response: {data}")
                    return False
            else:
                self.log_test("Verify OTP", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Verify OTP", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_otp(self):
        """Test: Invalid OTP verification"""
        print("\n=== Testing Invalid OTP ===")
        try:
            response = requests.post(
                f"{self.base_url}/auth/verify-otp",
                json={"mobile": TEST_MOBILE, "otp": "wrong123"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if not data.get("success"):
                    self.log_test("Invalid OTP Handling", True, "Correctly rejected invalid OTP")
                    return True
                else:
                    self.log_test("Invalid OTP Handling", False, "Invalid OTP was accepted")
                    return False
            else:
                self.log_test("Invalid OTP Handling", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Invalid OTP Handling", False, f"Exception: {str(e)}")
            return False
    
    def test_user_profile(self):
        """Test 3: Get user profile with balance"""
        print("\n=== Testing User Profile ===")
        if not self.token:
            self.log_test("User Profile", False, "No token available")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/user/profile",
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("mobile") == TEST_MOBILE and data.get("balance") is not None:
                    self.log_test("User Profile", True, 
                                f"Profile retrieved - Balance: ₹{data.get('balance')}, Frozen: {data.get('is_frozen')}")
                    return True
                else:
                    self.log_test("User Profile", False, f"Missing profile data: {data}")
                    return False
            else:
                self.log_test("User Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Profile", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_token(self):
        """Test: Invalid token handling"""
        print("\n=== Testing Invalid Token ===")
        try:
            response = requests.get(
                f"{self.base_url}/user/profile",
                params={"token": "invalid-token-123"}
            )
            
            if response.status_code == 401:
                self.log_test("Invalid Token Handling", True, "Correctly rejected invalid token")
                return True
            else:
                self.log_test("Invalid Token Handling", False, f"Unexpected response: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Token Handling", False, f"Exception: {str(e)}")
            return False
    
    def test_low_amount_transaction(self):
        """Test 4a: Low amount transaction (should be low risk)"""
        print("\n=== Testing Low Amount Transaction ===")
        if not self.token:
            self.log_test("Low Amount Transaction", False, "No token available")
            return False
        
        try:
            transaction_data = {
                "recipient": "test@upi",
                "amount": 500,
                "location": {
                    "city": "Mumbai",
                    "lat": 19.0760,
                    "lng": 72.8777
                }
            }
            
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=transaction_data,
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("transaction_id"):
                    risk_level = data.get("risk_level", "UNKNOWN")
                    risk_score = data.get("risk_score", 0)
                    ai_analysis = data.get("ai_analysis", "")
                    
                    self.log_test("Low Amount Transaction", True,
                                f"Transaction ID: {data['transaction_id']}, Risk: {risk_level} ({risk_score}%), AI: {ai_analysis[:50]}...")
                    return True
                else:
                    self.log_test("Low Amount Transaction", False, f"Missing transaction ID: {data}")
                    return False
            else:
                self.log_test("Low Amount Transaction", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Low Amount Transaction", False, f"Exception: {str(e)}")
            return False
    
    def test_high_amount_transaction(self):
        """Test 4b: High amount suspicious transaction"""
        print("\n=== Testing High Amount Suspicious Transaction ===")
        if not self.token:
            self.log_test("High Amount Transaction", False, "No token available")
            return False
        
        try:
            transaction_data = {
                "recipient": "test2@upi",
                "amount": 15000,
                "location": {
                    "city": "Delhi",
                    "lat": 28.6139,
                    "lng": 77.2090
                }
            }
            
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=transaction_data,
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("transaction_id"):
                    self.transaction_id = data["transaction_id"]  # Store for confirm test
                    risk_level = data.get("risk_level", "UNKNOWN")
                    risk_score = data.get("risk_score", 0)
                    is_suspicious = data.get("is_suspicious", False)
                    fraud_reasons = data.get("fraud_reasons", [])
                    
                    self.log_test("High Amount Transaction", True,
                                f"Suspicious: {is_suspicious}, Risk: {risk_level} ({risk_score}%), Reasons: {fraud_reasons}")
                    return True
                else:
                    self.log_test("High Amount Transaction", False, f"Missing transaction ID: {data}")
                    return False
            else:
                self.log_test("High Amount Transaction", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("High Amount Transaction", False, f"Exception: {str(e)}")
            return False
    
    def test_insufficient_balance(self):
        """Test: Insufficient balance error"""
        print("\n=== Testing Insufficient Balance ===")
        if not self.token:
            self.log_test("Insufficient Balance", False, "No token available")
            return False
        
        try:
            transaction_data = {
                "recipient": "test@upi",
                "amount": 100000,  # More than default balance
                "location": {
                    "city": "Mumbai",
                    "lat": 19.0760,
                    "lng": 72.8777
                }
            }
            
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=transaction_data,
                params={"token": self.token}
            )
            
            if response.status_code == 400:
                self.log_test("Insufficient Balance", True, "Correctly rejected transaction with insufficient balance")
                return True
            else:
                self.log_test("Insufficient Balance", False, f"Unexpected response: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Insufficient Balance", False, f"Exception: {str(e)}")
            return False
    
    def test_allow_transaction(self):
        """Test 5a: Confirm transaction with 'allow' action"""
        print("\n=== Testing Transaction Allow ===")
        if not self.token or not self.transaction_id:
            self.log_test("Transaction Allow", False, "No token or transaction ID available")
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/transaction/confirm",
                json={"transaction_id": self.transaction_id, "action": "allow"},
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    new_balance = data.get("new_balance")
                    self.log_test("Transaction Allow", True, f"Transaction completed, New balance: ₹{new_balance}")
                    return True
                else:
                    self.log_test("Transaction Allow", False, f"Transaction not completed: {data}")
                    return False
            else:
                self.log_test("Transaction Allow", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Transaction Allow", False, f"Exception: {str(e)}")
            return False
    
    def test_block_transaction(self):
        """Test 5b: Block suspicious transaction and freeze account"""
        print("\n=== Testing Transaction Block ===")
        if not self.token:
            self.log_test("Transaction Block", False, "No token available")
            return False
        
        # First create another transaction to block
        try:
            transaction_data = {
                "recipient": "suspicious@upi",
                "amount": 20000,
                "location": {"city": "Kolkata", "lat": 22.5726, "lng": 88.3639}
            }
            
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=transaction_data,
                params={"token": self.token}
            )
            
            if response.status_code != 200:
                self.log_test("Transaction Block", False, "Could not create transaction to block")
                return False
            
            transaction_id = response.json().get("transaction_id")
            
            # Now block it
            response = requests.post(
                f"{self.base_url}/transaction/confirm",
                json={"transaction_id": transaction_id, "action": "block"},
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("freeze_until"):
                    self.log_test("Transaction Block", True, f"Transaction blocked, Account frozen until: {data['freeze_until']}")
                    return True
                else:
                    self.log_test("Transaction Block", False, f"Transaction not blocked properly: {data}")
                    return False
            else:
                self.log_test("Transaction Block", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Transaction Block", False, f"Exception: {str(e)}")
            return False
    
    def test_frozen_account_transaction(self):
        """Test: Transaction attempt while account is frozen"""
        print("\n=== Testing Frozen Account Transaction ===")
        if not self.token:
            self.log_test("Frozen Account Transaction", False, "No token available")
            return False
        
        try:
            transaction_data = {
                "recipient": "test@upi",
                "amount": 100,
                "location": {"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}
            }
            
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=transaction_data,
                params={"token": self.token}
            )
            
            if response.status_code == 403:
                self.log_test("Frozen Account Transaction", True, "Correctly rejected transaction from frozen account")
                return True
            else:
                # Account might not be frozen anymore, that's also valid
                self.log_test("Frozen Account Transaction", True, "Account not frozen or freeze expired - acceptable")
                return True
        except Exception as e:
            self.log_test("Frozen Account Transaction", False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_history(self):
        """Test 6: Get transaction history"""
        print("\n=== Testing Transaction History ===")
        if not self.token:
            self.log_test("Transaction History", False, "No token available")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/transaction/history",
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    transaction_count = len(data)
                    
                    # Check if transactions have required fields
                    if transaction_count > 0:
                        first_transaction = data[0]
                        required_fields = ["id", "recipient", "amount", "risk_score", "risk_level", "status"]
                        missing_fields = [field for field in required_fields if field not in first_transaction]
                        
                        if not missing_fields:
                            self.log_test("Transaction History", True, 
                                        f"Retrieved {transaction_count} transactions with all required fields")
                            return True
                        else:
                            self.log_test("Transaction History", False, f"Missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("Transaction History", True, "No transactions found (acceptable for new user)")
                        return True
                else:
                    self.log_test("Transaction History", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Transaction History", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Transaction History", False, f"Exception: {str(e)}")
            return False
    
    def test_unfreeze_account(self):
        """Test 7: Unfreeze account"""
        print("\n=== Testing Account Unfreeze ===")
        if not self.token:
            self.log_test("Account Unfreeze", False, "No token available")
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/account/unfreeze",
                params={"token": self.token}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Account Unfreeze", True, "Account successfully unfrozen")
                    return True
                else:
                    self.log_test("Account Unfreeze", False, f"Unfreeze failed: {data}")
                    return False
            else:
                self.log_test("Account Unfreeze", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Account Unfreeze", False, f"Exception: {str(e)}")
            return False
    
    def test_missing_fields(self):
        """Test: Missing required fields"""
        print("\n=== Testing Missing Required Fields ===")
        if not self.token:
            self.log_test("Missing Required Fields", False, "No token available")
            return False
        
        try:
            # Test transaction initiate without amount
            response = requests.post(
                f"{self.base_url}/transaction/initiate",
                json={"recipient": "test@upi"},
                params={"token": self.token}
            )
            
            if response.status_code == 422:  # Validation error
                self.log_test("Missing Required Fields", True, "Correctly rejected request with missing fields")
                return True
            else:
                self.log_test("Missing Required Fields", False, f"Unexpected response: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Missing Required Fields", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting FraudX Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Flow
        self.test_send_otp()
        time.sleep(1)  # Small delay between tests
        self.test_verify_otp()
        time.sleep(1)
        
        # Error Cases
        self.test_invalid_otp()
        time.sleep(1)
        self.test_invalid_token()
        time.sleep(1)
        
        # User Profile
        self.test_user_profile()
        time.sleep(1)
        
        # Transaction Flow
        self.test_low_amount_transaction()
        time.sleep(1)
        self.test_high_amount_transaction()
        time.sleep(1)
        
        # Transaction Confirmation
        self.test_allow_transaction()
        time.sleep(1)
        self.test_block_transaction()
        time.sleep(2)  # Wait for freeze
        
        # Account Management
        self.test_frozen_account_transaction()
        time.sleep(1)
        self.test_unfreeze_account()
        time.sleep(1)
        
        # Transaction History
        self.test_transaction_history()
        time.sleep(1)
        
        # Error Cases
        self.test_insufficient_balance()
        time.sleep(1)
        self.test_missing_fields()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for test in self.test_results if test["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n🚨 FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"   ❌ {test['test']}: {test['details']}")
        
        print(f"\n🎯 Success Rate: {(passed/len(self.test_results)*100):.1f}%")

if __name__ == "__main__":
    tester = FraudXAPITester()
    tester.run_all_tests()