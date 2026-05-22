import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Polyline, Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CARD_PADDING = 16;
const OUTER_PADDING = 20;

// ── Helpers para transformar dados da API ────────────────────────────────

function calcularHumorMedio(registros) {
  if (!registros.length) return '—';
  const media = registros.reduce((s, r) => s + r.nivelHumor, 0) / registros.length;
  return media.toFixed(1);
}

function calcularDiasRegistrados(registros) {
  return new Set(registros.map(r => new Date(r.createdAt).toDateString())).size;
}

function calcularSequencia(registros) {
  if (!registros.length) return 0;
  const dias = [...new Set(
    registros.map(r => {
      const d = new Date(r.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }),
  )].sort((a, b) => b - a);

  const hoje = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); })();
  const ontem = hoje - 86400000;
  if (dias[0] !== hoje && dias[0] !== ontem) return 0;

  let seq = 1;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] === dias[i - 1] - 86400000) seq++;
    else break;
  }
  return seq;
}

// Retorna array de números para o GraficoLinha
function transformarDadosLinha(registros) {
  const sorted = [...registros].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return sorted.slice(-30).map(r => r.nivelHumor);
}

// Retorna { dia, valor }[] para o GraficoBarra
function transformarDadosBarra(registros) {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const soma = Array(7).fill(0);
  const count = Array(7).fill(0);
  registros.forEach(r => {
    const dow = new Date(r.createdAt).getDay();
    soma[dow] += r.nivelHumor;
    count[dow]++;
  });
  return [1, 2, 3, 4, 5, 6, 0].map(dow => ({
    dia: nomes[dow],
    valor: count[dow] > 0 ? parseFloat((soma[dow] / count[dow]).toFixed(1)) : 0,
  }));
}

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
function GraficoLinha({ dados, width }) {
  const padLeft = 24;
  const padBottom = 20;
  const chartH = 160;
  const plotW = width - padLeft;
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
    <Svg width={width} height={chartH}>
      {/* Grade horizontal */}
      {yLabels.map(v => {
        const y = plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
        return (
          <React.Fragment key={v}>
            <Line x1={padLeft} y1={y} x2={width} y2={y} stroke="#F0F0F0" strokeWidth={1} />
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
function GraficoBarra({ dados, width }) {
  const padLeft = 24;
  const padBottom = 24;
  const chartH = 160;
  const plotW = width - padLeft;
  const plotH = chartH - padBottom;
  const maxVal = 5;
  const barSlot = plotW / dados.length;
  const barW = barSlot * 0.55;
  const radius = 4;

  const yLabels = [1, 2, 3, 4, 5];

  return (
    <Svg width={width} height={chartH}>
      {/* Grade */}
      {yLabels.map(v => {
        const y = plotH - (v / maxVal) * plotH;
        return (
          <React.Fragment key={v}>
            <Line x1={padLeft} y1={y} x2={width} y2={y} stroke="#F0F0F0" strokeWidth={1} />
            <SvgText x={0} y={y + 4} fontSize={9} fill={colors.textLight}>{v}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Barras */}
      {dados.map(({ dia, valor }, i) => {
        const rawH = (valor / maxVal) * plotH;
        const barH = rawH < 3 ? 3 : rawH;
        const x = padLeft + i * barSlot + (barSlot - barW) / 2;
        const y = plotH - barH;
        const r = Math.min(radius, barH / 2);
        const barPath =
          `M ${x + r},${y} ` +
          `L ${x + barW - r},${y} ` +
          `Q ${x + barW},${y} ${x + barW},${y + r} ` +
          `L ${x + barW},${plotH} ` +
          `L ${x},${plotH} ` +
          `L ${x},${y + r} ` +
          `Q ${x},${y} ${x + r},${y} Z`;

        return (
          <React.Fragment key={dia}>
            <Path d={barPath} fill={valor > 0 ? colors.primary : colors.border} />
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
export default function DashboardScreen({ navigation }) {
  const { user, token } = useAuth();
  const [humorSelecionado, setHumorSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel]         = useState(false);
  const [registros, setRegistros]               = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [chartWidth, setChartWidth]             = useState(0);
  const [modalPerfil, setModalPerfil]           = useState(false);
  const [perfil, setPerfil]                     = useState(null);
  const [loadingPerfil, setLoadingPerfil]       = useState(false);

  useEffect(() => {
    if (!token) { setLoadingRegistros(false); return; }
    api.listRegistros(token)
      .then(res => { if (res.success) setRegistros(res.data ?? []); })
      .catch(() => {})
      .finally(() => setLoadingRegistros(false));
  }, [token]);

  // Dados derivados dos registros reais
  const primeroNome      = user?.name?.split(' ')[0] ?? 'Usuário';
  const iniciais         = user?.name
    ? user.name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : 'US';
  const humorMedio       = calcularHumorMedio(registros);
  const diasRegistrados  = calcularDiasRegistrados(registros);
  const sequencia        = calcularSequencia(registros);
  const dadosLinha       = transformarDadosLinha(registros);
  const dadosBarra       = transformarDadosBarra(registros);

  const humorAtual = EMOJIS.find(e => e.nivel === humorSelecionado);

  const abrirPerfil = async () => {
    setModalPerfil(true);
    if (perfil) return;
    setLoadingPerfil(true);
    try {
      const res = await api.getProfile(token);
      if (res.success) setPerfil(res.data);
      else setPerfil(null);
    } catch {
      setPerfil(null);
    } finally {
      setLoadingPerfil(false);
    }
  };

  const handleSelecionarHumor = (nivel) => {
    setHumorSelecionado(nivel);
    setModalVisivel(true);
  };

  const handleConfirmar = () => {
    setModalVisivel(false);
    navigation.navigate('Diário', { nivelHumorInicial: humorSelecionado });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header fixo */}
      <View style={s.header}>
        <Text style={s.headerLogo}>EntreMentes</Text>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{iniciais}</Text>
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
              onPress={() => handleSelecionarHumor(e.nivel)}
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
              <Text style={s.metricaValor}>{loadingRegistros ? '…' : humorMedio}</Text>
              {!loadingRegistros && registros.length > 0 && <Text style={s.metricaSeta}>↑</Text>}
            </View>
          </View>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Dias Registrados</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaValor}>{loadingRegistros ? '…' : diasRegistrados}</Text>
              <Text style={s.metricaIcone}>📅</Text>
            </View>
          </View>
          <View style={s.metricaCard}>
            <Text style={s.metricaLabel}>Sequência Atual</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaValor}>{loadingRegistros ? '…' : `${sequencia} dia${sequencia !== 1 ? 's' : ''}`}</Text>
              <Text style={s.metricaIcone}>🔥</Text>
            </View>
          </View>
          <TouchableOpacity style={s.metricaCard} onPress={abrirPerfil} activeOpacity={0.75}>
            <Text style={s.metricaLabel}>Seu Perfil</Text>
            <View style={s.metricaValorRow}>
              <Text style={s.metricaIcone}>🧠</Text>
              <Text style={s.metricaValorPerfil}>Ver perfil</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Gráfico de linha */}
        <View
          style={s.chartCard}
          onLayout={e => setChartWidth(e.nativeEvent.layout.width - CARD_PADDING * 2)}
        >
          <Text style={s.chartTitulo}>Evolução do Humor</Text>
          {loadingRegistros ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 60 }} />
          ) : dadosLinha.length >= 2 && chartWidth > 0 ? (
            <GraficoLinha dados={dadosLinha} width={chartWidth} />
          ) : !loadingRegistros ? (
            <Text style={s.chartVazio}>Adicione registros para ver a evolução</Text>
          ) : null}
        </View>

        {/* Gráfico de barras */}
        <View style={s.chartCard}>
          <Text style={s.chartTitulo}>Humor por Dia da Semana</Text>
          {loadingRegistros ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 60 }} />
          ) : chartWidth > 0 ? (
            <GraficoBarra dados={dadosBarra} width={chartWidth} />
          ) : null}
        </View>

        {/* Última avaliação */}
        <View style={s.avaliacaoCard}>
          <Text style={s.avaliacaoTitulo}>Última Avaliação de Bem-Estar</Text>
          <Text style={s.avaliacaoData}>
            {loadingRegistros
              ? 'Carregando…'
              : registros.length > 0
                ? `Respondido em ${new Date(registros[0].createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Nenhum registro ainda'}
          </Text>
          <TouchableOpacity
            style={s.avaliacaoBtn}
            onPress={() => navigation.navigate('Diário')}
            activeOpacity={0.85}
          >
            <Text style={s.avaliacaoBtnText}>
              {registros.length > 0 ? 'Responder novamente' : 'Fazer primeiro registro'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal confirmação humor — View absoluta para respeitar o container 430px no web */}
      {modalVisivel && (
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalVisivel(false)} activeOpacity={1} />
          <View style={s.modalCard}>
            <Text style={s.modalEmoji}>{humorAtual?.emoji}</Text>
            <Text style={s.modalTitulo}>Registrar como "{humorAtual?.label}"?</Text>
            <Text style={s.modalSub}>
              Quer completar o registro de humor de hoje com mais detalhes?
            </Text>
            <TouchableOpacity style={s.modalBtnPrimario} onPress={handleConfirmar} activeOpacity={0.85}>
              <Text style={s.modalBtnPrimarioTexto}>Sim, completar registro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSecundario} onPress={() => setModalVisivel(false)} activeOpacity={0.7}>
              <Text style={s.modalBtnSecundarioTexto}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal perfil comportamental — View absoluta para respeitar o container 430px no web */}
      {modalPerfil && (
        <View style={s.perfilModalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalPerfil(false)} activeOpacity={1} />
          <View style={s.perfilModalCard}>
            <View style={s.perfilModalAlca} />
            {loadingPerfil ? (
              <>
                <ActivityIndicator size="large" color={colors.primary} style={{ paddingVertical: 32 }} />
                <Text style={[s.modalSub, { textAlign: 'center' }]}>Analisando seu perfil...</Text>
              </>
            ) : !perfil ? (
              <>
                <Text style={{ fontSize: 48, textAlign: 'center' }}>📊</Text>
                <Text style={s.modalTitulo}>Perfil ainda não gerado</Text>
                <Text style={s.modalSub}>
                  Faça pelo menos um registro de humor para gerar sua análise comportamental.
                </Text>
                <TouchableOpacity style={s.modalBtnPrimario} onPress={() => { setModalPerfil(false); navigation.navigate('Diário'); }} activeOpacity={0.85}>
                  <Text style={s.modalBtnPrimarioTexto}>Fazer primeiro registro</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[s.perfilHeader, { backgroundColor: perfil.bgRisco ?? '#EDE7F6' }]}>
                  <Text style={s.perfilEmoji}>{perfil.emoji ?? '🧠'}</Text>
                  <Text style={s.perfilNome}>{perfil.nomePerfil}</Text>
                  <View style={[s.perfilBadge, { backgroundColor: perfil.corRisco ?? colors.primary }]}>
                    <Text style={s.perfilBadgeTexto}>Risco {perfil.nivelRisco}</Text>
                  </View>
                </View>

                <Text style={s.perfilJustificativa}>{perfil.justificativa}</Text>

                {/* Médias */}
                {perfil.medias && (
                  <View style={s.perfilPillsRow}>
                    {[
                      { label: 'Sono', valor: `${perfil.medias.duracaoSono?.toFixed(1)}h`, ref: '7–9h' },
                      { label: 'Tela',  valor: `${perfil.medias.tempoTela?.toFixed(1)}h`,  ref: '< 6h' },
                      { label: 'Exerc.', valor: `${perfil.medias.atividadeFisica?.toFixed(1)}h`, ref: '> 4h' },
                    ].map((p, i) => (
                      <View key={i} style={s.perfilPill}>
                        <Text style={s.perfilPillLabel}>{p.label}</Text>
                        <Text style={s.perfilPillValor}>{p.valor}</Text>
                        <Text style={s.perfilPillRef}>{p.ref}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Insights */}
                {perfil.insights?.length > 0 && (
                  <View style={s.perfilSecao}>
                    <Text style={s.perfilSecaoTitulo}>⚠️ Pontos de atenção</Text>
                    {perfil.insights.map((ins, i) => (
                      <Text key={i} style={s.perfilItem}>• {ins}</Text>
                    ))}
                  </View>
                )}

                {/* Recomendações */}
                {perfil.recomendacoes?.length > 0 && (
                  <View style={[s.perfilSecao, { backgroundColor: '#E8F4FD' }]}>
                    <Text style={s.perfilSecaoTitulo}>💡 Recomendações</Text>
                    {perfil.recomendacoes.map((rec, i) => (
                      <Text key={i} style={s.perfilItem}>• {rec}</Text>
                    ))}
                  </View>
                )}

                <Text style={s.perfilDisclaimer}>
                  Este resultado não substitui acompanhamento profissional de saúde mental.
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity style={[s.modalBtnSecundario, { marginTop: 8 }]} onPress={() => setModalPerfil(false)} activeOpacity={0.7}>
              <Text style={s.modalBtnSecundarioTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    flex: 1,
    minWidth: '45%',
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
  chartVazio: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 48,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  modalTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalBtnPrimario: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnPrimarioTexto: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
    fontSize: fonts.sizes.sm,
  },
  modalBtnSecundario: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnSecundarioTexto: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },

  perfilModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  perfilModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  perfilModalAlca: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Modal perfil comportamental
  perfilHeader: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  perfilEmoji: { fontSize: 44 },
  perfilNome: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  perfilBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  perfilBadgeTexto: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
  },
  perfilJustificativa: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  perfilPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  perfilPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  perfilPillLabel: { fontSize: 11, color: colors.textSecondary },
  perfilPillValor: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text },
  perfilPillRef:   { fontSize: 10, color: colors.textLight },
  perfilSecao: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  perfilSecaoTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  perfilItem: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  perfilDisclaimer: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
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
