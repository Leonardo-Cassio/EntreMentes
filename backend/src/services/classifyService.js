/**
 * classifyService.js — Fallback de Classificação Síncrono
 *
 * QUANDO É USADO:
 *   Este serviço é o caminho alternativo (fallback) quando o Redis
 *   não está disponível (ex: desenvolvimento local sem Docker).
 *   Em produção no Railway, o Redis está sempre ativo e o BullMQ
 *   é usado — este serviço fica como segurança extra.
 *
 * DIFERENÇA PARA O WORKER:
 *   - classifyWorker.js  → assíncrono, via fila Redis, com retry automático
 *   - classifyService.js → síncrono, chamada HTTP direta, sem retry
 *
 * FLUXO:
 *   1. Envia os dados do registro ao Mining Service (Flask POST /classify)
 *   2. Busca (ou cria) a DefinicaoCluster correspondente ao cluster retornado
 *   3. Faz upsert em PerfilComportamental para o usuário
 *
 * Toda a lógica é envolta em try/catch silencioso — falhas NÃO bloqueiam
 * a resposta ao usuário (classificação é operação secundária).
 */

const prisma = require('../lib/prisma');

// URL do Mining Service (Python/Flask) — injetada pelo Railway como variável de ambiente
const MINING_URL = process.env.MINING_SERVICE_URL || 'http://localhost:5000';

/**
 * classificarEAtualizar — classifica um registro e atualiza o perfil do usuário.
 *
 * @param {string} userId  - ID do usuário no banco
 * @param {object} registro - Dados do registro de bem-estar
 */
async function classificarEAtualizar(userId, registro) {
  try {
    // ── PASSO 1: Classificação via Mining Service ────────────────────────────
    // Chama o endpoint Flask que aplica o modelo K-Means serializado (modelo_kmeans.pkl)
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
      signal: AbortSignal.timeout(8000), // Timeout de 8s — mais curto que o Worker (15s)
    });

    // Se o Mining Service retornar erro HTTP, abandona silenciosamente
    if (!resposta.ok) return;

    const json = await resposta.json();
    if (!json.success || !json.data) return;

    // clusterId → ex: 0, 1, 2, 3 (índice do cluster K-Means)
    // nomePerfil → ex: "Equilibrado", "Rotina Saudável", "Sob Pressão", "Em Alerta"
    const { clusterId: clusterLabel, nomePerfil, nivelRisco, insights, recomendacoes } = json.data;

    // ── PASSO 2: Busca a DefinicaoCluster, criando se ainda não existir ───────
    // Os 4 perfils são criados dinamicamente na primeira ocorrência de cada cluster
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

    // ── PASSO 3: Upsert do PerfilComportamental ──────────────────────────────
    // Cada usuário tem no máximo 1 perfil — atualizado a cada novo registro
    await prisma.perfilComportamental.upsert({
      where:  { userId },
      update: {
        clusterId:   clusterDef.id,
        nivelRisco,                         // ex: "Baixo", "Moderado", "Alto"
        insights:    { insights, recomendacoes }, // JSON com dicas personalizadas
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
    // Falha silenciosa — classificação é operação secundária ao registro do humor.
    // O usuário já recebeu a resposta 201/200; este erro não o afeta.
  }
}

module.exports = { classificarEAtualizar };
