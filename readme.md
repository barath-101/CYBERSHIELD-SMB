# CyberShield SMB 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech-Stack-blue.svg)](https://github.com/barath-101/CYBERSHIELD-SMB)

**Enterprise-grade protection for the little guys**: An AI and blockchain-powered cybersecurity platform designed for small and medium businesses.

> A complete browser-level threat detection system with Chrome extension, AI microservice, blockchain audit trails, and admin dashboard.

## Overview

CyberShield SMB addresses the critical cybersecurity needs of small and medium businesses (SMBs) by providing enterprise-level protection at an accessible cost and with simplified implementation. By integrating AI-driven threat detection with blockchain-based audit trails, the platform ensures that security events are not only intelligently identified but also immutably recorded for complete transparency and verification.

## Problem Statement

Small and medium businesses face the same sophisticated cyber threats as large enterprises—including phishing, ransomware, and insider leaks—but often lack the financial resources and technical expertise to mount an effective defense. Traditional enterprise security solutions are prohibitively expensive or overly complex, leaving SMBs exposed and vulnerable to potentially devastating attacks.

## Solution Overview

CyberShield SMB delivers comprehensive cybersecurity tailored for SMBs through a combination of advanced technologies and user-friendly design:

- **AI-Driven Threat Detection**: Utilizes machine learning models, such as Isolation Forest and TensorFlow Lite, to identify anomalies in network traffic and user behavior in real time.
- **Blockchain Audit Trails**: Leverages the Polygon testnet to create tamper-proof records of all security events, ensuring verifiable and immutable logs.
- **Smart React Dashboard**: Offers an intuitive interface for real-time threat visualization, analytics, and automation controls.
- **Automated Response Playbooks**: Enables instant remediation through pre-defined YAML-based playbooks that trigger automated actions.
- **Secure API Gateway**: Incorporates JWT authentication, HTTPS encryption, and rate limiting to protect all endpoints and communications.

## Architecture Overview

The system is built on a modular architecture that supports scalability and ease of deployment:

```
User/Admin (SMB)
       │
       ▼
React Dashboard (Frontend)
    ├── Real-time Analytics (WebSocket)
    ├── Threat Monitor
    └── Automation Controls
       │
       ▼
Central Backend Server (Spring Boot)
       ├── AI Threat Engine
       │   (Isolation Forest, TensorFlow Lite)
       │   - Anomaly Detection
       │   - Threat Scoring
       ├── Blockchain Logger
       │   (Polygon Testnet, Smart Contracts)
       │   - Immutable Logs
       │   - Event Verification
       └── Database System
           (PostgreSQL + Redis)
           - Users & Agents
           - Threat History
           - Configs & Alerts
       │
       ▼
Endpoint Agents (Node.js)
- Monitors Logs & Network Events
- Sends Alerts via Email/UI
- Auto-Remediation Triggers
       │
       ▼
Secure API Gateway
- JWT Auth, HTTPS, Rate Limiting
- Routes traffic between agents & backend
```

## Implementation Strategy

### Core Technology Stack

| Layer      | Technology Stack                  | Role                                      |
|------------|-----------------------------------|-------------------------------------------|
| Frontend  | React + Material UI              | Interactive dashboard for monitoring and configuration |
| Backend   | Spring Boot                      | API handling, business logic, and agent communication |
| Database  | PostgreSQL + Redis               | Storage for users, threat logs, and cached events |
| AI Layer  | scikit-learn (Isolation Forest) / TensorFlow Lite | Real-time anomaly detection in device activity |
| Blockchain| Polygon Testnet via Web3.js      | Secure, immutable event logging           |
| Agents    | Node.js scripts                  | Lightweight clients for SMB device monitoring |

### Key Implementation Steps

1. **User Authentication**: Secure login via JWT-based portals for admins.
2. **Agent Registration**: Devices register and stream data to the backend.
3. **Threat Detection**: AI models analyze patterns for real-time identification.
4. **Event Logging**: Verified incidents are recorded on the blockchain.
5. **Notification & Response**: Dashboard alerts and automated playbook execution.

## Features

- **Real-Time Monitoring**: Continuous surveillance of network and user activities with instant alerts.
- **Automated Remediation**: Pre-configured responses to threats, reducing manual intervention.
- **Transparent Auditing**: Blockchain-verified logs for compliance and forensic analysis.
- **Scalable Design**: Microservice architecture supporting growth from small deployments to larger networks.
- **Cost-Effective**: Modular pricing model allowing SMBs to enable only necessary features.

## Overcoming Barriers and Feasibility

### Challenges and Mitigations

| Challenge                  | Risk                          | Mitigation Strategy                          |
|----------------------------|-------------------------------|----------------------------------------------|
| Limited AI Training Data   | Increased False Positives    | Generate synthetic datasets and implement feedback loops for model refinement. |
| Blockchain Latency         | Delayed Event Confirmation   | Utilize Polygon testnet for faster batch processing. |
| Cost Constraints           | Affordability for SMBs       | Adopt a pay-per-module pricing structure.   |
| Technical Complexity       | Adoption Resistance          | Provide no-code interfaces for non-technical users. |

### Feasibility Assessment

- **Resource Efficiency**: Operates on lightweight infrastructure with PostgreSQL and Spring Boot.
- **Scalability**: Designed with microservices for easy expansion.
- **Offline Capability**: Supports demo modes without external dependencies.
- **Open-Source Nature**: Promotes transparency and community contributions.

## Potential Impact

- **Economic**: Empowers over 30 million SMBs globally with affordable cybersecurity, reducing financial losses from breaches.
- **Social**: Enhances digital security, fostering trust and stability in business operations.
- **Environmental**: Cloud-optimized deployment minimizes server overhead and energy consumption.
- **Technological**: Demonstrates innovative fusion of AI and blockchain for accessible, scalable defense.

## Key Benefits

- Enterprise-level security adapted for SMB budgets and expertise.
- Minimal configuration required for real-time anomaly detection.
- Complete transparency through blockchain-verified incident records.
- Proactive automation to mitigate threats before they escalate.
- Extensible open-source framework for custom integrations and playbooks.

## Future Scope

- Integration with established platforms like Microsoft Defender and CrowdStrike APIs.
- Implementation of Zero-Trust Access Control mechanisms.
- Advancement to adaptive AI through federated learning models.
- Development of a cloud console for managed service provider (MSP) partnerships.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service development)
- Polygon Mumbai testnet wallet with MATIC (for blockchain features)

### One-Command Setup

```bash
# Clone repository
git clone https://github.com/barath-101/CYBERSHIELD-SMB.git
cd CYBERSHIELD-SMB

# Copy environment template
cp .env.example .env

# Start all services with Docker Compose
docker-compose up
```

Services will be available at:
- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Default Credentials

```
Email: admin@demo.com
Password: demo123
```

## 📦 Repository Structure

```
CyberShield-SMB/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── config/       # Database, Redis, JWT config
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   └── db/init.sql       # Database schema
│
├── ai-service/           # Python FastAPI AI microservice
│   ├── models/           # Trained ML models
│   ├── utils/            # Feature extraction, OCR, steg detection
│   ├── train.py          # Model training script
│   ├── retrain.py        # Feedback-based retraining
│   └── inference.py      # Threat detection logic
│
├── contracts/            # Solidity smart contracts
│   ├── contracts/        # SecurityAudit.sol
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
│
├── extension/            # Chrome extension (Manifest V3)
│   ├── src/
│   │   ├── popup.*       # Extension popup UI
│   │   ├── content.js    # Page scanning script
│   │   ├── service_worker.js
│   │   └── api.js        # Backend connector
│   └── manifest.json
│
├── admin-dashboard/      # React + Material UI dashboard
│   └── src/
│       ├── pages/        # Dashboard, Events, Users, Settings
│       ├── components/   # Reusable components
│       └── services/     # API client
│
├── docker-compose.yml    # Multi-container orchestration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Demo Pitch Flow

1. Highlight the SMB security gap with real-world examples.
2. Demonstrate the dashboard responding to a simulated threat.
3. Showcase blockchain-verified event logs.
4. Present a cost comparison emphasizing affordability.
5. Conclude with the core message: "Enterprise-grade protection for the little guys."

## Team and Roles

| Member     | Role                  | Contribution                              |
|------------|-----------------------|-------------------------------------------|
| Barath G   | Backend & Architecture Lead | Integration of Spring Boot, databases, and AI components |
| [Teammate 2] | Frontend Lead      | Development of React dashboard and WebSocket functionality |
| [Teammate 3] | Blockchain Specialist | Polygon testnet and smart contract implementation |
| [Teammate 4] | Design & Presentation | Documentation, visual design, and project storytelling |

## Research and References

- [OWASP Top 10 2023](https://owasp.org/www-project-top-ten/)
- [Polygon Developer Documentation](https://wiki.polygon.technology/docs/develop/)
- [TensorFlow Lite for Anomaly Detection](https://www.tensorflow.org/lite)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## 🔧 Detailed Setup

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

**Environment Variables:**
See `.env.example` for required configuration.

**Database Initialization:**
```bash
# Database will auto-initialize from db/init.sql
# Or manually run:
psql -U cybershield -d cybershield_db -f db/init.sql
```

### AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt

# Train the model
python train.py

# Start service
python app.py
```

**Requirements:**
- Tesseract OCR installed (`apt-get install tesseract-ocr`)
- Trained model files in `models/` directory

### Smart Contract Deployment

```bash
cd contracts
npm install

# Deploy to Polygon Mumbai testnet
npm run deploy:mumbai

# Update CONTRACT_ADDRESS in .env
```

**Get Mumbai MATIC:**
https://faucet.polygon.technology/

### Chrome Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/` directory
5. Sign in with demo credentials

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm start
```

Opens at http://localhost:3000

## 📖 Usage Guide

### For End Users (Chrome Extension)

1. **Install Extension** - Load from Chrome Web Store or developer mode
2. **Sign In** - Click extension icon, enter credentials
3. **Automatic Protection** - Extension scans pages automatically
4. **View Threats** - Click extension to see recent events
5. **Manual Scan** - Click "Scan Page Now" for immediate check

### For Administrators (Dashboard)

1. **Login** - Navigate to dashboard, sign in
2. **View Statistics** - Monitor threat metrics and trends
3. **Review Events** - Check all detected threats
4. **Acknowledge Alerts** - Mark events as reviewed
5. **Report False Positives** - Improve AI accuracy
6. **Configure Policies** - Set detection thresholds
7. **Manage Users** - View company users

### Demo Mode

**Seed Demo Data:**
```bash
curl -X POST http://localhost:3000/api/demo/seed
```

**Simulate Attack:**
```bash
curl -X POST http://localhost:3000/api/demo/simulate
```

Or use buttons in the Dashboard UI.

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Contract Tests

```bash
cd contracts
npx hardhat test
```

### AI Service Tests

```bash
cd ai-service
pytest tests/
```

## 🔐 Security Features

- **AI-Powered Detection**: IsolationForest + heuristics
- **OCR Analysis**: Extract and analyze text in images
- **Steganography Detection**: LSB and statistical analysis
- **Real-Time Blocking**: Quarantine threats instantly
- **Blockchain Audit**: Immutable event logging
- **JWT Authentication**: Secure API access
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Protect against injection attacks

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Scanning
```
POST /api/scan/image
POST /api/scan/popup
```

### Events
```
GET /api/events
GET /api/events/:id
PATCH /api/events/:id/acknowledge
```

### Admin
```
GET /api/admin/stats
GET /api/admin/users
POST /api/admin/blockdomain
```

### Policies
```
GET /api/policies/:companyId
POST /api/policies/:companyId
```

### Demo
```
POST /api/demo/seed
POST /api/demo/simulate
```

See component READMEs for detailed API documentation.

## 🚢 Deployment

### Development
```bash
docker-compose up
```

### Production

**Backend**: Deploy to Railway, Render, or AWS EC2
**AI Service**: Deploy to EC2 with GPU (optional) or standard compute
**Dashboard**: Deploy to Vercel or Netlify
**Smart Contract**: Already deployed to Polygon Mumbai

**Environment Setup:**
1. Set production database credentials
2. Configure production API URLs
3. Set JWT secrets
4. Add blockchain private key
5. Enable HTTPS

## 📊 Performance

- **API Latency**: < 100ms (without AI)
- **AI Inference**: < 5s per request
- **Scan Rate**: 20 requests/minute per extension
- **Blockchain**: ~100k gas per event (~$0.01-0.05)

## 🐛 Troubleshooting

**Extension not scanning:**
- Verify backend is running
- Check login status
- Review browser console

**AI service errors:**
- Ensure Tesseract is installed
- Check model files exist
- Verify Python dependencies

**Blockchain errors:**
- Verify wallet has Mumbai MATIC
- Check RPC URL is accessible
- Ensure contract is deployed

**Database connection failed:**
- Check PostgreSQL is running
- Verify credentials in .env
- Test connection manually

## 🔮 Future Roadmap

- [ ] Deep learning image classifier (CNN)
- [ ] Multi-language OCR support
- [ ] Browser fingerprinting detection
- [ ] Zero-trust network integration
- [ ] Mobile app (React Native)
- [ ] MSP management console
- [ ] Advanced threat intelligence feeds
- [ ] Federated learning for privacy-preserving AI

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for SMBs worldwide**

*CyberShield SMB represents a committed effort to bridge the cybersecurity divide, proving that robust, intelligent defense can be both accessible and effective for small businesses.*