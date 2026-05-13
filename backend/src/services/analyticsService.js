const prisma = require('../lib/prisma');

// Metadados visuais por nome de perfil (espelha o classifier.py)
const PERFIL_META = {
  'Equilibrado':     { emoji: '🟢', corRisco: '#00B894', bgRisco: '#E8FFF8' },
  'Rotina Saudável': { emoji: '🟡', corRisco: '#FDCB6E', bgRisco: '#FFFBEE' },
  'Sob Pressão':     { emoji: '🟠', corRisco: '#E17055', bgRisco: '#FFF3EE' },
  'Em Alerta':       { emoji: '🔴', corRisco: '#E74C3C', bgRisco: '#FFF0EE' },
};

const JUSTIFICATIVAS = {
  'Equilibrado':
    'Seu padrão indica um bom equilíbrio entre sono, exercício e controle do estresse. ' +
    'Continue mantendo sua rotina — ela é um dos maiores fatores de proteção para a saúde mental.',
  'Rotina Saudável':
    'Seu padrão indica estabilidade geral. O sono está adequado e o estresse controlado, ' +
    'mas adicionar mais atividade física pode elevar ainda mais seu bem-estar.',
  'Sob Pressão':
    'Seu padrão indica sinais de sobrecarga. Sono abaixo do ideal combinado com alto tempo ' +
    'de tela e estresse elevado são pontos que merecem atenção.',
  'Em Alerta':
    'Seu padrão apresenta indicadores de alerta significativos. Estresse acadêmico muito elevado, ' +
    'baixa atividade física e sinais de ansiedade requerem atenção.',
};

exports.getProfile = async (userId) => {
  const perfil = await prisma.perfilComportamental.findUnique({
    where: { userId },
    include: { cluster: true },
  });

  if (!perfil) {
    throw new Error("Perfil ainda não gerado. Registre seu humor para receber uma análise.");
  }

  // Médias dos últimos 30 registros para exibir no modal
  const registros = await prisma.registroBemEstar.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { duracaoSono: true, tempoTela: true, atividadeFisica: true },
  });

  const medias = registros.length > 0
    ? {
        duracaoSono:    +(registros.reduce((s, r) => s + r.duracaoSono,    0) / registros.length).toFixed(1),
        tempoTela:      +(registros.reduce((s, r) => s + r.tempoTela,      0) / registros.length).toFixed(1),
        atividadeFisica:+(registros.reduce((s, r) => s + r.atividadeFisica,0) / registros.length).toFixed(1),
      }
    : { duracaoSono: null, tempoTela: null, atividadeFisica: null };

  const nomePerfil = perfil.cluster.nomePerfil;
  const meta       = PERFIL_META[nomePerfil] ?? { emoji: '🔵', corRisco: '#6C5CE7', bgRisco: '#F3F1FF' };

  // O campo insights armazena { insights: [...], recomendacoes: [...] }
  const insightsJson  = perfil.insights ?? {};
  const insights      = insightsJson.insights      ?? [];
  const recomendacoes = insightsJson.recomendacoes ?? [];

  return {
    nomePerfil,
    clusterId:    perfil.clusterId,
    nivelRisco:   perfil.nivelRisco,
    emoji:        meta.emoji,
    corRisco:     meta.corRisco,
    bgRisco:      meta.bgRisco,
    justificativa: JUSTIFICATIVAS[nomePerfil] ?? '',
    medias,
    insights,
    recomendacoes,
    geradoEm: perfil.generatedAt,
  };
};
