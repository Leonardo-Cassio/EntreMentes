/**
 * server.js — Ponto de entrada da API EntreMentes
 *
 * Responsabilidades:
 *   1. Configura o servidor Express (CORS, JSON parsing)
 *   2. Monta o Bull Board (painel visual da fila Redis)
 *   3. Inicia o Worker de classificação em background
 *   4. Registra todas as rotas da API REST
 *   5. Expõe a documentação Swagger em /docs
 */

require('dotenv').config(); // Carrega variáveis do .env (Railway injeta automaticamente em produção)
const express    = require('express');
const cors       = require('cors');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Dependências do painel visual de filas (Bull Board)
const { createBullBoard }    = require('@bull-board/api');
const { BullMQAdapter }      = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter }     = require('@bull-board/express');

// Fila BullMQ + conexão Redis (null se REDIS_URL não estiver definida)
const { classifyQueue, connection } = require('./queues/classifyQueue');
// Worker que consome os jobs da fila em background
const { iniciarWorker }             = require('./workers/classifyWorker');

const app = express();

// Permite requisições de qualquer origem (necessário para frontend Vercel + app mobile)
app.use(cors());
// Habilita parsing de JSON no corpo das requisições
app.use(express.json());

// ── Bull Board — Painel Visual da Fila ──────────────────────────────────────
// Disponível em: https://entrementes-production.up.railway.app/admin/queues
// Exibe jobs pendentes, em processamento, concluídos e com falha em tempo real
if (classifyQueue) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues'); // Rota base do painel

  createBullBoard({
    queues: [new BullMQAdapter(classifyQueue)], // Monitora a fila 'classificacao'
    serverAdapter,
  });

  // Monta o painel como middleware Express na rota /admin/queues
  app.use('/admin/queues', serverAdapter.getRouter());
  console.log('Bull Board disponível em /admin/queues');

  // Inicia o Worker — começa a escutar e processar jobs da fila imediatamente
  iniciarWorker(connection);
}

// ── Rotas da API REST ────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');      // POST /auth/register, POST /auth/login
const userRoutes      = require('./routes/userRoutes');      // GET/PUT/DELETE /users/me
const moodRoutes      = require('./routes/moodRoutes');      // CRUD /mood
const analyticsRoutes = require('./routes/analyticsRoutes'); // GET /analytics/profile, /analytics/summary

app.use('/auth',      authRoutes);
app.use('/users',     userRoutes);
app.use('/mood',      moodRoutes);
app.use('/analytics', analyticsRoutes);

// ── Documentação Swagger ─────────────────────────────────────────────────────
// Swagger UI interativo disponível em /docs (OpenAPI 3.0)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz — healthcheck básico da API
app.get('/', (req, res) => res.json({ success: true, message: "API EntreMentes OK" }));

// ── Inicialização do servidor ────────────────────────────────────────────────
// Railway injeta PORT automaticamente; fallback para 3000 em desenvolvimento local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
