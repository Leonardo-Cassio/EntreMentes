const prisma = require('../lib/prisma');

exports.create = async (userId, data) => {
  return prisma.registroBemEstar.create({
    data: {
      userId,
      nivelHumor: data.nivelHumor,
      nota: data.nota || null,
      tempoTela: data.tempoTela,
      duracaoSono: data.duracaoSono,
      atividadeFisica: data.atividadeFisica,
      nivelEstresse: data.nivelEstresse,
      ansiedadeAntesProva: data.ansiedadeAntesProva,
      desempenhoAcademico: data.desempenhoAcademico
    }
  });
};

exports.listByUser = async (userId, { from, to, limit }) => {
  const where = { userId };

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  return prisma.registroBemEstar.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(limit) : undefined
  });
};

exports.getById = async (id, userId) => {
  const entry = await prisma.registroBemEstar.findUnique({ where: { id } });

  if (!entry || entry.userId !== userId) {
    throw new Error("Registro não encontrado");
  }

  return entry;
};

exports.update = async (id, userId, data) => {
  const entry = await prisma.registroBemEstar.findUnique({ where: { id } });

  if (!entry || entry.userId !== userId) {
    throw new Error("Registro não encontrado");
  }

  const updateData = {};
  if (data.nivelHumor !== undefined) updateData.nivelHumor = data.nivelHumor;
  if (data.nota !== undefined) updateData.nota = data.nota;
  if (data.tempoTela !== undefined) updateData.tempoTela = data.tempoTela;
  if (data.duracaoSono !== undefined) updateData.duracaoSono = data.duracaoSono;
  if (data.atividadeFisica !== undefined) updateData.atividadeFisica = data.atividadeFisica;
  if (data.nivelEstresse !== undefined) updateData.nivelEstresse = data.nivelEstresse;
  if (data.ansiedadeAntesProva !== undefined) updateData.ansiedadeAntesProva = data.ansiedadeAntesProva;
  if (data.desempenhoAcademico !== undefined) updateData.desempenhoAcademico = data.desempenhoAcademico;

  return prisma.registroBemEstar.update({
    where: { id },
    data: updateData
  });
};

exports.remove = async (id, userId) => {
  const entry = await prisma.registroBemEstar.findUnique({ where: { id } });

  if (!entry || entry.userId !== userId) {
    throw new Error("Registro não encontrado");
  }

  await prisma.registroBemEstar.delete({ where: { id } });
};
