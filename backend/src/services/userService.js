const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

exports.getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuário não encontrado");

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

exports.update = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

exports.changePassword = async (id, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuário não encontrado");
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Senha atual incorreta");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hash } });
};

exports.remove = async (id) => {
  await prisma.user.delete({ where: { id } });
};
