require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const { createBullBoard }    = require('@bull-board/api');
const { BullMQAdapter }      = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter }     = require('@bull-board/express');

const { classifyQueue, connection } = require('./queues/classifyQueue');
const { iniciarWorker }             = require('./workers/classifyWorker');

const app = express();
app.use(cors());
app.use(express.json());

// ── Bull Board (painel visual da fila) ───────────────────────────────────────
if (classifyQueue) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(classifyQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());
  console.log('Bull Board disponível em /admin/queues');

  // Inicia o worker de classificação
  iniciarWorker(connection);
}

// ── Rotas ─────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const moodRoutes      = require('./routes/moodRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/auth',      authRoutes);
app.use('/users',     userRoutes);
app.use('/mood',      moodRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.json({ success: true, message: "API EntreMentes OK" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
