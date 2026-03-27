const humorService = require('../services/humorService');

exports.create = async (req, res) => {
  const { tipo, descricao } = req.body;

  const humor = await humorService.create(tipo, descricao, req.userId);

  res.json(humor);
};

exports.list = async (req, res) => {
  const humores = await humorService.list(req.userId);

  res.json(humores);
};