/**
 * seedClusters.js
 * Popula a tabela DefinicaoCluster com os 4 perfis do K-Means (K=4).
 *
 * Execute separadamente quando necessário:
 *   node prisma/seedClusters.js
 *
 * Obs: o classifyService.js cria as entradas automaticamente na primeira
 * classificação, mas este script garante que elas existam antes disso.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLUSTERS = [
  {
    clusterLabel: 0,
    nomePerfil:   'Sob Pressão',
    descricao:    'Sono abaixo da média, tempo de tela acima do ideal e estresse acadêmico elevado.',
    dadosCentroide:  { SleepHours: 0.35, ScreenTime: 0.49, ExerciseFreq: 0.60, AcademicStress: 0.54, PHQ9: 0.45, GAD7: 0.43 },
    caracteristicas: { nivelRisco: 'Moderado', cor: '#E17055' },
    quantidadeAlunos: 391,
  },
  {
    clusterLabel: 1,
    nomePerfil:   'Equilibrado',
    descricao:    'Bom sono, alta atividade física e estresse acadêmico sob controle.',
    dadosCentroide:  { SleepHours: 0.71, ScreenTime: 0.40, ExerciseFreq: 0.70, AcademicStress: 0.47, PHQ9: 0.30, GAD7: 0.29 },
    caracteristicas: { nivelRisco: 'Baixo', cor: '#00B894' },
    quantidadeAlunos: 448,
  },
  {
    clusterLabel: 2,
    nomePerfil:   'Rotina Saudável',
    descricao:    'Sono médio e estresse controlado, com oportunidade de melhorar a atividade física.',
    dadosCentroide:  { SleepHours: 0.52, ScreenTime: 0.38, ExerciseFreq: 0.22, AcademicStress: 0.33, PHQ9: 0.25, GAD7: 0.24 },
    caracteristicas: { nivelRisco: 'Moderado', cor: '#FDCB6E' },
    quantidadeAlunos: 447,
  },
  {
    clusterLabel: 3,
    nomePerfil:   'Em Alerta',
    descricao:    'Estresse muito elevado, atividade física mínima e indicadores significativos de ansiedade.',
    dadosCentroide:  { SleepHours: 0.63, ScreenTime: 0.45, ExerciseFreq: 0.23, AcademicStress: 0.66, PHQ9: 0.58, GAD7: 0.55 },
    caracteristicas: { nivelRisco: 'Alto', cor: '#E74C3C' },
    quantidadeAlunos: 514,
  },
];

async function main() {
  console.log('Populando DefinicaoCluster...\n');

  for (const cluster of CLUSTERS) {
    await prisma.definicaoCluster.upsert({
      where:  { clusterLabel: cluster.clusterLabel },
      update: cluster,
      create: cluster,
    });
    console.log(`  [OK] Cluster ${cluster.clusterLabel} — ${cluster.nomePerfil}`);
  }

  console.log('\nDefinicaoCluster populada com sucesso.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
