/**
 * moodController.js
 *
 * Controller responsável pelos endpoints CRUD de registros de bem-estar (/mood).
 *
 * PADRÃO "FIRE AND FORGET" COM BULLMQ:
 *   Ao criar ou editar um registro, o backend:
 *     1. Persiste os dados no PostgreSQL
 *     2. Responde ao usuário imediatamente (não espera a classificação)
 *     3. Publica um job na fila Redis (BullMQ) em background
 *   Isso garante que a UX não seja bloqueada pela latência do Mining Service.
 *
 * FALLBACK SEM REDIS:
 *   Se REDIS_URL não estiver configurada (ambiente local sem Redis),
 *   o classifyService é chamado diretamente de forma síncrona.
 *   Em produção no Railway, o Redis está sempre disponível.
 */

const moodService     = require('../services/moodService');
const classifyService = require('../services/classifyService'); // Fallback síncrono
const { classifyQueue } = require('../queues/classifyQueue');   // Fila BullMQ (ou null)

/**
 * POST /mood
 * Cria um novo registro de bem-estar e dispara classificação assíncrona.
 */
exports.create = async (req, res) => {
  try {
    // Salva o registro no banco (PostgreSQL via Prisma)
    const entry = await moodService.create(req.userId, req.body);

    // Responde ao usuário ANTES de classificar (experiência mais rápida)
    res.status(201).json({ success: true, data: entry, message: "Registro de humor criado com sucesso" });

    // ── Disparo assíncrono da classificação ──────────────────────────────────
    if (classifyQueue) {
      // Caminho principal: publica um job na fila Redis
      // O Worker (classifyWorker.js) processa em background sem bloquear esta thread
      classifyQueue.add('classificar', {
        userId:              req.userId,
        nivelHumor:          req.body.nivelHumor,
        nivelEstresse:       req.body.nivelEstresse,
        ansiedadeAntesProva: req.body.ansiedadeAntesProva,
        duracaoSono:         req.body.duracaoSono,
        tempoTela:           req.body.tempoTela,
        atividadeFisica:     req.body.atividadeFisica,
      }).catch(() => {}); // Ignora erro de enfileiramento — não deve afetar o usuário
    } else {
      // Fallback: sem Redis, chama o Mining Service diretamente (síncrono, sem retry)
      classifyService.classificarEAtualizar(req.userId, req.body);
    }
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

/**
 * GET /mood
 * Lista todos os registros do usuário autenticado.
 * Suporta filtros: ?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=N
 */
exports.list = async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const entries = await moodService.listByUser(req.userId, { from, to, limit });
    res.json({ success: true, data: entries, message: null });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

/**
 * GET /mood/:id
 * Retorna um registro específico pelo ID (somente do usuário autenticado).
 */
exports.getById = async (req, res) => {
  try {
    const entry = await moodService.getById(req.params.id, req.userId);
    res.json({ success: true, data: entry, message: null });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

/**
 * PUT /mood/:id
 * Atualiza um registro existente e re-dispara a classificação com os novos dados.
 * Garante que o perfil comportamental reflita sempre os dados mais recentes.
 */
exports.update = async (req, res) => {
  try {
    // Atualiza o registro no banco e recebe o objeto atualizado
    const entry = await moodService.update(req.params.id, req.userId, req.body);

    // Responde ao usuário antes de re-classificar
    res.json({ success: true, data: entry, message: "Registro atualizado com sucesso" });

    // ── Re-classificação com os dados atualizados ────────────────────────────
    // Usa `entry` (dado do banco) e não `req.body` para garantir valores completos
    if (classifyQueue) {
      // Publica novo job na fila — o Worker re-calculará o perfil com os dados novos
      classifyQueue.add('classificar', {
        userId:              req.userId,
        nivelHumor:          entry.nivelHumor,
        nivelEstresse:       entry.nivelEstresse,
        ansiedadeAntesProva: entry.ansiedadeAntesProva,
        duracaoSono:         entry.duracaoSono,
        tempoTela:           entry.tempoTela,
        atividadeFisica:     entry.atividadeFisica,
      }).catch(() => {});
    } else {
      classifyService.classificarEAtualizar(req.userId, entry);
    }
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

/**
 * DELETE /mood/:id
 * Remove um registro do usuário autenticado.
 * Nota: não re-classifica após exclusão (perfil permanece com o último cálculo).
 */
exports.remove = async (req, res) => {
  try {
    await moodService.remove(req.params.id, req.userId);
    res.json({ success: true, data: null, message: "Registro removido com sucesso" });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
