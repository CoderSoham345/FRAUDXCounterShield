from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import random
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL'].strip('"')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME'].strip('"')]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# ==================== Models ====================
class SendOTPRequest(BaseModel):
    mobile: str

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None

class UserProfile(BaseModel):
    mobile: str
    name: str
    balance: float
    usual_location: dict
    avg_spending: float
    created_at: datetime

class TransactionInitiate(BaseModel):
    recipient: str
    amount: float
    location: dict

class TransactionAnalysis(BaseModel):
    transaction_id: str
    is_suspicious: bool
    risk_score: int
    risk_level: str
    fraud_reasons: List[str]
    ai_analysis: str

class TransactionConfirm(BaseModel):
    transaction_id: str
    action: str  # "allow" or "block"

class TransactionHistory(BaseModel):
    id: str
    recipient: str
    amount: float
    timestamp: datetime
    location: dict
    risk_score: int
    risk_level: str
    status: str
    fraud_reasons: List[str]

class FreezeAccount(BaseModel):
    duration: int  # seconds

# ==================== Helper Functions ====================
async def get_user_by_mobile(mobile: str):
    """Get user from database"""
    user = await db.users.find_one({"mobile": mobile})
    return user

async def create_default_user(mobile: str):
    """Create a new user with default values"""
    user = {
        "mobile": mobile,
        "name": f"User {mobile[-4:]}",
        "balance": 50000.0,  # ₹50,000 default balance
        "usual_location": {
            "city": "Mumbai",
            "lat": 19.0760,
            "lng": 72.8777
        },
        "avg_spending": 3000.0,  # ₹3,000 average
        "transaction_times": ["09:00", "14:00", "19:00"],  # Usual times
        "created_at": datetime.utcnow(),
        "is_frozen": False,
        "freeze_until": None
    }
    await db.users.insert_one(user)
    return user

async def analyze_transaction_with_ai(transaction_data: dict, user_data: dict) -> dict:
    """Use AI to analyze transaction for fraud"""
    try:
        # Create AI chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"fraud-analysis-{uuid.uuid4()}",
            system_message="You are a fraud detection AI expert. Analyze transactions and provide risk assessment."
        ).with_model("openai", "gpt-5.2")
        
        # Prepare analysis prompt
        current_hour = datetime.utcnow().hour
        prompt = f"""Analyze this UPI transaction for fraud:

Transaction Details:
- Amount: ₹{transaction_data['amount']}
- Recipient: {transaction_data['recipient']}
- Time: {current_hour}:00 hrs
- Location: {transaction_data['location']['city']}

User Profile:
- Usual Location: {user_data['usual_location']['city']}
- Average Spending: ₹{user_data['avg_spending']}
- Current Balance: ₹{user_data['balance']}

Provide a brief fraud risk assessment (2-3 sentences) focusing on:
1. Amount compared to average spending
2. Location anomaly
3. Time of transaction
4. Overall risk level

Keep response concise and professional."""

        # Get AI response
        message = UserMessage(text=prompt)
        ai_response = await chat.send_message(message)
        
        return {"analysis": ai_response, "success": True}
    except Exception as e:
        logging.error(f"AI analysis error: {e}")
        # Fallback to rule-based explanation
        reasons = []
        if transaction_data['amount'] > user_data['avg_spending'] * 3:
            reasons.append(f"Amount is {int(transaction_data['amount']/user_data['avg_spending'])}x higher than usual")
        if transaction_data['location']['city'] != user_data['usual_location']['city']:
            reasons.append(f"Transaction from unusual location: {transaction_data['location']['city']}")
        
        fallback = "Transaction analyzed using rule-based detection. " + " ".join(reasons) if reasons else "Transaction appears normal based on your spending patterns."
        return {"analysis": fallback, "success": False}

def calculate_risk_score(transaction: dict, user: dict) -> dict:
    """Calculate fraud risk score based on rules"""
    risk_score = 0
    fraud_reasons = []
    
    # Check 1: High amount
    if transaction['amount'] > 10000:
        risk_score += 40
        fraud_reasons.append(f"High amount transaction (₹{transaction['amount']})")
    
    # Check 2: Amount compared to average
    if transaction['amount'] > user['avg_spending'] * 3:
        risk_score += 30
        fraud_reasons.append(f"{int(transaction['amount']/user['avg_spending'])}x higher than usual spending")
    
    # Check 3: Location mismatch
    if transaction['location']['city'] != user['usual_location']['city']:
        risk_score += 25
        fraud_reasons.append(f"Transaction from {transaction['location']['city']} (usual: {user['usual_location']['city']})")
    
    # Check 4: Unusual time (1 AM - 5 AM)
    current_hour = datetime.utcnow().hour
    if 1 <= current_hour <= 5:
        risk_score += 20
        fraud_reasons.append(f"Unusual time: {current_hour}:00 hrs")
    
    # Determine risk level
    if risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        "risk_score": min(risk_score, 100),
        "risk_level": risk_level,
        "fraud_reasons": fraud_reasons,
        "is_suspicious": risk_score >= 30
    }

# ==================== API Endpoints ====================
@api_router.post("/auth/send-otp", response_model=AuthResponse)
async def send_otp(request: SendOTPRequest):
    """Send OTP to mobile number (mock implementation)"""
    try:
        # Generate mock OTP
        otp = "123456"  # Fixed OTP for demo
        
        # Store OTP in database with expiry
        await db.otps.insert_one({
            "mobile": request.mobile,
            "otp": otp,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=5)
        })
        
        return AuthResponse(
            success=True,
            message=f"OTP sent to {request.mobile} (Demo OTP: 123456)"
        )
    except Exception as e:
        logging.error(f"Send OTP error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP and login"""
    try:
        # Check OTP
        otp_record = await db.otps.find_one({
            "mobile": request.mobile,
            "otp": request.otp
        })
        
        if not otp_record:
            return AuthResponse(success=False, message="Invalid OTP")
        
        # Check expiry
        if otp_record['expires_at'] < datetime.utcnow():
            return AuthResponse(success=False, message="OTP expired")
        
        # Get or create user
        user = await get_user_by_mobile(request.mobile)
        if not user:
            user = await create_default_user(request.mobile)
        
        # Create session token
        token = str(uuid.uuid4())
        await db.sessions.insert_one({
            "token": token,
            "mobile": request.mobile,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=30)
        })
        
        # Clean up OTP
        await db.otps.delete_many({"mobile": request.mobile})
        
        return AuthResponse(
            success=True,
            message="Login successful",
            token=token,
            user={
                "mobile": user['mobile'],
                "name": user['name'],
                "balance": user['balance']
            }
        )
    except Exception as e:
        logging.error(f"Verify OTP error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/user/profile")
async def get_profile(token: str):
    """Get user profile"""
    try:
        # Verify token
        session = await db.sessions.find_one({"token": token})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user
        user = await get_user_by_mobile(session['mobile'])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if account is frozen
        is_frozen = False
        freeze_until = None
        if user.get('is_frozen') and user.get('freeze_until'):
            if user['freeze_until'] > datetime.utcnow():
                is_frozen = True
                freeze_until = user['freeze_until'].isoformat()
            else:
                # Unfreeze account if time has passed
                await db.users.update_one(
                    {"mobile": user['mobile']},
                    {"$set": {"is_frozen": False, "freeze_until": None}}
                )
        
        return {
            "mobile": user['mobile'],
            "name": user['name'],
            "balance": user['balance'],
            "is_frozen": is_frozen,
            "freeze_until": freeze_until
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/transaction/initiate")
async def initiate_transaction(request: TransactionInitiate, token: str):
    """Initiate a transaction and analyze for fraud"""
    try:
        # Verify token
        session = await db.sessions.find_one({"token": token})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user
        user = await get_user_by_mobile(session['mobile'])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if frozen
        if user.get('is_frozen') and user.get('freeze_until'):
            if user['freeze_until'] > datetime.utcnow():
                raise HTTPException(status_code=403, detail="Account is temporarily frozen")
        
        # Check balance
        if user['balance'] < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Calculate risk
        transaction_data = {
            "amount": request.amount,
            "recipient": request.recipient,
            "location": request.location
        }
        risk_data = calculate_risk_score(transaction_data, user)
        
        # Get AI analysis
        ai_result = await analyze_transaction_with_ai(transaction_data, user)
        
        # Create transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "user_mobile": user['mobile'],
            "recipient": request.recipient,
            "amount": request.amount,
            "location": request.location,
            "timestamp": datetime.utcnow(),
            "risk_score": risk_data['risk_score'],
            "risk_level": risk_data['risk_level'],
            "fraud_reasons": risk_data['fraud_reasons'],
            "is_suspicious": risk_data['is_suspicious'],
            "ai_analysis": ai_result['analysis'],
            "status": "pending"
        }
        
        await db.transactions.insert_one(transaction)
        
        return {
            "transaction_id": transaction['id'],
            "is_suspicious": risk_data['is_suspicious'],
            "risk_score": risk_data['risk_score'],
            "risk_level": risk_data['risk_level'],
            "fraud_reasons": risk_data['fraud_reasons'],
            "ai_analysis": ai_result['analysis']
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Initiate transaction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/transaction/confirm")
async def confirm_transaction(request: TransactionConfirm, token: str):
    """Confirm or block a transaction"""
    try:
        # Verify token
        session = await db.sessions.find_one({"token": token})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get transaction
        transaction = await db.transactions.find_one({"id": request.transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get user
        user = await get_user_by_mobile(session['mobile'])
        
        if request.action == "allow":
            # Process transaction
            new_balance = user['balance'] - transaction['amount']
            await db.users.update_one(
                {"mobile": user['mobile']},
                {"$set": {"balance": new_balance}}
            )
            await db.transactions.update_one(
                {"id": request.transaction_id},
                {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
            )
            return {"success": True, "message": "Transaction completed", "new_balance": new_balance}
        
        elif request.action == "block":
            # Block transaction and freeze account
            await db.transactions.update_one(
                {"id": request.transaction_id},
                {"$set": {"status": "blocked", "blocked_at": datetime.utcnow()}}
            )
            
            # Freeze account for 30 seconds
            freeze_until = datetime.utcnow() + timedelta(seconds=30)
            await db.users.update_one(
                {"mobile": user['mobile']},
                {"$set": {"is_frozen": True, "freeze_until": freeze_until}}
            )
            
            return {
                "success": True,
                "message": "Transaction blocked and account frozen",
                "freeze_until": freeze_until.isoformat()
            }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Confirm transaction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/transaction/history")
async def get_transaction_history(token: str):
    """Get transaction history"""
    try:
        # Verify token
        session = await db.sessions.find_one({"token": token})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get transactions
        transactions = await db.transactions.find(
            {"user_mobile": session['mobile']}
        ).sort("timestamp", -1).limit(50).to_list(50)
        
        return [{
            "id": t['id'],
            "recipient": t['recipient'],
            "amount": t['amount'],
            "timestamp": t['timestamp'].isoformat(),
            "location": t['location'],
            "risk_score": t['risk_score'],
            "risk_level": t['risk_level'],
            "status": t['status'],
            "fraud_reasons": t['fraud_reasons']
        } for t in transactions]
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/account/unfreeze")
async def unfreeze_account(token: str):
    """Manually unfreeze account"""
    try:
        # Verify token
        session = await db.sessions.find_one({"token": token})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Unfreeze
        await db.users.update_one(
            {"mobile": session['mobile']},
            {"$set": {"is_frozen": False, "freeze_until": None}}
        )
        
        return {"success": True, "message": "Account unfrozen"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unfreeze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
