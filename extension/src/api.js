// API connector for CyberShield backend
const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  async setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    await chrome.storage.local.set({ 
      accessToken, 
      refreshToken 
    });
  }

  async getTokens() {
    if (!this.token || !this.refreshToken) {
      const data = await chrome.storage.local.get(['accessToken', 'refreshToken']);
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
    }
    return { accessToken: this.token, refreshToken: this.refreshToken };
  }

  async request(endpoint, options = {}) {
    const { accessToken } = await this.getTokens();
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle token expiration
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry request with new token
          config.headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
          return await retryResponse.json();
        } else {
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const { refreshToken } = await this.getTokens();
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        this.token = accessToken;
        await chrome.storage.local.set({ accessToken });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Auth methods
  async login(email, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    await this.setTokens(result.accessToken, result.refreshToken);
    await chrome.storage.local.set({ user: result.user });
    
    return result;
  }

  async register(email, password, companyId) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, companyId }
    });
  }

  async logout() {
    this.token = null;
    this.refreshToken = null;
    await chrome.storage.local.remove(['accessToken', 'refreshToken', 'user']);
  }

  // Scan methods
  async scanImage(payload) {
    return await this.request('/scan/image', {
      method: 'POST',
      body: payload
    });
  }

  async scanPopup(payload) {
    return await this.request('/scan/popup', {
      method: 'POST',
      body: payload
    });
  }

  // Events methods
  async getRecentEvents(companyId, limit = 10, offset = 0) {
    return await this.request(`/events?companyId=${companyId}&limit=${limit}&offset=${offset}`);
  }

  async getEvent(eventId) {
    return await this.request(`/events/${eventId}`);
  }

  async acknowledgeEvent(eventId) {
    return await this.request(`/events/${eventId}/acknowledge`, {
      method: 'PATCH'
    });
  }

  // Feedback methods
  async reportFalsePositive(eventId, notes) {
    return await this.request('/feedback', {
      method: 'POST',
      body: {
        eventId,
        label: 'false_positive',
        notes
      }
    });
  }

  // Policy methods
  async getPolicies(companyId) {
    return await this.request(`/policies/${companyId}`);
  }

  async updatePolicies(companyId, policy) {
    return await this.request(`/policies/${companyId}`, {
      method: 'POST',
      body: policy
    });
  }

  // Admin methods
  async getStats(companyId) {
    return await this.request(`/admin/stats?companyId=${companyId}`);
  }

  async getUsers(companyId) {
    return await this.request(`/admin/users?companyId=${companyId}`);
  }
}

// Export singleton instance
const apiClient = new APIClient();

// For use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiClient;
}
