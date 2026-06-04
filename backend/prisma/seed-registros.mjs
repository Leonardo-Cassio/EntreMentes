/**
 * seed-registros.mjs
 * Insere ~90 registros de bem-estar para gabrileux@gmail.com no banco Railway.
 *
 * Como rodar (dentro de /backend):
 *   railway run node prisma/seed-registros.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────────────
const rand    = (min, max, step = 0.5) =>
  Math.round((Math.random() * (max - min) + min) / step) * step;

const escolher = (arr) => arr[Math.floor(Math.random() * arr.length)];

function gerarData(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  // hora aleatória entre 06h e 23h para parecer orgânico
  d.setHours(6 + Math.floor(Math.random() * 17));
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

// Tendência: humor sobe levemente ao longo do tempo (início mais baixo)
function humorComTendencia(diasAtras) {
  const base   = 3.5 - (diasAtras / 90) * 1.5; // vai de ~2 (90d atrás) a ~3.5 (hoje)
  const ruido  = (Math.random() - 0.5) * 2;      // ±1
  return Math.min(5, Math.max(1, Math.round(base + ruido)));
}

const NOTAS = [
  'Dia bem produtivo, consegui focar nos estudos.',
  'Senti um pouco de cansaço mas terminei as tarefas.',
  'Dia difícil, mas consegui descansar bem.',
  'Animado com o projeto, equipe está entrosada.',
  'Prova amanhã, um pouco ansioso.',
  'Boa sessão de exercícios hoje.',
  'Fui bem na prova!',
  'Dificuldade para dormir ontem à noite.',
  'Dia tranquilo, me sinto equilibrado.',
  null, null, null, // ~30% sem nota
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const usuario = await prisma.user.findUnique({
    where: { email: 'gabrileux@gmail.com' },
  });

  if (!usuario) {
    console.error('❌  Usuário gabrileux@gmail.com não encontrado no banco.');
    process.exit(1);
  }

  console.log(`✅  Usuário encontrado: ${usuario.name} (${usuario.id})`);

  // Remove registros antigos para não duplicar (opcional — comente se preferir somar)
  const deletados = await prisma.registroBemEstar.deleteMany({
    where: { userId: usuario.id },
  });
  console.log(`🗑️   ${deletados.count} registro(s) antigo(s) removido(s).`);

  // Gera 90 registros (1 por dia dos últimos 90 dias)
  const registros = [];

  for (let dia = 89; dia >= 0; dia--) {
    const humor = humorComTendencia(dia);
    const estresseOpcoes = humor >= 4 ? ['Baixo', 'Baixo', 'Medio']
                         : humor === 3 ? ['Baixo', 'Medio', 'Medio']
                         :               ['Medio', 'Alto',  'Alto'];

    registros.push({
      userId:              usuario.id,
      nivelHumor:          humor,
      nota:                escolher(NOTAS),
      tempoTela:           rand(3, 10),
      duracaoSono:         rand(4, 9),
      atividadeFisica:     rand(0, 6),
      nivelEstresse:       escolher(estresseOpcoes),
      ansiedadeAntesProva: Math.random() < 0.35,
      desempenhoAcademico: escolher(['Melhorou', 'Mesmo', 'Mesmo', 'Piorou']),
      createdAt:           gerarData(dia),
    });
  }

  await prisma.registroBemEstar.createMany({ data: registros });

  console.log(`🎉  ${registros.length} registros inseridos com sucesso!`);
  console.log('    Período: últimos 90 dias | humor com tendência crescente.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
