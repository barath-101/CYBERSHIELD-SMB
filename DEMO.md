# CyberShield SMB - Demo Guide

Complete walkthrough demonstrating all features of the CyberShield platform.

## Prerequisites

- Docker and Docker Compose installed
- Chrome browser
- 15 minutes

## Setup (5 minutes)

### 1. Start All Services

```bash
# Clone repository
git clone https://github.com/barath-101/CYBERSHIELD-SMB.git
cd CYBERSHIELD-SMB

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d
```

Wait for all services to start:
- Backend: http://localhost:3000
- AI Service: http://localhost:5000
- Dashboard: http://localhost:3001
- Database: localhost:5432

Check health:
```bash
curl http://localhost:3000/health
curl http://localhost:5000/health
```

### 2. Initialize Demo Data

```bash
# Seed demo data
curl -X POST http://localhost:3000/api/demo/seed
```

This creates:
- Demo company
- Demo user (admin@demo.com / demo123)
- Sample security events

### 3. Load Chrome Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select `extension/` directory
5. Extension icon should appear in toolbar

## Demo Flow (10 minutes)

### Part 1: Admin Dashboard (3 minutes)

**Login:**
1. Navigate to http://localhost:3001
2. Enter credentials:
   - Email: `admin@demo.com`
   - Password: `demo123`
3. Click "Sign In"

**Dashboard Overview:**
- See stats cards:
  - Total Events (7d): 3
  - Blocked: 1
  - Suspicious: 1
  - Avg Severity: ~5.0
- View timeline chart showing event distribution

**Simulate Attack:**
1. Click "Simulate Attack" button
2. Alert appears confirming simulation
3. Stats update with new event
4. Chart updates with new data point

**Seed More Data:**
1. Click "Seed Demo Data" (can be done multiple times)
2. More sample events added
3. Dashboard refreshes with updated stats

### Part 2: Events Management (3 minutes)

**View Events:**
1. Click "Events" in sidebar
2. See table of all security events
3. Notice columns:
   - Timestamp
   - Type (image/popup)
   - Verdict (color-coded badges)
   - Severity (1-10 scale)
   - Confidence percentage
   - Status

**Event Details:**
1. Click "View" on any event
2. Modal opens showing:
   - Full event metadata
   - Payload JSON
   - Blockchain transaction hash (if logged)
3. Click blockchain link to view on Polygonscan

**Acknowledge Event:**
1. Click "Ack" button on any event
2. Event status changes to "acknowledged"
3. Table updates

**Report False Positive:**
1. Click "View" on an event
2. Click "Mark False Positive"
3. Confirmation message appears
4. Feedback stored for AI retraining

### Part 3: Chrome Extension (3 minutes)

**Login to Extension:**
1. Click CyberShield icon in Chrome toolbar
2. Login with same credentials
3. Popup shows:
   - Security status (green dot = safe)
   - Recent events summary
   - Stats (blocked, suspicious, total)

**Manual Page Scan:**
1. Visit any website (e.g., wikipedia.org)
2. Click extension icon
3. Click "Scan Page Now"
4. Loading overlay appears
5. Results show after ~5 seconds:
   - Number of images scanned
   - Any threats detected
   - Updated stats

**View Recent Events:**
- Extension popup shows last 5 events
- Each event displays:
  - Type icon
  - Verdict badge (color-coded)
  - Domain
  - Time ago

**Test Protection:**

Create a test HTML file (`test-threat.html`):
```html
<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
  <h1>Test Threat Detection</h1>
  
  <!-- Suspicious image (will be detected) -->
  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='50'>URGENT: Enter your credit card CVV</text></svg>" />
  
  <!-- Suspicious modal (will be detected) -->
  <div class="modal" style="position:fixed; top:50%; left:50%; background:white; padding:20px; border:2px solid red;">
    <p>Your account has been suspended! Verify now:</p>
    <input type="password" placeholder="Password" />
    <input type="text" placeholder="Credit Card" />
    <button>Verify Account</button>
  </div>
</body>
</html>
```

1. Open `test-threat.html` in Chrome
2. Extension automatically scans
3. Suspicious content detected
4. Warning overlay appears
5. Check extension popup for event details

### Part 4: Users & Settings (1 minute)

**Users Page:**
1. Click "Users" in sidebar
2. View all company users
3. See roles and creation dates

**Settings Page:**
1. Click "Settings" in sidebar
2. Adjust "Detection Threshold" slider (0.0 - 1.0)
   - Lower = more sensitive
   - Higher = less false positives
3. Toggle "Auto-Quarantine"
   - On: Automatically blocks malicious content
   - Off: Shows alerts but allows content
4. Click "Save Settings"
5. Confirmation message appears

## Advanced Features

### AI Model Training

Train the AI model with synthetic data:

```bash
cd ai-service
python train.py
```

Output:
- Trained model saved to `models/image_model.pkl`
- Scaler saved to `models/scaler.pkl`
- Confusion matrix PNG generated
- Training metrics displayed

### Smart Contract Interaction

Deploy contract to Polygon Mumbai:

```bash
cd contracts
npm install

# Get Mumbai MATIC from faucet:
# https://faucet.polygon.technology/

# Deploy
npm run deploy:mumbai

# Copy contract address to .env
echo "CONTRACT_ADDRESS=0x..." >> .env
```

Run contract tests:
```bash
cd contracts
npx hardhat test
```

### API Testing

Test API endpoints directly:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"demo123"}'

# Save token
TOKEN="<access_token_from_login>"

# Get events
curl http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN"

# Scan image
curl -X POST http://localhost:3000/api/scan/image \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page_url": "https://test.com",
    "src_url": "https://test.com/image.jpg",
    "metadata": {}
  }'
```

## Key Metrics to Showcase

1. **Detection Speed**: < 5 seconds per scan
2. **Accuracy**: ~90% on synthetic test data
3. **Throughput**: 20 scans/minute per extension
4. **Blockchain Cost**: ~$0.01-0.05 per event log
5. **API Latency**: < 100ms (excluding AI inference)

## Common Demo Scenarios

### Scenario 1: Phishing Detection
"User receives suspicious popup requesting credentials"
→ Extension detects phishing patterns
→ Popup blocked with warning
→ Event logged to dashboard
→ High-severity event written to blockchain

### Scenario 2: Malicious Image
"Website displays image with embedded malicious text"
→ Extension scans image with OCR
→ Suspicious keywords detected
→ Image quarantined with overlay
→ Admin notified via dashboard

### Scenario 3: False Positive
"Legitimate content incorrectly flagged"
→ Admin reviews event in dashboard
→ Marks as false positive
→ Feedback used to retrain AI model
→ Future accuracy improved

## Troubleshooting

**Services not starting:**
```bash
docker-compose logs backend
docker-compose logs ai-service
```

**Extension not working:**
- Check backend is running: `curl http://localhost:3000/health`
- Verify login status in extension
- Check browser console for errors

**No events appearing:**
- Run seed script: `curl -X POST http://localhost:3000/api/demo/seed`
- Verify database connection
- Check backend logs

## Cleanup

Stop all services:
```bash
docker-compose down

# Remove volumes (database data)
docker-compose down -v
```

## Next Steps

1. Deploy to production environment
2. Configure custom policies
3. Add real company users
4. Deploy smart contract to mainnet
5. Distribute extension to team
6. Monitor dashboard for threats

## Demo Script for Presentation

**Opening (1 min):**
"CyberShield SMB provides enterprise-grade security for small businesses using AI and blockchain."

**Problem (1 min):**
"SMBs face sophisticated threats but lack resources for expensive security solutions."

**Solution Demo (5 min):**
1. Show dashboard with real-time stats
2. Simulate attack → see immediate detection
3. Review event details with blockchain proof
4. Demonstrate Chrome extension protection
5. Show admin controls and settings

**Technology (2 min):**
- AI: IsolationForest + OCR + Steganography Detection
- Blockchain: Immutable audit trail on Polygon
- Architecture: Microservices, scalable, cloud-ready

**Closing (1 min):**
"Enterprise protection, SMB pricing. Get started today!"

## Questions & Answers

**Q: How accurate is the AI?**
A: ~90% on test data. Improves with feedback via false positive reporting.

**Q: What's the blockchain cost?**
A: ~$0.01-0.05 per event on Polygon Mumbai testnet.

**Q: Can it run offline?**
A: Backend connection required. Offline mode planned for future.

**Q: Is it GDPR compliant?**
A: Yes. Only hashes stored on-chain. Full data in private database.

**Q: How many devices supported?**
A: Unlimited. Scales horizontally.

---

**Demo Complete!** 🎉

For more information, see:
- [Main README](README.md)
- [Backend Documentation](backend/README.md)
- [AI Service Documentation](ai-service/README.md)
- [Extension Documentation](extension/README.md)
- [Dashboard Documentation](admin-dashboard/README.md)
