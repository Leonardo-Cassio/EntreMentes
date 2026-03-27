const userService = require('../services/userService');

exports.list = async (req, res) => {
  const users = await userService.list();
  res.json(users);
};