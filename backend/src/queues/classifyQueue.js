/**
 * classifyQueue.js
 *
 * Configuração da fila de mensagens assíncrona usando BullMQ + Redis.
 *
 * ARQUITETURA DE MENSAGERIA:
 *   Quando o usuário salva um registro de humor, o backend NÃO espera
 *   a classificação terminar para responder. Em vez disso:
 *     1. Salva o registro no PostgreSQL
 *     2. Publica um "job" nesta fila (Redis)  ← este arquivo
 *     3. Responde imediatamente ao usuário (200 OK)
 *     4. O Worker processa o job em background (classifyWorker.js)
 *
 * POR QUE REDIS?
 *   O Redis armazena os jobs em memória com persistência opcional.
 *   O BullMQ usa estruturas de dados nativas do Redis (sorted sets, lists)
 *   para garantir ordenação, deduplicação e retry automático.
 *
 * HOSPEDAGEM:
 *   Redis gerenciado pelo Railway (rediss:// com SSL).
 *   Se REDIS_URL não estiver definida (ex: desenvolvimento local),
 *   o sistema opera sem fila — o moodController usa o classifyService
 *   diretamente como fallback síncrono.
 */

const { Queue } = require('bullmq');
const IORedis   = require('ioredis');

// URL de conexão injetada pelo Railway como variável de ambiente
const REDIS_URL = process.env.REDIS_URL;

let connection    = null; // Conexão compartilhada com o Worker
let classifyQueue = null; // Instância da fila BullMQ

if (REDIS_URL) {
  // Cria a conexão com o Redis
  // maxRetriesPerRequest: null → necessário para BullMQ (não limita retentativas de conexão)
  connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    // Railway fornece rediss:// (com SSL/TLS) — habilita TLS automaticamente se necessário
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  // Cria a fila chamada 'classificacao' — o Worker escuta exatamente este nome
  classifyQueue = new Queue('classificacao', { connection });

  console.log('Fila BullMQ conectada ao Redis');
} else {
  // Modo degradado: sem Redis, a classificação vira chamada síncrona ao Mining Service
  console.log('REDIS_URL não definida — fila desativada, usando classifyService direto');
}

// Exporta a fila e a conexão (o Worker reutiliza a mesma conexão)
module.exports = { classifyQueue, connection };
