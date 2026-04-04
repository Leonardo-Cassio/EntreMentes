const moodService = require('../services/moodService');

exports.create = async (req, res) => {
  try {
    const entry = await moodService.create(req.userId, req.body);
    res.status(201).json({ success: true, data: entry, message: "Registro de humor criado com sucesso" });
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
