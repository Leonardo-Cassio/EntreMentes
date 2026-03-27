const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.register = async (nome, email, senha) => {
  const hash = await bcrypt.hash(senha, 10);

  return prisma.user.create({
    data: { nome, email, senha: hash }
  });
};

exports.login = async (email, senha) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Usuário não encontrado");

  const valid = await bcrypt.compare(senha, user.senha);

  if (!valid) throw new Error("Senha inválida");

  const token = jwt.sign({ id: user.id }, "segredo", {
    expiresIn: "1d"
  });

  return { user, token };
};