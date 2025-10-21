# CyberShield Admin Dashboard

React-based admin dashboard for managing security events, users, and policies.

## Features

- **Dashboard**: Real-time stats, charts, and event timeline
- **Events Management**: View, acknowledge, and report false positives
- **User Management**: View company users and roles
- **Settings**: Configure security policies and thresholds
- **Demo Mode**: Seed demo data and simulate attacks

## Tech Stack

- React 18
- Material-UI (MUI) 5
- React Router v6
- Recharts for visualizations
- Axios for API calls
- date-fns for date formatting

## Setup

### Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The dashboard will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` directory.

## Configuration

Set environment variables in `.env`:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

## Usage

### Login

Default credentials for demo:
- Email: `admin@demo.com`
- Password: `demo123`

### Dashboard

- **Total Events**: Count of events in last 7 days
- **Blocked**: Number of quarantined threats
- **Suspicious**: Number of suspicious detections
- **Avg Severity**: Average threat severity score
- **Timeline Chart**: 30-day event trend

**Demo Actions:**
- **Seed Demo Data**: Adds sample events to database
- **Simulate Attack**: Creates a simulated malicious event

### Events Page

View all security events with:
- Timestamp
- Type (image/popup)
- Verdict (malicious/suspicious/safe)
- Severity (1-10)
- Confidence score
- Status

**Actions:**
- **View**: See event details and payload
- **Acknowledge**: Mark event as reviewed
- **Mark False Positive**: Submit feedback to improve AI

### Users Page

View all users in your company:
- Email address
- Role (admin/user)
- Creation date

### Settings Page

Configure security policies:
- **Detection Threshold**: Minimum confidence for threat detection (0.0 - 1.0)
- **Auto-Quarantine**: Automatically block malicious content

## Components

### Layout Component

Responsive layout with:
- Side navigation
- Top app bar
- Menu items (Dashboard, Events, Users, Settings)
- Logout button

### Pages

- `Login.js`: Authentication page
- `Dashboard.js`: Main dashboard with stats and charts
- `Events.js`: Event table and details
- `Users.js`: User management
- `Settings.js`: Policy configuration

### Services

- `api.js`: Backend API client with token management

## API Integration

The dashboard communicates with the backend API:

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/refresh`: Token refresh

### Statistics
- `GET /api/admin/stats`: Dashboard statistics

### Events
- `GET /api/events`: List events
- `PATCH /api/events/:id/acknowledge`: Acknowledge event
- `POST /api/feedback`: Submit feedback

### Users
- `GET /api/admin/users`: List users

### Policies
- `GET /api/policies/:companyId`: Get policy
- `POST /api/policies/:companyId`: Update policy

### Demo
- `POST /api/demo/seed`: Seed demo data
- `POST /api/demo/simulate`: Simulate attack

## Deployment

### Docker

```bash
docker build -t cybershield-dashboard .
docker run -p 3000:3000 cybershield-dashboard
```

### Docker Compose

Already configured in root `docker-compose.yml`:

```bash
docker-compose up dashboard
```

### Production (Vercel/Netlify)

1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

## Development

### Project Structure

```
admin-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Events.js
│   │   ├── Users.js
│   │   └── Settings.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.js`
3. Add menu item in `Layout.js`

### Styling

Uses Material-UI with custom theme:
- Primary color: `#0B61A4` (deep blue)
- Secondary color: `#19A974` (green)
- Error color: `#E53E3E` (red)
- Warning color: `#F6A623` (orange)

## Testing

```bash
npm test
```

## Troubleshooting

**Login fails:**
- Check backend is running
- Verify API URL in environment
- Check credentials

**Stats not loading:**
- Ensure database is seeded
- Check backend logs
- Verify token is valid

**Charts not rendering:**
- Ensure time series data exists
- Check console for errors
- Verify date format

## Future Enhancements

- WebSocket integration for real-time updates
- Advanced filtering and search
- Export events to CSV
- Email notifications configuration
- Custom alert rules
- Team collaboration features
- Multi-language support

## License

MIT
