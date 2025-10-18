# CyberShield SMB

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech-Stack-blue.svg)](https://github.com/your-repo/CyberShield-SMB)

Enterprise-grade protection for the little guys: An AI and blockchain-powered cybersecurity platform designed for small and medium businesses.

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

## Repository Structure

```
CyberShield-SMB/
│
├── frontend/           # React + Material UI dashboard
├── backend/            # Spring Boot API, AI, and blockchain modules
├── agents/             # Lightweight Node.js device agents
├── demo-data/          # Synthetic JSON for threat simulation
├── docs/               # Documentation, reports, and references
└── README.md           # Project overview (this file)
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

---

*CyberShield SMB represents a committed effort to bridge the cybersecurity divide, proving that robust, intelligent defense can be both accessible and effective for small businesses.*