# CyberShield SMB - Chrome Extension

Browser-level protection extension for real-time threat detection with AI-powered analysis.

## Features

- **Real-Time Scanning**: Automatically scans images and popups on web pages
- **AI-Powered Detection**: Uses machine learning to identify phishing and malicious content
- **Instant Blocking**: Quarantines malicious content before user interaction
- **Event Tracking**: Maintains history of detected threats
- **Blockchain Verification**: High-severity threats are logged to Polygon blockchain

## Installation

### For Development

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` directory

### For Production

1. Download the extension from Chrome Web Store (coming soon)
2. Click "Add to Chrome"
3. Sign in with your company credentials

## Usage

### Initial Setup

1. Click the CyberShield icon in your toolbar
2. Sign in with your credentials:
   - Email: `admin@demo.com`
   - Password: `demo123` (for demo)

### Scanning Pages

**Automatic Scanning:**
- Extension automatically scans images and popups as pages load
- No action required

**Manual Scanning:**
1. Click the CyberShield icon
2. Click "Scan Page Now"
3. Wait for results

### Viewing Threats

**Popup (Quick View):**
- Shows last 5 events
- Displays security status
- Quick stats (blocked, suspicious, total)

**Alerts Page (Full View):**
1. Click "View All Alerts" from popup
2. See complete event history
3. Filter by date, severity, type
4. View blockchain verification links

### Reporting False Positives

1. Open Alerts page
2. Click on the event
3. Click "Report False Positive"
4. Add notes (optional)
5. Submit

This helps improve the AI model accuracy.

## How It Works

### Image Detection

1. Content script detects images on page
2. Creates thumbnail (max 400px)
3. Sends to service worker
4. Service worker calls backend API
5. AI analyzes image features and OCR text
6. Returns verdict and action
7. If malicious, overlays warning on image

### Popup Detection

1. Content script monitors DOM for modals/overlays
2. Extracts visible text and form fields
3. Checks for phishing patterns
4. Sends to service worker for analysis
5. AI evaluates based on heuristics
6. If malicious, blocks popup with full-page warning

### Rate Limiting

- Maximum 20 scans per minute per tab
- Prevents API flooding
- Scans queued if limit exceeded

## Architecture

```
┌─────────────┐
│  Web Page   │
└──────┬──────┘
       │
       v
┌─────────────┐
│Content Script│ → Detects images/popups
└──────┬──────┘
       │
       v
┌─────────────┐
│Service Worker│ → Rate limiting, token management
└──────┬──────┘
       │
       v
┌─────────────┐
│   Backend   │ → API, AI inference, blockchain
└─────────────┘
```

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `src/popup.html/js/css` - Extension popup UI
- `src/content.js` - Content script (runs on web pages)
- `src/service_worker.js` - Background service worker
- `src/api.js` - Backend API client
- `src/alerts.html` - Full alerts page
- `src/settings.html` - Settings page
- `assets/icons/` - Extension icons

## Permissions

- `storage` - Store settings and tokens
- `activeTab` - Access current tab for scanning
- `scripting` - Inject content scripts
- `tabs` - Manage tabs for alerts page
- `alarms` - Token refresh scheduling
- `notifications` - Display threat alerts
- `host_permissions` - Scan web pages (all URLs)

## Privacy

- Only thumbnails are sent to backend (not full images)
- No browsing history is collected
- Tokens stored locally (encrypted by Chrome)
- User data never sold or shared

## Configuration

Extension connects to backend at:
- Development: `http://localhost:3000`
- Production: Set in `src/api.js`

## Troubleshooting

**Not Scanning:**
- Check if logged in
- Verify backend is running
- Check browser console for errors

**Login Failed:**
- Verify credentials
- Check backend connectivity
- Ensure database is running

**Images Not Blocked:**
- May be below size threshold (50x50px)
- May have low confidence score
- Check auto-quarantine setting

## Development

### Testing

1. Load extension in Chrome
2. Navigate to test pages
3. Check console logs
4. Verify API calls in Network tab

### Debugging

```javascript
// In background.js
chrome.runtime.onMessage.addListener((msg) => {
  console.log('Message:', msg);
});

// In content.js
console.log('Scanning:', element);
```

## Known Limitations

- Cannot scan canvas-rendered images
- CORS restrictions on some domains
- Rate limiting may delay scans
- Requires internet connection

## Future Enhancements

- Offline mode with local model
- Deep learning image classifier
- Advanced steganography detection
- Domain reputation scoring
- Custom blocklist management
- Team collaboration features

## Support

For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/barath-101/CYBERSHIELD-SMB/issues)
- Email: support@cybershield.example.com

## License

MIT License - See LICENSE file for details
