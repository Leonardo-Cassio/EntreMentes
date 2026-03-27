const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const user = await authService.register(nome, email, senha);

    res.json(user);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const data = await authService.login(email, senha);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ erro: err.message });
  }
};