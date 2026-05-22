import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Quando rodando como web (expo start --web), usa sempre a URL de produção
// pois não há backend local. Em nativo (Expo Go / build), usa o IP da máquina
// para apontar para o backend local em desenvolvimento.
const getBaseUrl = () => {
  if (__DEV__ && Platform.OS !== 'web') {
    const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    return `http://${host}:3000`;
  }
  return 'https://entrementes-production.up.railway.app';
};

const API_URL = getBaseUrl();

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

  updateMe: (token, data) =>
    request('/users/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  deleteMe: (token) =>
    request('/users/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getProfile: (token) =>
    request('/analytics/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
