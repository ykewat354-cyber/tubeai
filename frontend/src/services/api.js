const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get stored auth token
 */
function getToken() {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/**
 * Save auth token
 */
function saveToken(token) {
  try {
    localStorage.setItem('token', token);
  } catch {
    // silent fail for SSR
  }
}

/**
 * Clear auth token
 */
function clearToken() {
  try {
    localStorage.removeItem('token');
  } catch {
    // silent fail for SSR
  }
}

/**
 * Generic API request with auth headers
 */
async function api(path, options = {}) {
  const url = `${API_URL}${path}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      ...data,
    };
  }

  return data;
}

// ===== Auth API =====
export const auth = {
  register: (name, email, password) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => api('/auth/me'),
};

// ===== Generation API =====
export const generate = {
  create: (topic, format = 'all') =>
    api('/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, format }),
    }),

  getDetail: (id) => api(`/generate/${id}`),

  delete: (id) =>
    api(`/generate/${id}`, { method: 'DELETE' }),
};

// ===== History API =====
export const history = {
  list: (page = 1, limit = 20) =>
    api(`/history?page=${page}&limit=${limit}`),

  search: (q) => api(`/history/search?q=${encodeURIComponent(q)}`),
};

// ===== Subscription API =====
export const subscription = {
  checkout: (plan) =>
    api('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  managePortal: () => api('/subscription/portal'),

  checkSession: (sessionId) =>
    api(`/subscription/check-session?session_id=${sessionId}`),
};

// Export helpers for components
export { saveToken, clearToken, getToken };
