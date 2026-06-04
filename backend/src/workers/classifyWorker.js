const { Worker } = require('bullmq');
const prisma     = require('../lib/prisma');

const MINING_URL = process.env.MINING_SERVICE_URL || 'http://localhost:5000';

async function processarJob(job) {
  const { userId, nivelHumor, nivelEstresse, ansiedadeAntesProva,
          duracaoSono, tempoTela, atividadeFisica } = job.data;

  // 1. Chama o mining-service
  const resposta = await fetch(`${MINING_URL}/classify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nivelHumor, nivelEstresse, ansiedadeAntesProva,
      duracaoSono, tempoTela, atividadeFisica,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!resposta.ok) throw new Error(`Mining-service retornou ${resposta.status}`);

  const json = await resposta.json();
  if (!json.success || !json.data) throw new Error('Resposta inválida do mining-service');

  const { clusterId: clusterLabel, nomePerfil, nivelRisco, insights, recomendacoes } = json.data;

  // 2. Busca ou cria a DefinicaoCluster
  let clusterDef = await prisma.definicaoCluster.findUnique({ where: { clusterLabel } });

  if (!clusterDef) {
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

  // 3. Upsert do PerfilComportamental
  await prisma.perfilComportamental.upsert({
    where:  { userId },
    update: {
      clusterId:   clusterDef.id,
      nivelRisco,
      insights:    { insights, recomendacoes },
      generatedAt: new Date(),
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

function iniciarWorker(connection) {
  if (!connection) return null;

  const worker = new Worker('classificacao', processarJob, {
    connection,
    // Se falhar, tenta mais 3 vezes com 5s de espera entre elas
    settings: { backoffStrategy: () => 5000 },
  });

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
