const API_URL = 'http://localhost:3000';

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
  return res.json();
}

export const api = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: (token) =>
    request('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  createRegistro: (token, data) =>
    request('/mood', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  listRegistros: (token) =>
    request('/mood', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
