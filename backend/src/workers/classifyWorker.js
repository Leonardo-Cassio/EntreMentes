/**
 * classifyWorker.js
 *
 * Worker BullMQ responsável por consumir jobs da fila 'classificacao'
 * e atualizar o perfil comportamental do usuário no banco de dados.
 *
 * FLUXO DE UM JOB:
 *   [Fila Redis] → Worker.processarJob() → [Mining Service /classify] → [PostgreSQL upsert]
 *
 * GARANTIAS DO BULLMQ:
 *   - Se o job falhar (ex: Mining Service indisponível), é recolocado na fila
 *   - Até 3 retentativas automáticas com 5s de espera entre elas
 *   - Cada job tem ID único — sem processamento duplicado
 *   - Jobs visíveis em tempo real no painel /admin/queues (Bull Board)
 *
 * ISOLAMENTO:
 *   O Worker roda na mesma instância Node.js do backend (Railway),
 *   mas é totalmente assíncrono — não bloqueia requisições HTTP.
 */

const { Worker } = require('bullmq');
const prisma     = require('../lib/prisma');

// URL do Mining Service (Python/Flask) — injetada pelo Railway
const MINING_URL = process.env.MINING_SERVICE_URL || 'http://localhost:5000';

/**
 * processarJob — função executada para cada job da fila.
 *
 * @param {Job} job - Objeto BullMQ contendo os dados do registro de humor
 *
 * Passos:
 *   1. Chama o Mining Service para classificar os dados no modelo K-Means
 *   2. Busca (ou cria) a DefinicaoCluster correspondente ao cluster retornado
 *   3. Faz upsert do PerfilComportamental do usuário no PostgreSQL
 */
async function processarJob(job) {
  const { userId, nivelHumor, nivelEstresse, ansiedadeAntesProva,
          duracaoSono, tempoTela, atividadeFisica } = job.data;

  // ── PASSO 1: Classificação via Mining Service ──────────────────────────────
  // Envia os dados do registro ao Flask API que roda o modelo K-Means treinado
  const resposta = await fetch(`${MINING_URL}/classify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nivelHumor, nivelEstresse, ansiedadeAntesProva,
      duracaoSono, tempoTela, atividadeFisica,
    }),
    // Timeout de 15s — se o Mining Service não responder, o job é marcado como falho
    // e o BullMQ agenda uma nova tentativa automaticamente
    signal: AbortSignal.timeout(15000),
  });

  if (!resposta.ok) throw new Error(`Mining-service retornou ${resposta.status}`);

  const json = await resposta.json();
  if (!json.success || !json.data) throw new Error('Resposta inválida do mining-service');

  // Dados retornados pelo modelo K-Means (ex: clusterId=1, nomePerfil="Sob Pressão")
  const { clusterId: clusterLabel, nomePerfil, nivelRisco, insights, recomendacoes } = json.data;

  // ── PASSO 2: Busca ou cria o cluster no banco ──────────────────────────────
  // DefinicaoCluster representa os 4 perfis: Equilibrado, Rotina Saudável, Sob Pressão, Em Alerta
  let clusterDef = await prisma.definicaoCluster.findUnique({ where: { clusterLabel } });

  if (!clusterDef) {
    // Primeira vez que este cluster aparece — cria o registro de definição
    clusterDef = await prisma.definicaoCluster.create({
      data: {
        clusterLabel,
        nomePerfil,
        descricao:        `Perfil ${nomePerfil} — gerado automaticamente`,
        dadosCentroide:   {},
        caracteristicas:  {},
        quantidadeAlunos: 0,
      },
    });
  }

  // ── PASSO 3: Upsert do perfil comportamental do usuário ────────────────────
  // UPDATE se já existe perfil para este userId, INSERT se for a primeira classificação
  await prisma.perfilComportamental.upsert({
    where:  { userId },
    update: {
      clusterId:   clusterDef.id,
      nivelRisco,
      insights:    { insights, recomendacoes }, // JSON com dicas personalizadas
      generatedAt: new Date(),                  // Timestamp da última atualização
    },
    create: {
      userId,
      clusterId:   clusterDef.id,
      nivelRisco,
      insights:    { insights, recomendacoes },
    },
  });

  console.log(`[Worker] Perfil atualizado — userId: ${userId}, perfil: ${nomePerfil}`);
}

/**
 * iniciarWorker — instancia e inicia o Worker BullMQ.
 * Chamado pelo server.js apenas se Redis estiver disponível.
 *
 * @param {IORedis} connection - Conexão Redis compartilhada com a fila
 */
function iniciarWorker(connection) {
  // Se Redis não está disponível, não inicia o Worker (modo degradado)
  if (!connection) return null;

  const worker = new Worker(
    'classificacao', // Nome da fila — deve ser idêntico ao Queue('classificacao') em classifyQueue.js
    processarJob,
    {
      connection,
      // Estratégia de retry: espera 5s entre cada tentativa (máximo 3 tentativas pelo padrão BullMQ)
      settings: { backoffStrategy: () => 5000 },
    }
  );

  // Eventos para monitoramento (visíveis nos logs do Railway)
  worker.on('completed', job => {
    console.log(`[Worker] Job #${job.id} concluído com sucesso`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job #${job?.id} falhou: ${err.message}`);
  });

  console.log('Worker de classificação iniciado');
  return worker;
}

module.exports = { iniciarWorker };
