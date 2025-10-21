# CyberShield Backend API

Node.js + Express REST API server with JWT authentication, PostgreSQL, Redis, and blockchain integration.

## Features

- RESTful API with Express
- JWT-based authentication with refresh tokens
- PostgreSQL database with connection pooling
- Redis caching for performance
- Rate limiting and security middleware
- WebSocket support for real-time updates
- Blockchain integration (Polygon Mumbai)
- AI service client
- Demo endpoints for testing

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **Blockchain**: Web3.js
- **WebSocket**: Socket.io

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env` file (see `.env.example` in root):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://cybershield:cybershield123@localhost:5432/cybershield_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:5000
ETH_RPC_URL=https://rpc-mumbai.maticvigil.com
ETH_PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS=0x...
```

### Database Setup

Initialize database:
```bash
psql -U cybershield -d cybershield_db -f db/init.sql
```

Or use Docker Compose which auto-initializes.

### Run

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "companyId": 1,
  "role": "user"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "companyId": 1,
    "role": "user"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**POST /api/auth/refresh**
```json
{
  "refreshToken": "eyJ..."
}
```

### Scanning

**POST /api/scan/image**

Headers: `Authorization: Bearer <token>`

```json
{
  "thumbnail_base64": "data:image/jpeg;base64,...",
  "src_url": "https://example.com/image.jpg",
  "page_url": "https://example.com",
  "mime": "image/jpeg",
  "metadata": {
    "width": 800,
    "height": 600
  }
}
```

Response:
```json
{
  "eventId": 123,
  "verdict": "malicious",
  "severity": 8,
  "confidence": 0.92,
  "extracted_text": "Enter your password",
  "suspect_regions": [],
  "reason_codes": ["suspicious_text_content"],
  "action": "quarantine"
}
```

**POST /api/scan/popup**
```json
{
  "page_url": "https://example.com",
  "raw_text": "Urgent: Verify your account",
  "field_labels": ["password", "credit_card"]
}
```

### Events

**GET /api/events**

Query params:
- `companyId`: Filter by company (optional)
- `limit`: Results per page (default: 10)
- `offset`: Pagination offset (default: 0)

**GET /api/events/:id**

**PATCH /api/events/:id/acknowledge**

### Feedback

**POST /api/feedback**
```json
{
  "eventId": 123,
  "label": "false_positive",
  "notes": "This is a legitimate image"
}
```

### Policies

**GET /api/policies/:companyId**

**POST /api/policies/:companyId**
```json
{
  "threshold": 0.7,
  "auto_quarantine": true
}
```

### Admin

**GET /api/admin/stats?companyId=1**

Response:
```json
{
  "stats": {
    "total": 150,
    "blocked": 12,
    "suspicious": 28,
    "avgSeverity": 4.2,
    "timeSeries": [
      { "date": "2024-01-01", "count": 5 },
      ...
    ]
  }
}
```

**GET /api/admin/users?companyId=1**

**POST /api/admin/blockdomain**
```json
{
  "domain": "malicious-site.com"
}
```

### Demo

**POST /api/demo/seed**

Adds 3 sample events to database.

**POST /api/demo/simulate**

Creates a simulated malicious event.

## Architecture

```
Client Request
     ↓
Rate Limiter
     ↓
Authentication Middleware
     ↓
Route Handler
     ↓
Service Layer → AI Service (HTTP)
     ↓              ↓
Database ← Blockchain Service
     ↓
Response
```

## Services

### authService
- User registration
- Login with password hashing
- Token generation and refresh

### scanService
- Image and popup scanning
- AI service integration
- Event storage
- Blockchain logging

### blockchainService
- Web3 integration
- Event hashing
- Transaction submission

### dbService
- PostgreSQL queries
- Connection pooling

### cacheService
- Redis operations
- Verdict caching

## Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes
- **JWT**: Access and refresh tokens
- **bcrypt**: Password hashing (10 rounds)
- **Input Validation**: Joi schemas
- **SQL Injection**: Parameterized queries

## WebSocket

Real-time event updates via Socket.io:

```javascript
// Server
io.on('connection', (socket) => {
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
  });
});

// Emit to company
io.to(`company-${companyId}`).emit('new-event', event);
```

## Testing

```bash
npm test
```

Tests use:
- Jest
- Supertest

## Deployment

### Docker

```bash
docker build -t cybershield-backend .
docker run -p 3000:3000 --env-file .env cybershield-backend
```

### Production

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Enable HTTPS
4. Set up database backups
5. Configure monitoring
6. Use process manager (PM2)

```bash
npm install -g pm2
pm2 start src/index.js --name cybershield-backend
```

## Monitoring

- Health check: `GET /health`
- Logs: Winston (console + file)
- Metrics: Can integrate Prometheus

## Troubleshooting

**Database connection error:**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -U cybershield -d cybershield_db
```

**Redis connection error:**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**AI service timeout:**
- Check AI service is running on port 5000
- Increase timeout in config
- Check network connectivity

## License

MIT
