const userService = require('../services/userService');

exports.getMe = async (req, res) => {
  try {
    const user = await userService.getById(req.userId);
    res.json({ success: true, data: user, message: null });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    const user = await userService.update(req.userId, data);
    res.json({ success: true, data: user, message: "Perfil atualizado com sucesso" });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await userService.remove(req.userId);
    res.json({ success: true, data: null, message: "Conta removida com sucesso" });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
