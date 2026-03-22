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

app = FastAPI()

# Security Config
SECRET_KEY = "fraudx-secret-key-2024"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Rate limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT = 10  # requests per minute

# Database
def get_db():
    conn = sqlite3.connect('fraudx.db')
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
            status TEXT,
            location TEXT,
            device_id TEXT,
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

init_db()

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
    location: dict
    device_id: Optional[str] = None

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
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

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
    device = conn.execute("SELECT * FROM devices WHERE user_id=? AND device_id=?", 
                         (user_id, device_id)).fetchone()
    if not device:
        score += 30
        reasons.append("New device detected")
    
    # Check location
    if user['usual_location']:
        usual = json.loads(user['usual_location'])
        if location['city'] != usual.get('city'):
            score += 25
            reasons.append(f"New location: {location['city']}")
    
    # Check amount
    if amount > 10000:
        score += 20
        reasons.append(f"High amount: ₹{amount}")
    
    # Check rapid transactions
    recent_txs = conn.execute(
        "SELECT COUNT(*) as count FROM transactions WHERE user_id=? AND timestamp > ?",
        (user_id, (datetime.now() - timedelta(minutes=5)).isoformat())
    ).fetchone()
    if recent_txs['count'] >= 3:
        score += 15
        reasons.append("Rapid transactions detected")
    
    # Check spending pattern
    if amount > user['avg_spending'] * 3:
        score += 10
        reasons.append(f"{int(amount/user['avg_spending'])}x higher than usual")
    
    conn.close()
    
    # Determine status and action
    if score >= 70:
        status = "high"
        action = "block"
    elif score >= 40:
        status = "medium"
        action = "require_otp"
    else:
        status = "low"
        action = "allow"
    
    return {
        "risk_score": min(score, 100),
        "status": status,
        "action": action,
        "reasons": reasons
    }

# QR Validation
def validate_qr(qr_string: str) -> dict:
    # Check if starts with upi://pay
    if not qr_string.startswith("upi://pay"):
        raise HTTPException(status_code=400, detail="Invalid QR code format")
    
    # Parse QR
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid QR: {str(e)}")

# AUTH APIs
@app.post("/api/auth/signup")
def signup(req: SignupRequest, request: Request):
    rate_limit_check(request)
    conn = get_db()
    
    # Check if exists
    existing = conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile already registered")
    
    # Create user
    hashed_pwd = hash_password(req.password)
    conn.execute(
        "INSERT INTO users (mobile, password, name, created_at) VALUES (?, ?, ?, ?)",
        (req.mobile, hashed_pwd, req.name, datetime.now().isoformat())
    )
    conn.commit()
    
    user = dict(conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone())
    conn.close()
    
    token = create_token(user['id'])
    return {"success": True, "token": token, "user": {"id": user['id'], "name": user['name'], "mobile": user['mobile'], "balance": user['balance']}}

@app.post("/api/auth/login")
def login(req: LoginRequest, request: Request):
    rate_limit_check(request)
    conn = get_db()
    
    user = conn.execute("SELECT * FROM users WHERE mobile=?", (req.mobile,)).fetchone()
    if not user or not verify_password(req.password, user['password']):
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
    return {"success": True, "token": token, "user": {"id": user['id'], "name": user['name'], "mobile": user['mobile'], "balance": user['balance']}}

# QR VALIDATION API
@app.post("/api/scan/validate")
def validate_qr_code(req: QRValidateRequest, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    verify_token(authorization.replace("Bearer ", ""))
    return validate_qr(req.qr_string)

# TRANSACTION APIs
@app.post("/api/transaction/create")
def create_transaction(req: TransactionRequest, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    user_id = verify_token(authorization.replace("Bearer ", ""))
    conn = get_db()
    
    user = dict(conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone())
    
    # Check balance
    if user['balance'] < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Fraud check
    fraud_result = calculate_fraud_score(user_id, req.amount, req.device_id or "unknown", req.location)
    
    # Create transaction
    conn.execute(
        "INSERT INTO transactions (user_id, amount, receiver, upi_id, risk_score, status, location, device_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, req.amount, req.location.get('city', 'Unknown'), req.upi_id, fraud_result['risk_score'], 
         fraud_result['action'], json.dumps(req.location), req.device_id or "unknown", datetime.now().isoformat())
    )
    
    tx_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    
    # Update balance if allowed
    if fraud_result['action'] == 'allow':
        conn.execute("UPDATE users SET balance=? WHERE id=?", (user['balance'] - req.amount, user_id))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "transaction_id": tx_id,
        "fraud_check": fraud_result,
        "new_balance": user['balance'] - req.amount if fraud_result['action'] == 'allow' else user['balance']
    }

@app.get("/api/transactions")
def get_transactions(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    user_id = verify_token(authorization.replace("Bearer ", ""))
    conn = get_db()
    
    txs = conn.execute(
        "SELECT * FROM transactions WHERE user_id=? ORDER BY timestamp DESC LIMIT 50",
        (user_id,)
    ).fetchall()
    
    conn.close()
    return [{"id": tx['id'], "amount": tx['amount'], "receiver": tx['receiver'], "upi_id": tx['upi_id'],
             "risk_score": tx['risk_score'], "status": tx['status'], "timestamp": tx['timestamp']} for tx in txs]

# LOCATION API
@app.post("/api/location/update")
def update_location(req: LocationUpdate, authorization: str = Header(None), request: Request = None):
    rate_limit_check(request)
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    user_id = verify_token(authorization.replace("Bearer ", ""))
    conn = get_db()
    
    # Store location
    conn.execute(
        "INSERT INTO locations (user_id, latitude, longitude, city, timestamp) VALUES (?, ?, ?, ?, ?)",
        (user_id, req.latitude, req.longitude, req.city, datetime.now().isoformat())
    )
    
    # Update usual location if not set
    user = conn.execute("SELECT usual_location FROM users WHERE id=?", (user_id,)).fetchone()
    if not user['usual_location']:
        conn.execute("UPDATE users SET usual_location=? WHERE id=?", 
                    (json.dumps({"city": req.city, "lat": req.latitude, "lng": req.longitude}), user_id))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Location updated"}

@app.get("/api/user/profile")
def get_profile(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    user_id = verify_token(authorization.replace("Bearer ", ""))
    conn = get_db()
    
    user = dict(conn.execute("SELECT id, mobile, name, balance, avg_spending FROM users WHERE id=?", (user_id,)).fetchone())
    
    # Calculate risk score
    recent_txs = conn.execute(
        "SELECT AVG(risk_score) as avg_risk FROM transactions WHERE user_id=? AND timestamp > ?",
        (user_id, (datetime.now() - timedelta(days=7)).isoformat())
    ).fetchone()
    
    conn.close()
    
    return {
        **user,
        "fraud_susceptibility_score": int(recent_txs['avg_risk']) if recent_txs['avg_risk'] else 35
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
