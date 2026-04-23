import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Polyline, Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const OUTER_PADDING = 20;
const CHART_WIDTH = SCREEN_WIDTH - OUTER_PADDING * 2 - CARD_PADDING * 2;

// ── Dados estáticos (mock) ───────────────────────────────────────────────
const USUARIO = { nome: 'João Silva', iniciais: 'JS' };

const EMOJIS = [
  { nivel: 1, emoji: '😢', label: 'Muito Ruim' },
  { nivel: 2, emoji: '😟', label: 'Ruim' },
  { nivel: 3, emoji: '😐', label: 'Neutro' },
  { nivel: 4, emoji: '🙂', label: 'Bom' },
  { nivel: 5, emoji: '😄', label: 'Ótimo' },
];

const DADOS_LINHA = [3,4,3,2,3,4,5,4,3,3,2,3,4,4,5,4,3,2,3,4,5,4,3,4,5,4,3,4,5,4];

const DADOS_BARRA = [
  { dia: 'Seg', valor: 3.2 },
  { dia: 'Ter', valor: 3.8 },
  { dia: 'Qua', valor: 2.9 },
  { dia: 'Qui', valor: 4.1 },
  { dia: 'Sex', valor: 4.5 },
  { dia: 'Sáb', valor: 4.8 },
  { dia: 'Dom', valor: 3.6 },
];

// ── Gráfico de linha (SVG) ───────────────────────────────────────────────
function GraficoLinha({ dados }) {
  const padLeft = 24;
  const padBottom = 20;
  const chartH = 160;
  const plotW = CHART_WIDTH - padLeft;
  const plotH = chartH - padBottom;
  const minVal = 1, maxVal = 5;

  const pontos = dados.map((v, i) => ({
    x: padLeft + (i / (dados.length - 1)) * plotW,
    y: plotH - ((v - minVal) / (maxVal - minVal)) * plotH,
  }));

  const linhaPoints = pontos.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    `M ${pontos[0].x.toFixed(1)},${pontos[0].y.toFixed(1)} ` +
    pontos.slice(1).map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L ${pontos[pontos.length - 1].x.toFixed(1)},${plotH} L ${pontos[0].x.toFixed(1)},${plotH} Z`;

  const xLabels = [5, 10, 15, 20, 25].map(i => ({
    label: String(i + 1),
    x: padLeft + (i / (dados.length - 1)) * plotW,
  }));

  const yLabels = [2, 3, 4, 5];

  return (
    <Svg width={CHART_WIDTH} height={chartH}>
      {/* Grade horizontal */}
      {yLabels.map(v => {
        const y = plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
        return (
          <React.Fragment key={v}>
            <Line x1={padLeft} y1={y} x2={CHART_WIDTH} y2={y} stroke="#F0F0F0" strokeWidth={1} />
            <SvgText x={0} y={y + 4} fontSize={9} fill={colors.textLight}>{v}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Área */}
      <Path d={areaPath} fill="rgba(108, 92, 231, 0.13)" />

      {/* Linha */}
      <Polyline
        points={linhaPoints}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Labels eixo X */}
      {xLabels.map(({ label, x }) => (
        <SvgText key={label} x={x} y={chartH - 4} fontSize={9} fill={colors.textLight} textAnchor="middle">
          {label}
        </SvgText>
      ))}
    </Svg>
  );
}

// ── Gráfico de barras (SVG) ──────────────────────────────────────────────
function GraficoBarra({ dados }) {
  const padLeft = 24;
  const padBottom = 24;
  const chartH = 160;
  const plotW = CHART_WIDTH - padLeft;
  const plotH = chartH - padBottom;
  const maxVal = 5;
  const barSlot = plotW / dados.length;
  const barW = barSlot * 0.55;
  const radius = 5;

  const yLabels = [1, 2, 3, 4, 5];

  return (
    <Svg width={CHART_WIDTH} height={chartH}>
      {/* Grade */}
      {yLabels.map(v => {
        const y = plotH - (v / maxVal) * plotH;
        return (
          <React.Fragment key={v}>
            <Line x1={padLeft} y1={y} x2={CHART_WIDTH} y2={y} stroke="#F0F0F0" strokeWidth={1} />
            <SvgText x={0} y={y + 4} fontSize={9} fill={colors.textLight}>{v}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Barras */}
      {dados.map(({ dia, valor }, i) => {
        const barH = (valor / maxVal) * plotH;
        const x = padLeft + i * barSlot + (barSlot - barW) / 2;
        const y = plotH - barH;
        const barPath =
          `M ${x + radius},${y} ` +
          `L ${x + barW - radius},${y} ` +
          `Q ${x + barW},${y} ${x + barW},${y + radius} ` +
          `L ${x + barW},${plotH} ` +
          `L ${x},${plotH} ` +
          `L ${x},${y + radius} ` +
          `Q ${x},${y} ${x + radius},${y} Z`;

        return (
          <React.Fragment key={dia}>
            <Path d={barPath} fill={colors.primary} />
            <SvgText
              x={x + barW / 2}
              y={chartH - 6}
              fontSize={9}
              fill={colors.textLight}
              textAnchor="middle"
            >
              {dia}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ── Tela principal ───────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [humorSelecionado, setHumorSelecionado] = useState(null);
  const primeroNome = USUARIO.nome.split(' ')[0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header fixo */}
      <View style={s.header}>
        <Text style={s.headerLogo}>EntreMentes</Text>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{USUARIO.iniciais}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Saudação */}
        <Text style={s.saudacao}>Olá, {primeroNome}! 👋</Text>
        <Text style={s.subtitulo}>Como você está se sentindo hoje?</Text>

        {/* Seletor de emojis */}
        <View style={s.emojiRow}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e.nivel}
              style={[s.emojiCard, humorSelecionado === e.nivel && s.emojiCardAtivo]}
              onPress={() => setHumorSelecionado(e.nivel)}
              activeOpacity={0.75}
            >
              <Text style={s.emojiIcon}>{e.emoji}</Text>
              <Text style={[s.emojiLabel, humorSelecionado === e.nivel && s.emojiLabelAtivo]}>
                ({e.nivel})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Métricas 2x2 */}
        <View style={s.metricasGrid}>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Humor Médio</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaValor}>3.8</Text>
              <Text style={s.metricaSeta}>↑</Text>
            </View>
          </View>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Dias Registrados</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaValor}>23</Text>
              <Text style={s.metricaIcone}>📅</Text>
            </View>
          </View>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Sequência Atual</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaValor}>7 dias</Text>
              <Text style={s.metricaIcone}>🔥</Text>
            </View>
          </View>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Seu Perfil</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaIcone}>🟡</Text>
              <Text style={s.metricaValorPerfil}>Moderado</Text>
            </View>
          </View>
        </View>

        {/* Gráfico de linha */}
        <View style={s.chartCard}>
          <Text style={s.chartTitulo}>Evolução do Humor</Text>
          <GraficoLinha dados={DADOS_LINHA} />
        </View>

        {/* Gráfico de barras */}
        <View style={s.chartCard}>
          <Text style={s.chartTitulo}>Humor por Dia da Semana</Text>
          <GraficoBarra dados={DADOS_BARRA} />
        </View>

        {/* Última avaliação */}
        <View style={s.avaliacaoCard}>
          <Text style={s.avaliacaoTitulo}>Última Avaliação de Bem-Estar</Text>
          <Text style={s.avaliacaoData}>Respondido em 15 de março de 2026</Text>
          <TouchableOpacity style={s.avaliacaoBtn} activeOpacity={0.85}>
            <Text style={s.avaliacaoBtnText}>Responder novamente</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: OUTER_PADDING,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerLogo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: OUTER_PADDING,
    gap: 16,
  },
  saudacao: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  subtitulo: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: -8,
  },

  // Emojis
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  emojiCardAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#F3F1FF',
  },
  emojiIcon: {
    fontSize: 22,
  },
  emojiLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  emojiLabelAtivo: {
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
  },

  // Métricas
  metricasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricaCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    width: (SCREEN_WIDTH - OUTER_PADDING * 2 - 12) / 2,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricaLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  metricaValorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricaValor: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  metricaValorPerfil: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  metricaSeta: {
    fontSize: fonts.sizes.lg,
    color: '#00B894',
    fontWeight: fonts.weights.bold,
  },
  metricaIcone: {
    fontSize: fonts.sizes.lg,
  },

  // Charts
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  chartTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },

  // Avaliação
  avaliacaoCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  avaliacaoTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  avaliacaoData: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  avaliacaoBtn: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  avaliacaoBtnText: {
    color: colors.white,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
  },
});
