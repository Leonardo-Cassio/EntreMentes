const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const USUARIOS_TESTE = [
  { nome: 'Ana Souza',       email: 'ana@entrementes.com' },
  { nome: 'Bruno Lima',      email: 'bruno@entrementes.com' },
  { nome: 'Carla Mendes',    email: 'carla@entrementes.com' },
  { nome: 'Diego Alves',     email: 'diego@entrementes.com' },
  { nome: 'Elisa Ferreira',  email: 'elisa@entrementes.com' },
  { nome: 'Felipe Costa',    email: 'felipe@entrementes.com' },
  { nome: 'Gabriela Nunes',  email: 'gabriela@entrementes.com' },
  { nome: 'Henrique Dias',   email: 'henrique@entrementes.com' },
  { nome: 'Isabela Rocha',   email: 'isabela@entrementes.com' },
  { nome: 'João Martins',    email: 'joao@entrementes.com' },
];

const SENHA_PADRAO = 'Teste@123';

async function main() {
  console.log('Iniciando seed do banco de dados...\n');

  // Carrega os registros pré-processados
  const jsonPath = path.resolve(__dirname, '../../data-analysis/dados_tratados.json');
  const registros = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Dataset carregado: ${registros.length} registros\n`);

  // Limpa as tabelas na ordem correta (respeita foreign keys)
  console.log('Limpando dados existentes...');
  await prisma.perfilComportamental.deleteMany();
  await prisma.sequenciaHumor.deleteMany();
  await prisma.registroBemEstar.deleteMany();
  await prisma.humor.deleteMany();
  await prisma.user.deleteMany();
  console.log('Tabelas limpas.\n');

  // Cria os usuários de teste
  console.log('Criando usuários de teste...');
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  const usuarios = await Promise.all(
    USUARIOS_TESTE.map((u) =>
      prisma.user.create({
        data: {
          name: u.nome,
          email: u.email,
          password: senhaHash,
        },
      })
    )
  );

  console.log(`${usuarios.length} usuários criados.\n`);

  // Distribui os 1800 registros entre os usuários (round-robin)
  console.log('Inserindo registros de bem-estar...');

  const LOTE = 100; // insere em lotes para não sobrecarregar o banco
  let inseridos = 0;

  for (let i = 0; i < registros.length; i += LOTE) {
    const lote = registros.slice(i, i + LOTE);

    await prisma.registroBemEstar.createMany({
      data: lote.map((r, idx) => {
        const usuario = usuarios[(i + idx) % usuarios.length];
        return {
          userId:              usuario.id,
          nivelHumor:          r.nivelHumor,
          nota:                r.nota,
          tempoTela:           r.tempoTela,
          duracaoSono:         r.duracaoSono,
          atividadeFisica:     r.atividadeFisica,
          nivelEstresse:       r.nivelEstresse,
          ansiedadeAntesProva: r.ansiedadeAntesProva,
          desempenhoAcademico: r.desempenhoAcademico,
        };
      }),
    });

    inseridos += lote.length;
    process.stdout.write(`\r  Progresso: ${inseridos}/${registros.length}`);
  }

  console.log('\n');

  // Cria SequenciaHumor inicial para cada usuário
  console.log('Criando sequências de humor...');
  await Promise.all(
    usuarios.map((u) =>
      prisma.sequenciaHumor.create({
        data: {
          userId:          u.id,
          sequenciaAtual:  0,
          maiorSequencia:  0,
        },
      })
    )
  );
  console.log(`${usuarios.length} sequências criadas.\n`);

  // Resumo final
  const totalRegistros = await prisma.registroBemEstar.count();
  const totalUsuarios  = await prisma.user.count();

  console.log('=== Seed concluído com sucesso ===');
  console.log(`Usuários no banco:            ${totalUsuarios}`);
  console.log(`Registros de bem-estar:       ${totalRegistros}`);
  console.log(`\nCredenciais de acesso (todos):`);
  console.log(`  Senha: ${SENHA_PADRAO}`);
  USUARIOS_TESTE.forEach((u) => console.log(`  ${u.email}`));
}

main()
  .catch((e) => {
    console.error('\nErro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
