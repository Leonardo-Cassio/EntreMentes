/**
 * seed-fila.mjs
 * Pega os RegistroBemEstar existentes de gabrileux@gmail.com e os enfileira
 * no BullMQ, para que o worker de classificação processe cada um.
 *
 * NÃO cria novos registros — apenas alimenta a fila com dados já no banco.
 *
 * Como rodar (dentro de /backend, com DATABASE_URL e REDIS_URL definidas):
 *   $env:DATABASE_URL = "postgresql://..."
 *   $env:REDIS_URL    = "redis://..."
 *   node prisma/seed-fila.mjs
 */

// Carrega .env se existir (opcional — pode usar variáveis de ambiente direto)
try { require('dotenv').config(); } catch {}

const { PrismaClient } = require('@prisma/client');
const { Queue }        = require('bullmq');
const IORedis          = require('ioredis');

const prisma = new PrismaClient();

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error('❌  REDIS_URL não definida.');
  process.exit(1);
}

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
});

const fila = new Queue('classificacao', { connection });

async function main() {
  // 1. Busca o usuário
  const usuario = await prisma.user.findUnique({
    where: { email: 'gabrileux@gmail.com' },
  });

  if (!usuario) {
    console.error('❌  Usuário não encontrado.');
    process.exit(1);
  }

  console.log(`✅  Usuário: ${usuario.name} (${usuario.id})`);

  // 2. Busca todos os registros existentes
  const registros = await prisma.registroBemEstar.findMany({
    where:   { userId: usuario.id },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📋  ${registros.length} registros encontrados — enfileirando...`);

  // 3. Enfileira cada registro como job (com delay escalonado para não sobrecarregar)
  for (let i = 0; i < registros.length; i++) {
    const r = registros[i];
    await fila.add('classificar', {
      userId:              usuario.id,
      nivelHumor:          r.nivelHumor,
      nivelEstresse:       r.nivelEstresse,
      ansiedadeAntesProva: r.ansiedadeAntesProva,
      duracaoSono:         r.duracaoSono,
      tempoTela:           r.tempoTela,
      atividadeFisica:     r.atividadeFisica,
    }, {
      delay:    i * 120,
      attempts: 3,
      backoff:  { type: 'fixed', delay: 5000 },
    });
  }

  console.log(`🚀  ${registros.length} jobs adicionados à fila "classificacao".`);
  console.log('    Acesse /admin/queues para acompanhar o processamento.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => {
    await fila.close();
    await connection.quit();
    await prisma.$disconnect();
  });
