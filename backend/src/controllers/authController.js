const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.register(name, email, password);

    res.status(201).json({ success: true, data: user, message: "Usuário criado com sucesso" });
  } catch (err) {
    const status = err.code === 'P2002' ? 409 : 400;
    res.status(status).json({ success: false, data: null, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await authService.login(email, password);

    res.json({ success: true, data, message: "Login realizado com sucesso" });
  } catch (err) {
    res.status(401).json({ success: false, data: null, message: err.message });
  }
};
