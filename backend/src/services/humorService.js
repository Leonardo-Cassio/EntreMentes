const prisma = require('../lib/prisma');

exports.create = (tipo, descricao, userId) => {
  return prisma.humor.create({
    data: { tipo, descricao, userId }
  });
};

exports.list = (userId) => {
  return prisma.humor.findMany({
    where: { userId }
  });
};
