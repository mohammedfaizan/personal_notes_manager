const API_BASE_URL = 'http://localhost:5007';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },

  auth: {
    getProfile: () => api.request('/auth/me'),
    logout: () => api.request('/auth/logout', { method: 'POST' }),
  },

  notes: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/api/notes${query ? `?${query}` : ''}`);
    },
    create: (note) => api.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    }),
    update: (id, note) => api.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    }),
    delete: (id) => api.request(`/api/notes/${id}`, { method: 'DELETE' }),
    togglePin: (id) => api.request(`/api/notes/${id}/pin`, { method: 'PATCH' }),
  },
};

export default api;