/**
 * api.js — Camada de comunicação com a API REST do backend
 *
 * CONFIGURAÇÃO:
 *   A URL base é definida via variável de ambiente VITE_API_URL.
 *   Em desenvolvimento local: http://localhost:3000
 *   Em produção (Vercel):     https://entrementes-production.up.railway.app
 *
 * PADRÃO:
 *   Todos os métodos retornam o JSON da resposta diretamente.
 *   O backend sempre responde no formato: { success, data, message }
 */

// Lê a URL da API do ambiente (Vite expõe variáveis com prefixo VITE_)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * request — função base para todas as chamadas HTTP.
 * Adiciona Content-Type JSON automaticamente e faz o parse da resposta.
 *
 * @param {string} path    - Caminho relativo (ex: '/mood', '/auth/login')
 * @param {object} options - method, headers, body (opcionais)
 */
async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
  return res.json();
}

export const api = {
  // ── Autenticação ───────────────────────────────────────────────────────────

  /** POST /auth/register — Cria uma nova conta de usuário */
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  /** POST /auth/login — Autentica e retorna um JWT */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // ── Usuário ────────────────────────────────────────────────────────────────

  /** GET /users/me — Retorna os dados do usuário autenticado */
  getMe: (token) =>
    request('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /** PUT /users/me — Atualiza nome/email/senha do usuário */
  updateMe: (token, data) =>
    request('/users/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  /** DELETE /users/me — Remove a conta do usuário permanentemente */
  deleteMe: (token) =>
    request('/users/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ── Registros de Bem-Estar (/mood) ─────────────────────────────────────────

  /** POST /mood — Cria um registro e dispara classificação assíncrona (BullMQ) */
  createRegistro: (token, data) =>
    request('/mood', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  /** GET /mood — Lista todos os registros do usuário (suporta ?from&to&limit) */
  listRegistros: (token) =>
    request('/mood', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /** PUT /mood/:id — Atualiza um registro e re-dispara a classificação */
  updateRegistro: (token, id, data) =>
    request(`/mood/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  /** DELETE /mood/:id — Remove um registro específico */
  deleteRegistro: (token, id) =>
    request(`/mood/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ── Analytics / Perfil ────────────────────────────────────────────────────

  /** GET /analytics/profile — Retorna o perfil comportamental K-Means do usuário */
  getProfile: (token) =>
    request('/analytics/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
