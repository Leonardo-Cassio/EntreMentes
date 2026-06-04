const { Queue } = require('bullmq');
const IORedis   = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;

let connection    = null;
let classifyQueue = null;

if (REDIS_URL) {
  connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    // Railway usa rediss:// (SSL) — habilita TLS automaticamente
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  classifyQueue = new Queue('classificacao', { connection });
  console.log('Fila BullMQ conectada ao Redis');
} else {
  console.log('REDIS_URL não definida — fila desativada, usando classifyService direto');
}

module.exports = { classifyQueue, connection };
