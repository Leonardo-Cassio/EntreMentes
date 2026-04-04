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

exports.remove = async (id) => {
  await prisma.user.delete({ where: { id } });
};
