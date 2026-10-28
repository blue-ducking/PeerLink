/**
 * PeerLink Centralized API Client
 * Wraps standard fetch() requests with consistent token handling, JSON serialization,
 * error extraction, and response normalization across all frontend pages.
 */

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.tokenKey = 'peerlink_token';
    this.userKey = 'peerlink_user';
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setSession(token, user) {
    if (token) localStorage.setItem(this.tokenKey, token);
    if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return Boolean(this.getToken());
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If 401 Unauthorized and user was logged in, clear session
        if (response.status === 401) {
          const wasLoggedIn = this.isLoggedIn();
          this.clearSession();
          // If on a protected page, redirect to login
          const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html') || window.location.pathname === '/';
          if (!isAuthPage && wasLoggedIn) {
            window.location.href = '/login.html?expired=1';
          }
        }
        const errorMsg = data.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `?${qs}`;
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async logout() {
    try {
      await this.post('/auth/logout', {});
    } catch (e) {
      // ignore
    }
    this.clearSession();
    window.location.href = '/login.html';
  }
}

// Global shared singleton instance
window.api = new ApiClient();
