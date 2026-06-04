const moodService     = require('../services/moodService');
const classifyService = require('../services/classifyService');
const { classifyQueue } = require('../queues/classifyQueue');

exports.create = async (req, res) => {
  try {
    const entry = await moodService.create(req.userId, req.body);
    res.status(201).json({ success: true, data: entry, message: "Registro de humor criado com sucesso" });

    // Se Redis disponível: enfileira o job (BullMQ)
    // Fallback: chama o classifyService diretamente (sem Redis)
    if (classifyQueue) {
      classifyQueue.add('classificar', {
        userId:              req.userId,
        nivelHumor:          req.body.nivelHumor,
        nivelEstresse:       req.body.nivelEstresse,
        ansiedadeAntesProva: req.body.ansiedadeAntesProva,
        duracaoSono:         req.body.duracaoSono,
        tempoTela:           req.body.tempoTela,
        atividadeFisica:     req.body.atividadeFisica,
      }).catch(() => {});
    } else {
      classifyService.classificarEAtualizar(req.userId, req.body);
    }
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const entries = await moodService.listByUser(req.userId, { from, to, limit });
    res.json({ success: true, data: entries, message: null });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const entry = await moodService.getById(req.params.id, req.userId);
    res.json({ success: true, data: entry, message: null });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const entry = await moodService.update(req.params.id, req.userId, req.body);
    res.json({ success: true, data: entry, message: "Registro atualizado com sucesso" });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await moodService.remove(req.params.id, req.userId);
    res.json({ success: true, data: null, message: "Registro removido com sucesso" });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
