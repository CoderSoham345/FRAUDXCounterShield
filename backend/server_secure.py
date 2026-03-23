from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import jwt
import bcrypt
from datetime import datetime, timedelta
import sqlite3
import json
import time
from collections import defaultdict
import re
from urllib.parse import parse_qs, urlparse
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = FastAPI()

# Security Config
SECRET_KEY = "fraudx-secret-key-2024"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Rate limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT = 30  # requests per minute

# Database
def get_db():
    conn = sqlite3.connect('/app/backend/fraudx.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialize DB
def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            balance REAL DEFAULT 50000.0,
            usual_location TEXT,
            avg_spending REAL DEFAULT 3000.0,
            is_frozen INTEGER DEFAULT 0,
            frozen_until TEXT,
            created_at TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            receiver TEXT,
            upi_id TEXT,
            risk_score INTEGER,
            risk_level TEXT DEFAULT 'low',
            status TEXT,
            location TEXT,
            device_id TEXT,
            fraud_reasons TEXT DEFAULT '[]',
            ai_analysis TEXT DEFAULT '',
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            latitude REAL,
            longitude REAL,
            city TEXT,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            device_id TEXT,
            first_seen TEXT,
            last_seen TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

def seed_demo_data():
    """Seed demo user and transactions for testing"""
    conn = get_db()
    
    # Check if demo user exists
    demo_user = conn.execute("SELECT * FROM users WHERE mobile=?", ("9999999999",)).fetchone()
    
    if not demo_user:
        # Create demo user
        hashed_pwd = bcrypt.hashpw("test123".encode(), bcrypt.gensalt()).decode()
        conn.execute(
            "INSERT INTO users (mobile, password, name, balance, usual_location, avg_spending, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ("9999999999", hashed_pwd, "Rajesh Kumar", 45250.0,
             json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
             3000.0, datetime.now().isoformat())
        )
        conn.commit()
        demo_user = conn.execute("SELECT * FROM users WHERE mobile=?", ("9999999999",)).fetchone()
    
    user_id = demo_user['id']
    
    # Check if transactions exist for this user
    tx_count = conn.execute("SELECT COUNT(*) as count FROM transactions WHERE user_id=?", (user_id,)).fetchone()['count']
    
    if tx_count == 0:
        # Seed demo transactions
        demo_transactions = [
            {
                "amount": 250, "receiver": "Grocery Store", "upi_id": "grocery@paytm",
                "risk_score": 10, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Regular merchant, typical amount pattern.",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                "amount": 799, "receiver": "Amazon", "upi_id": "amazon@ybl",
                "risk_score": 15, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Trusted online platform, verified merchant.",
                "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()
            },
            {
                "amount": 12500, "receiver": "Unknown Merchant", "upi_id": "unknown123@upi",
                "risk_score": 90, "risk_level": "high", "status": "blocked",
                "location": json.dumps({"city": "Delhi", "lat": 28.7041, "lng": 77.1025}),
                "fraud_reasons": json.dumps(["High amount: 5x usual spending", "New location: Delhi", "Unknown merchant", "Rapid transaction pattern"]),
                "ai_analysis": "ALERT: Transaction amount is 4.2x higher than average spending. Origin location Delhi doesn't match usual Mumbai pattern. Merchant is unverified.",
                "timestamp": (datetime.now() - timedelta(days=1)).isoformat()
            },
            {
                "amount": 1200, "receiver": "Swiggy", "upi_id": "swiggy@icici",
                "risk_score": 50, "risk_level": "medium", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps(["Late night transaction", "Higher than usual food order"]),
                "ai_analysis": "Late-night transaction detected. Amount is above average for food delivery but within acceptable range.",
                "timestamp": (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                "amount": 25000, "receiver": "Fuel Station Delhi", "upi_id": "fuel_delhi@sbi",
                "risk_score": 95, "risk_level": "high", "status": "blocked",
                "location": json.dumps({"city": "Delhi", "lat": 28.7041, "lng": 77.1025}),
                "fraud_reasons": json.dumps(["Very high amount: 8x usual", "New location: Delhi", "New device detected", "Unusual merchant category"]),
                "ai_analysis": "HIGH RISK: Multiple red flags detected. Amount is 8.3x higher than normal. Location anomaly - user is usually in Mumbai. New device fingerprint not matching registered devices.",
                "timestamp": (datetime.now() - timedelta(days=3)).isoformat()
            },
            {
                "amount": 450, "receiver": "Local Store", "upi_id": "localstore@paytm",
                "risk_score": 12, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Regular local merchant. Transaction pattern normal.",
                "timestamp": (datetime.now() - timedelta(days=4)).isoformat()
            },
            {
                "amount": 890, "receiver": "Medical Store", "upi_id": "medical@ybl",
                "risk_score": 8, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Verified healthcare merchant. Normal transaction.",
                "timestamp": (datetime.now() - timedelta(days=5)).isoformat()
            },
            {
                "amount": 1500, "receiver": "Movie Tickets", "upi_id": "bookmyshow@axis",
                "risk_score": 20, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Entertainment purchase from verified platform. Amount within normal range.",
                "timestamp": (datetime.now() - timedelta(days=6)).isoformat()
            },
            {
                "amount": 3200, "receiver": "Electricity Bill", "upi_id": "electricbill@sbi",
                "risk_score": 5, "risk_level": "low", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps([]), "ai_analysis": "Recurring utility payment. Matches previous billing pattern.",
                "timestamp": (datetime.now() - timedelta(days=7)).isoformat()
            },
            {
                "amount": 15000, "receiver": "Credit Card Payment", "upi_id": "hdfccc@hdfc",
                "risk_score": 45, "risk_level": "medium", "status": "completed",
                "location": json.dumps({"city": "Mumbai", "lat": 19.0760, "lng": 72.8777}),
                "fraud_reasons": json.dumps(["High amount: 5x usual spending"]),
                "ai_analysis": "Large payment to verified credit card issuer. Amount is higher than usual but destination is trusted.",
                "timestamp": (datetime.now() - timedelta(days=8)).isoformat()
            },
        ]
        
        for tx in demo_transactions:
            conn.execute(
                """INSERT INTO transactions 
                   (user_id, amount, receiver, upi_id, risk_score, risk_level, status, location, device_id, fraud_reasons, ai_analysis, timestamp) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, tx["amount"], tx["receiver"], tx["upi_id"], tx["risk_score"],
                 tx["risk_level"], tx["status"], tx["location"], "demo-device",
                 tx["fraud_reasons"], tx["ai_analysis"], tx["timestamp"])
            )
        
        conn.commit()
    
    conn.close()

init_db()
seed_demo_data()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SignupRequest(BaseModel):
    mobile: str
    password: str
    name: str

class LoginRequest(BaseModel):
    mobile: str
    password: str
    device_id: Optional[str] = None

class QRValidateRequest(BaseModel):
    qr_string: str

class TransactionRequest(BaseModel):
    amount: float
    upi_id: str
    receiver_name: Optional[str] = "Unknown"
    location: Optional[dict] = None
    device_id: Optional[str] = None

class TransactionActionRequest(BaseModel):
    action: str  # "allow" or "block"

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    city: str

# Utils
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_id_from_header(authorization: str = Header(None)) -> int:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.replace("Bearer ", "")
    return verify_token(token)

# Rate Limiting
def rate_limit_check(request: Request):
    client_ip = request.client.host
    now = time.time()
    rate_limit_store[client_ip] = [t for t in rate_limit_store[client_ip] if now - t < 60]
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests")
    rate_limit_store[client_ip].append(now)

# Fraud Detection Engine
def calculate_fraud_score(user_id: int, amount: float, device_id: str, location: dict) -> dict:
    conn = get_db()
    user = dict(conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone())
    
    score = 0
    reasons = []
    
    # Check device
    if device_id and device_id != "unknown":
        device = conn.execute("SELECT * FROM devices WHERE user_id=? AND device_id=?", 
                             (user_id, device_id)).fetchone()
        if not device:
            score += 30
            reasons.append("New device detected")
    
    # Check location
    if user['usual_location'] and location:
        try:
            usual = json.loads(user['usual_location'])
            if location.get('city') and location['city'] != usual.get('city'):
                score += 25
                reasons.append(f"New location: {location.get('city', 'Unknown')}")
        except (json.JSONDecodeError, TypeError):
            pass
    
    # Check amount
    if amount > 10000:
        score += 20
        reasons.append(f"High amount: ₹{amount:,.0f}")
    
    # Check rapid transactions
    recent_txs = conn.execute(
        "SELECT COUNT(*) as count FROM transactions WHERE user_id=? AND timestamp > ?",
        (user_id, (datetime.now() - timedelta(minutes=5)).isoformat())
    ).fetchone()
    if recent_txs['count'] >= 3:
        score += 15
        reasons.append("Rapid transactions detected")
    
    # Check spending pattern
    if user['avg_spending'] and amount > user['avg_spending'] * 3:
        multiplier = int(amount / user['avg_spending'])
        score += 10
        reasons.append(f"{multiplier}x higher than usual spending")
    
    conn.close()
    
    # Determine risk level and action
    if score >= 70:
        risk_level = "high"
        action = "block"
    elif score >= 40:
        risk_level = "medium"
        action = "review"
    else:
        risk_level = "low"
        action = "allow"
    
    ai_analysis = ""
    if score >= 70:
        ai_analysis = f"HIGH RISK: Multiple red flags detected. " + " ".join(reasons) + ". Recommend blocking this transaction."
    elif score >= 40:
        ai_analysis = f"MEDIUM RISK: Some suspicious indicators found. " + " ".join(reasons) + ". Proceed with caution."
    else:
        ai_analysis = "Transaction appears safe. Normal spending pattern and location detected."
    
    return {
        "risk_score": min(score, 100),
        "risk_level": risk_level,
        "action": action,
        "reasons": reasons,
        "ai_analysis": ai_analysis
    }

# QR Validation
def validate_qr(qr_string: str) -> dict:
    if not qr_string.startswith("upi://pay"):
        raise HTTPException(status_code=400, detail="Invalid QR code format")
    
    try:
        parsed = urlparse(qr_string)
        params = parse_qs(parsed.query)
        
        upi_id = params.get('pa', [None])[0]
        name = params.get('pn', [None])[0]
        amount = params.get('am', [None])[0]
        
        if not upi_id:
            raise HTTPException(status_code=400, detail="Missing UPI ID in QR")
        
        return {
            "valid": True,
            "upi_id": upi_id,
            "name": name or "Unknown",
            "amount": float(amount) if amount else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid QR: {str(e)}")

# ============ API ENDPOINTS ============

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FraudX API", "version": "2.0"}

# AUTH APIs
@app.post("/api/auth/signup")
def signup(req: SignupRequest, request: Request):
    rate_limit_check(request)
    conn = get_db()
    
    existing = conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Mobile already registered")
    
    hashed_pwd = hash_password(req.password)
    conn.execute(
        "INSERT INTO users (mobile, password, name, created_at) VALUES (?, ?, ?, ?)",
        (req.mobile, hashed_pwd, req.name, datetime.now().isoformat())
    )
    conn.commit()
    
    user = dict(conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone())
    conn.close()
    
    token = create_token(user['id'])
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "mobile": user['mobile'],
            "balance": user['balance']
        }
    }

@app.post("/api/auth/login")
def login(req: LoginRequest, request: Request):
    rate_limit_check(request)
    conn = get_db()
    
    user = conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone()
    if not user or not verify_password(req.password, user['password']):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = dict(user)
    
    # Track device
    if req.device_id:
        device = conn.execute("SELECT * FROM devices WHERE user_id=? AND device_id=?", 
                             (user['id'], req.device_id)).fetchone()
        if not device:
            conn.execute("INSERT INTO devices (user_id, device_id, first_seen, last_seen) VALUES (?, ?, ?, ?)",
                        (user['id'], req.device_id, datetime.now().isoformat(), datetime.now().isoformat()))
        else:
            conn.execute("UPDATE devices SET last_seen=? WHERE user_id=? AND device_id=?",
                        (datetime.now().isoformat(), user['id'], req.device_id))
        conn.commit()
    
    conn.close()
    
    token = create_token(user['id'])
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "mobile": user['mobile'],
            "balance": user['balance']
        }
    }

# USER PROFILE
@app.get("/api/user/profile")
def get_profile(authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    user = conn.execute("SELECT id, mobile, name, balance, avg_spending, is_frozen, frozen_until FROM users WHERE id=?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    user = dict(user)
    
    # Check if freeze has expired
    if user.get('is_frozen') and user.get('frozen_until'):
        try:
            frozen_until = datetime.fromisoformat(user['frozen_until'])
            if datetime.now() > frozen_until:
                conn.execute("UPDATE users SET is_frozen=0, frozen_until=NULL WHERE id=?", (user_id,))
                conn.commit()
                user['is_frozen'] = 0
                user['frozen_until'] = None
        except (ValueError, TypeError):
            pass
    
    # Calculate fraud susceptibility score
    recent_txs = conn.execute(
        "SELECT AVG(risk_score) as avg_risk FROM transactions WHERE user_id=? AND timestamp > ?",
        (user_id, (datetime.now() - timedelta(days=7)).isoformat())
    ).fetchone()
    
    conn.close()
    
    return {
        "id": user['id'],
        "name": user['name'],
        "mobile": user['mobile'],
        "balance": user['balance'],
        "avg_spending": user['avg_spending'],
        "is_frozen": bool(user.get('is_frozen', 0)),
        "frozen_until": user.get('frozen_until'),
        "fraud_susceptibility_score": int(recent_txs['avg_risk']) if recent_txs['avg_risk'] else 35
    }

# QR VALIDATION API
@app.post("/api/scan/validate")
def validate_qr_code(req: QRValidateRequest, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    get_user_id_from_header(authorization)
    return validate_qr(req.qr_string)

# TRANSACTION APIs
@app.post("/api/transaction/create")
def create_transaction(req: TransactionRequest, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    user = dict(conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone())
    
    # Check if account is frozen
    if user.get('is_frozen'):
        frozen_until = user.get('frozen_until')
        if frozen_until:
            try:
                frozen_dt = datetime.fromisoformat(frozen_until)
                if datetime.now() < frozen_dt:
                    conn.close()
                    raise HTTPException(status_code=403, detail="Account is frozen")
            except (ValueError, TypeError):
                pass
    
    # Check balance
    if user['balance'] < req.amount:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Fraud check
    location = req.location or {"city": "Unknown", "lat": 0, "lng": 0}
    fraud_result = calculate_fraud_score(user_id, req.amount, req.device_id or "unknown", location)
    
    # Determine initial status based on fraud check
    if fraud_result['action'] == 'allow':
        status = 'completed'
    else:
        status = 'pending'  # Needs user review
    
    # Create transaction record
    conn.execute(
        """INSERT INTO transactions 
           (user_id, amount, receiver, upi_id, risk_score, risk_level, status, location, device_id, fraud_reasons, ai_analysis, timestamp) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, req.amount, req.receiver_name or "Unknown", req.upi_id,
         fraud_result['risk_score'], fraud_result['risk_level'], status,
         json.dumps(location), req.device_id or "unknown",
         json.dumps(fraud_result['reasons']), fraud_result['ai_analysis'],
         datetime.now().isoformat())
    )
    
    tx_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    
    # Auto-complete low-risk transactions
    new_balance = user['balance']
    if fraud_result['action'] == 'allow':
        new_balance = user['balance'] - req.amount
        conn.execute("UPDATE users SET balance=? WHERE id=?", (new_balance, user_id))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "transaction_id": tx_id,
        "status": status,
        "is_suspicious": fraud_result['action'] != 'allow',
        "fraud_check": fraud_result,
        "new_balance": new_balance
    }

@app.post("/api/transaction/{tx_id}/action")
def transaction_action(tx_id: int, req: TransactionActionRequest, authorization: str = Header(None), request: Request = None):
    """Allow or block a pending transaction"""
    rate_limit_check(request)
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    tx = conn.execute("SELECT * FROM transactions WHERE id=? AND user_id=?", (tx_id, user_id)).fetchone()
    if not tx:
        conn.close()
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    tx = dict(tx)
    user = dict(conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone())
    
    if req.action == "allow":
        # Process the payment
        if user['balance'] < tx['amount']:
            conn.close()
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        new_balance = user['balance'] - tx['amount']
        conn.execute("UPDATE users SET balance=? WHERE id=?", (new_balance, user_id))
        conn.execute("UPDATE transactions SET status='completed' WHERE id=?", (tx_id,))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "status": "completed",
            "new_balance": new_balance,
            "message": "Transaction approved"
        }
    
    elif req.action == "block":
        # Block the transaction and freeze account
        frozen_until = (datetime.now() + timedelta(seconds=30)).isoformat()
        conn.execute("UPDATE transactions SET status='blocked' WHERE id=?", (tx_id,))
        conn.execute("UPDATE users SET is_frozen=1, frozen_until=? WHERE id=?", (frozen_until, user_id))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "status": "blocked",
            "freeze_until": frozen_until,
            "new_balance": user['balance'],
            "message": "Transaction blocked. Account frozen for 30 seconds."
        }
    
    else:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid action. Use 'allow' or 'block'.")

@app.get("/api/transactions")
def get_transactions(authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    txs = conn.execute(
        "SELECT * FROM transactions WHERE user_id=? ORDER BY timestamp DESC LIMIT 50",
        (user_id,)
    ).fetchall()
    
    conn.close()
    
    result = []
    for tx in txs:
        tx_dict = dict(tx)
        # Parse JSON fields
        try:
            tx_dict['fraud_reasons'] = json.loads(tx_dict.get('fraud_reasons', '[]') or '[]')
        except (json.JSONDecodeError, TypeError):
            tx_dict['fraud_reasons'] = []
        try:
            tx_dict['location'] = json.loads(tx_dict.get('location', '{}') or '{}')
        except (json.JSONDecodeError, TypeError):
            tx_dict['location'] = {}
        
        result.append({
            "id": tx_dict['id'],
            "amount": tx_dict['amount'],
            "receiver": tx_dict['receiver'],
            "upi_id": tx_dict['upi_id'],
            "risk_score": tx_dict['risk_score'],
            "risk_level": tx_dict.get('risk_level', 'low'),
            "status": tx_dict['status'],
            "location": tx_dict['location'],
            "fraud_reasons": tx_dict['fraud_reasons'],
            "ai_analysis": tx_dict.get('ai_analysis', ''),
            "timestamp": tx_dict['timestamp']
        })
    
    return result

# ACCOUNT MANAGEMENT
@app.post("/api/account/unfreeze")
def unfreeze_account(authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    conn.execute("UPDATE users SET is_frozen=0, frozen_until=NULL WHERE id=?", (user_id,))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Account unfrozen successfully"}

# LOCATION API
@app.post("/api/location/update")
def update_location(req: LocationUpdate, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    user_id = get_user_id_from_header(authorization)
    conn = get_db()
    
    conn.execute(
        "INSERT INTO locations (user_id, latitude, longitude, city, timestamp) VALUES (?, ?, ?, ?, ?)",
        (user_id, req.latitude, req.longitude, req.city, datetime.now().isoformat())
    )
    
    user = conn.execute("SELECT usual_location FROM users WHERE id=?", (user_id,)).fetchone()
    if not user['usual_location']:
        conn.execute("UPDATE users SET usual_location=? WHERE id=?", 
                    (json.dumps({"city": req.city, "lat": req.latitude, "lng": req.longitude}), user_id))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Location updated"}

# AI CHATBOT
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

@app.post("/api/chatbot")
async def chatbot(req: ChatMessage, authorization: str = Header(None)):
    get_user_id_from_header(authorization)
    
    llm_key = os.getenv("EMERGENT_LLM_KEY")
    if not llm_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        session_id = req.session_id or str(uuid.uuid4())
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=session_id,
            system_message="""You are FraudX AI Security Assistant, an expert on UPI fraud detection, digital payment security, and cybersecurity in India.

Your role:
- Help users understand fraud risks in UPI/digital payments
- Provide tips to stay safe from phishing, vishing, and UPI scams
- Explain how fraud detection works (risk scoring, location analysis, behavior patterns)
- Guide users on reporting fraud to authorities (Maharashtra Cyber Security, RBI)
- Answer questions about account security, transaction safety, and privacy

Be concise, friendly, and use simple language. Use emojis occasionally. Always prioritize user safety.
If asked about non-security topics, politely redirect to fraud/security topics."""
        )
        
        chat.with_model("openai", "gpt-4.1-mini")
        
        user_message = UserMessage(text=req.message)
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        # Fallback responses
        msg_lower = req.message.lower()
        if any(w in msg_lower for w in ['otp', 'pin', 'cvv']):
            fallback = "Never share OTP, PIN, or CVV with anyone - not even bank officials! Banks will never ask for these. If someone asks, it's a scam. Report it immediately."
        elif any(w in msg_lower for w in ['report', 'complaint', 'fraud']):
            fallback = "To report fraud:\n1. Call Cyber Crime Helpline: 1930\n2. File online: cybercrime.gov.in\n3. Contact your bank immediately\n4. File FIR at nearest police station\n\nAct within 24 hours for best chance of recovery!"
        elif any(w in msg_lower for w in ['safe', 'protect', 'security']):
            fallback = "Stay safe with UPI:\n• Never share OTP/PIN with anyone\n• Verify merchant before paying\n• Use only official payment apps\n• Enable transaction alerts\n• Check UPI ID carefully before confirming\n• Report suspicious activity immediately"
        else:
            fallback = "I'm your FraudX AI Security Assistant! Ask me about:\n• UPI fraud prevention tips\n• How to report cyber fraud\n• Transaction security\n• Account protection\n• How our AI detects fraud\n\nWhat would you like to know?"
        
        return {
            "success": True,
            "response": fallback,
            "session_id": req.session_id or "fallback"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
