// Central REST API Client
const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const activeUserJson = localStorage.getItem('demo_user');
  const activeUser = activeUserJson ? JSON.parse(activeUserJson) : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(activeUser ? { 
      'x-demo-user-id': activeUser.userId,
      'x-demo-role': activeUser.role 
    } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errBody.message || `API Error (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}
