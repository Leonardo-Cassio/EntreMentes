/**
 * classifyService.js
 *
 * Alternativa síncrona ao Pub/Sub (em quarentena por falta de acesso ao GCP).
 * Chamado pelo moodController após salvar um RegistroBemEstar.
 *
 * Fluxo:
 *   1. Envia os dados do registro ao mining-service (Flask POST /classify)
 *   2. Busca (ou cria) a DefinicaoCluster correspondente ao cluster retornado
 *   3. Faz upsert em PerfilComportamental para o usuário
 *
 * Toda lógica é envolta em try/catch — falhas não bloqueiam a resposta ao usuário.
 */

const prisma = require('../lib/prisma');

const MINING_URL = process.env.MINING_SERVICE_URL || 'http://localhost:5000';

async function classificarEAtualizar(userId, registro) {
  try {
    // 1. Chama o mining-service
    const resposta = await fetch(`${MINING_URL}/classify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nivelHumor:          registro.nivelHumor,
        nivelEstresse:       registro.nivelEstresse,
        ansiedadeAntesProva: registro.ansiedadeAntesProva,
        duracaoSono:         registro.duracaoSono,
        tempoTela:           registro.tempoTela,
        atividadeFisica:     registro.atividadeFisica,
      }),
      signal: AbortSignal.timeout(8000), // timeout de 8s
    });

    if (!resposta.ok) return;

    const json = await resposta.json();
    if (!json.success || !json.data) return;

    const { clusterId: clusterLabel, nomePerfil, nivelRisco, insights, recomendacoes } = json.data;

    // 2. Busca a DefinicaoCluster, criando se ainda não existir
    let clusterDef = await prisma.definicaoCluster.findUnique({
      where: { clusterLabel },
    });

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

  } catch {
    // Falha silenciosa — classificação é operação secundária ao registro do humor
  }
}

module.exports = { classificarEAtualizar };
