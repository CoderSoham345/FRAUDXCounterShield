# 🛡️ FraudX - AI-Powered Fraud Detection App

## 🎯 Demo Instructions

### **Login Credentials**
- **Mobile Number**: Any 10-digit number (e.g., 9876543210)
- **OTP**: `123456` (fixed for demo)

---

## 📱 App Features

### 1. **Splash Screen** ✨
- Animated FraudX logo with shield
- Professional tagline: "Smart AI Protection for Your Payments"

### 2. **Login with OTP** 🔐
- Enter any 10-digit mobile number
- Use OTP: `123456` to login
- Auto-creates user with ₹50,000 balance

### 3. **Home Dashboard** 🏠
Shows:
- Balance: ₹45,250 (with animated card)
- AI Protection badge
- Dummy transactions:
  * ✅ ₹250 → Grocery Store (SAFE)
  * ✅ ₹799 → Amazon (SAFE)
  * 🚨 ₹12,500 → Unknown Merchant (HIGH RISK)
  * ⚠️ ₹1,200 → Swiggy (MEDIUM RISK)
  * 🚨 ₹25,000 → New Location Delhi (HIGH RISK)

### 4. **Send Money** 💸
- Enter UPI ID or phone number
- Enter amount
- Real GPS location tracking
- AI analyzes in real-time

### 5. **Cartoon Fraud Alert** 🕵️
When suspicious transaction is detected:
- **Masked thief cartoon icon** 🥷
- Shaking animation
- Risk meter (color-coded)
- AI analysis with reasons
- Two options:
  * ✅ Allow Anyway (processes payment)
  * 🛑 Block It! (freezes account)

### 6. **Account Frozen Screen** 🔒
If blocked:
- Animated lock with snowflake ❄️
- 30-second countdown timer
- "We stopped a potential fraud attempt!"
- Unfreeze button

### 7. **Transaction History** 📊
- All transactions with risk scores
- Color-coded risk levels
- Fraud reasons displayed
- Risk meter visualization

---

## 🎮 How to Trigger Fraud Detection

### **Low Risk (Auto-approved)**
- Amount: < ₹10,000
- Same location (Mumbai)
- Normal hours

### **High Risk (Shows Alert)**
1. **High Amount**: Send > ₹10,000
   - Example: ₹15,000 to anyone
   
2. **New Location**: If location is different from Mumbai
   - App detects via GPS
   
3. **Unusual Time**: Late night (1 AM - 5 AM)

---

## 🤖 AI Features

### **Real AI Integration**
- Uses **OpenAI GPT-5.2**
- Analyzes transaction patterns
- Provides intelligent explanations
- 95% accuracy claim

### **Rule-Based Detection**
- Amount threshold: > ₹10,000
- Location mismatch detection
- Time-based risk scoring
- Multiple rapid transactions

---

## 🎨 Unique Design Elements

### **Cartoon/Gamified UI**
- 🥷 Masked thief for fraud alerts
- 🛡️ Shield icon for protection
- 🤖 Robot for AI features
- Bouncing and shaking animations
- Emojis throughout for engagement

### **Color Psychology**
- 🔵 Blue: Trust & Security
- 🔴 Red: Danger & Alerts
- 🟡 Yellow: Medium Risk
- 🟢 Green: Safe Transactions

---

## 🔥 Demo Flow for Presentation

### **Quick Demo (2 minutes)**
1. Show splash screen → Login with OTP
2. Show home dashboard with dummy data
3. Click "Send Money"
4. Enter ₹15,000 → Triggers fraud alert
5. Show cartoon alert popup
6. Click "Block It!" → Account frozen
7. Show countdown timer

### **Full Demo (5 minutes)**
1. Complete quick demo
2. Show transaction history
3. Explain AI analysis
4. Show profile screen
5. Demonstrate unfreeze feature
6. Discuss technical architecture

---

## 💡 Key Selling Points

### **For Teachers/Judges**
✅ Real AI integration (OpenAI GPT-5.2)  
✅ Professional dark-themed UI  
✅ Location-based fraud detection  
✅ Gamified user experience  
✅ Industry-standard tech stack  
✅ Full-stack implementation  

### **Unique Features**
🎯 Cartoon fraud alerts (memorable)  
🎯 Real-time AI analysis  
🎯 Automatic account freeze  
🎯 Risk score visualization  
🎯 Professional + playful balance  

---

## 🛠️ Technical Architecture

### **Frontend**
- React Native with Expo
- TypeScript
- React Navigation
- Animations with Reanimated
- Location services (expo-location)
- Haptic feedback

### **Backend**
- FastAPI (Python)
- MongoDB database
- OpenAI GPT-5.2 integration
- Real-time fraud detection
- Session management

### **AI/ML**
- OpenAI GPT-5.2 for analysis
- Rule-based risk scoring
- Pattern detection algorithms
- Location anomaly detection

---

## 📝 One-Liner for Presentation

> **"We built an AI-powered UPI fraud detection app with gamified cartoon alerts to improve user awareness and engagement, while providing enterprise-level security using OpenAI GPT-5.2."**

---

## 🎓 Project Highlights

- ✅ **Real-time fraud detection** with AI
- ✅ **Gamified UI** with cartoon elements
- ✅ **Full-stack implementation** (Frontend + Backend + Database + AI)
- ✅ **Industry-relevant** tech stack
- ✅ **User-friendly** and engaging
- ✅ **Secure** with account freeze mechanism
- ✅ **Scalable** architecture

---

## 🚀 Future Enhancements

- Voice alerts for suspicious transactions
- Fingerprint/Face ID integration
- ML model training on user behavior
- Social fraud reporting
- Reward system for secure behavior
- Integration with real payment gateways

---

## 📞 Support

For any issues or questions:
- Demo OTP: `123456`
- Default balance: ₹50,000
- Backend auto-creates users

**Enjoy the demo!** 🎉
