// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});

async function init() {
  // Check if user is logged in
  const { user } = await chrome.storage.local.get('user');
  
  if (user) {
    showMainContent(user);
    await loadStatus();
    await loadEvents();
  } else {
    showLogin();
  }
  
  // Set up event listeners
  setupEventListeners();
}

function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
}

function showMainContent(user) {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('userEmail').textContent = user.email;
}

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin();
    });
  }
  
  // Scan now button
  document.getElementById('scanNowBtn')?.addEventListener('click', async () => {
    await scanCurrentPage();
  });
  
  // Open alerts
  document.getElementById('openAlertsBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/alerts.html') });
  });
  
  // Open settings
  document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/settings.html') });
  });
  
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await apiClient.logout();
    location.reload();
  });
}

async function handleLogin() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const errorEl = document.getElementById('loginError');
  
  try {
    errorEl.style.display = 'none';
    
    const result = await apiClient.login(email, password);
    
    // Reload popup to show main content
    location.reload();
  } catch (error) {
    errorEl.textContent = error.message || 'Login failed';
    errorEl.style.display = 'block';
  }
}

async function loadStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot';
    
    if (response.status === 'danger') {
      statusDot.classList.add('danger');
      statusText.textContent = 'Threats Detected';
    } else if (response.status === 'warning') {
      statusDot.classList.add('warning');
      statusText.textContent = 'Suspicious Activity';
    } else {
      statusText.textContent = 'Protected';
    }
    
    // Update stats
    document.getElementById('maliciousCount').textContent = response.malicious || 0;
    document.getElementById('suspiciousCount').textContent = response.suspicious || 0;
    document.getElementById('totalCount').textContent = response.recent.length || 0;
    
  } catch (error) {
    console.error('Load status error:', error);
  }
}

async function loadEvents() {
  try {
    const { events = [] } = await chrome.storage.local.get('events');
    
    const container = document.getElementById('recentEvents');
    
    if (events.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent events</p>';
      return;
    }
    
    // Show last 5 events
    const recent = events.slice(0, 5);
    
    container.innerHTML = recent.map(event => {
      const time = formatTime(event.timestamp);
      const url = new URL(event.url).hostname;
      
      return `
        <div class="event-item ${event.verdict}" data-id="${event.id}">
          <div class="event-header">
            <span class="event-type">${event.type}</span>
            <span class="event-badge ${event.verdict}">${event.verdict}</span>
          </div>
          <div class="event-url">${url}</div>
          <div class="event-time">${time}</div>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.event-item').forEach(item => {
      item.addEventListener('click', () => {
        const eventId = item.dataset.id;
        chrome.tabs.create({ 
          url: chrome.runtime.getURL(`src/alerts.html?event=${eventId}`) 
        });
      });
    });
    
  } catch (error) {
    console.error('Load events error:', error);
  }
}

async function scanCurrentPage() {
  try {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send scan message to content script
    await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_NOW' });
    
    // Wait a bit for scans to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Reload events
    await loadStatus();
    await loadEvents();
    
    loadingOverlay.style.display = 'none';
  } catch (error) {
    console.error('Scan error:', error);
    document.getElementById('loadingOverlay').style.display = 'none';
    alert('Scan failed. Please try again.');
  }
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
