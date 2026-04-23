import Constants from 'expo-constants';

// Em desenvolvimento, usa o IP da máquina onde o Expo está rodando.
// Assim funciona tanto no simulador quanto no dispositivo físico via Expo Go.
const getBaseUrl = () => {
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    return `http://${host}:3000`;
  }
  return 'https://sua-url-de-producao.com'; // TODO: substituir no deploy
};

const API_URL = getBaseUrl();

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
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
};
