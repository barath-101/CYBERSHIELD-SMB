import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request
            error.config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
            return this.client(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await this.client.post('/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', response.data.accessToken);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Stats
  async getStats(companyId) {
    const response = await this.client.get(`/admin/stats?companyId=${companyId || ''}`);
    return response.data.stats;
  }

  // Events
  async getEvents(params = {}) {
    const response = await this.client.get('/events', { params });
    return response.data.events;
  }

  async acknowledgeEvent(eventId) {
    const response = await this.client.patch(`/events/${eventId}/acknowledge`);
    return response.data;
  }

  // Feedback
  async submitFeedback(eventId, label, notes) {
    const response = await this.client.post('/feedback', { eventId, label, notes });
    return response.data;
  }

  // Users
  async getUsers(companyId) {
    const response = await this.client.get(`/admin/users?companyId=${companyId || ''}`);
    return response.data.users;
  }

  // Policies
  async getPolicy(companyId) {
    const response = await this.client.get(`/policies/${companyId}`);
    return response.data.policy;
  }

  async updatePolicy(companyId, policy) {
    const response = await this.client.post(`/policies/${companyId}`, policy);
    return response.data.policy;
  }

  // Demo
  async seedDemo() {
    const response = await this.client.post('/demo/seed');
    return response.data;
  }

  async simulateAttack() {
    const response = await this.client.post('/demo/simulate');
    return response.data;
  }
}

export default new APIService();
