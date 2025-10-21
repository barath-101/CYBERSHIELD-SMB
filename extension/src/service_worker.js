// Service worker for CyberShield extension
importScripts('api.js');

// Rate limiting
const SCAN_RATE_LIMIT = 20; // requests per minute
const scanQueue = [];
let scanCount = 0;

// Reset scan count every minute
setInterval(() => {
  scanCount = 0;
}, 60000);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_IMAGE') {
    handleImageScan(message.data, sender.tab).then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'SCAN_POPUP') {
    handlePopupScan(message.data, sender.tab).then(sendResponse);
    return true;
  }
  
  if (message.type === 'GET_STATUS') {
    getSecurityStatus().then(sendResponse);
    return true;
  }
  
  if (message.type === 'LOGIN') {
    apiClient.login(message.data.email, message.data.password)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Handle image scan requests
async function handleImageScan(data, tab) {
  try {
    // Rate limiting
    if (scanCount >= SCAN_RATE_LIMIT) {
      console.log('Rate limit exceeded, queuing scan');
      return { 
        verdict: 'safe', 
        action: 'allow',
        message: 'Rate limit exceeded, scan queued' 
      };
    }
    
    scanCount++;
    
    // Get user info
    const { user } = await chrome.storage.local.get('user');
    
    if (!user) {
      return { error: 'Not logged in', verdict: 'safe', action: 'allow' };
    }
    
    // Prepare scan payload
    const payload = {
      thumbnail_base64: data.thumbnail,
      src_url: data.src,
      page_url: tab.url,
      mime: data.mime,
      metadata: {
        agentId: null,
        width: data.width,
        height: data.height,
        timestamp: Date.now()
      }
    };
    
    // Call backend API
    const result = await apiClient.scanImage(payload);
    
    // Store event in local storage
    await storeEvent(result, 'image', tab.url);
    
    // Update badge if malicious
    if (result.verdict === 'malicious' || result.verdict === 'suspicious') {
      updateBadge(result.verdict);
    }
    
    // Send notification if needed
    if (result.action === 'quarantine') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/icon128.png',
        title: 'CyberShield Alert',
        message: `Malicious content blocked on ${new URL(tab.url).hostname}`,
        priority: 2
      });
    }
    
    return result;
  } catch (error) {
    console.error('Image scan error:', error);
    return { 
      error: error.message, 
      verdict: 'safe', 
      action: 'allow' 
    };
  }
}

// Handle popup scan requests
async function handlePopupScan(data, tab) {
  try {
    if (scanCount >= SCAN_RATE_LIMIT) {
      console.log('Rate limit exceeded');
      return { verdict: 'safe', action: 'allow' };
    }
    
    scanCount++;
    
    const { user } = await chrome.storage.local.get('user');
    
    if (!user) {
      return { error: 'Not logged in', verdict: 'safe', action: 'allow' };
    }
    
    const payload = {
      page_url: tab.url,
      raw_text: data.text,
      field_labels: data.fields || [],
      agentId: null
    };
    
    const result = await apiClient.scanPopup(payload);
    
    await storeEvent(result, 'popup', tab.url);
    
    if (result.verdict === 'malicious' || result.verdict === 'suspicious') {
      updateBadge(result.verdict);
      
      if (result.action === 'quarantine') {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../assets/icons/icon128.png',
          title: 'CyberShield Alert',
          message: `Suspicious popup detected and blocked`,
          priority: 2
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Popup scan error:', error);
    return { error: error.message, verdict: 'safe', action: 'allow' };
  }
}

// Store event in local storage for popup UI
async function storeEvent(result, type, url) {
  try {
    const { events = [] } = await chrome.storage.local.get('events');
    
    const newEvent = {
      id: result.eventId,
      type,
      verdict: result.verdict,
      severity: result.severity,
      confidence: result.confidence,
      action: result.action,
      url,
      timestamp: Date.now()
    };
    
    // Keep only last 50 events
    events.unshift(newEvent);
    if (events.length > 50) {
      events.pop();
    }
    
    await chrome.storage.local.set({ events });
  } catch (error) {
    console.error('Error storing event:', error);
  }
}

// Update extension badge
function updateBadge(verdict) {
  const colors = {
    'malicious': '#E53E3E',
    'suspicious': '#F6A623',
    'safe': '#19A974'
  };
  
  chrome.action.setBadgeBackgroundColor({ color: colors[verdict] || '#999' });
  chrome.action.setBadgeText({ text: '!' });
  
  // Clear badge after 10 seconds
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 10000);
}

// Get security status
async function getSecurityStatus() {
  try {
    const { events = [] } = await chrome.storage.local.get('events');
    
    const recent = events.slice(0, 10);
    const malicious = recent.filter(e => e.verdict === 'malicious').length;
    const suspicious = recent.filter(e => e.verdict === 'suspicious').length;
    
    let status = 'safe';
    if (malicious > 0) {
      status = 'danger';
    } else if (suspicious > 0) {
      status = 'warning';
    }
    
    return { status, recent, malicious, suspicious };
  } catch (error) {
    return { status: 'unknown', recent: [], malicious: 0, suspicious: 0 };
  }
}

// Periodic token refresh
chrome.alarms.create('tokenRefresh', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'tokenRefresh') {
    apiClient.refreshAccessToken().catch(console.error);
  }
});

console.log('CyberShield service worker loaded');
