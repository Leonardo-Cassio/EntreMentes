import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const HUMOR_EMOJIS  = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const HUMOR_LABELS  = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };
const HUMOR_CORES   = ['#E17055', '#FDCB6E', '#B2BEC3', '#74B9FF', '#00B894'];
const ESTRESSE_CORES  = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };
const DESEMPENHO_CORES = { Melhorou: '#00B894', Mesmo: '#74B9FF', Piorou: '#E17055' };

function media(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function calcular(registros) {
  if (!registros.length) return null;

  const sonoMedio      = media(registros.map(r => r.duracaoSono));
  const telaMedio      = media(registros.map(r => r.tempoTela));
  const atividadeMedio = media(registros.map(r => r.atividadeFisica));
  const taxaAnsiedade  = Math.round(
    (registros.filter(r => r.ansiedadeAntesProva).length / registros.length) * 100,
  );

  const distHumor = [1, 2, 3, 4, 5].map(n => ({
    label: `${HUMOR_EMOJIS[n]} ${HUMOR_LABELS[n]}`,
    count: registros.filter(r => r.nivelHumor === n).length,
    cor: HUMOR_CORES[n - 1],
  }));

  const estresseContagem = { Baixo: 0, Medio: 0, Alto: 0 };
  registros.forEach(r => { if (r.nivelEstresse) estresseContagem[r.nivelEstresse]++; });
  const distEstresse = Object.entries(estresseContagem).map(([k, v]) => ({ label: k, count: v, cor: ESTRESSE_CORES[k] }));

  const desempenhoContagem = { Melhorou: 0, Mesmo: 0, Piorou: 0 };
  registros.forEach(r => { if (r.desempenhoAcademico) desempenhoContagem[r.desempenhoAcademico]++; });
  const distDesempenho = Object.entries(desempenhoContagem).map(([k, v]) => ({ label: k, count: v, cor: DESEMPENHO_CORES[k] }));

  return { sonoMedio, telaMedio, atividadeMedio, taxaAnsiedade, distHumor, distEstresse, distDesempenho };
}

function CardResumo({ icone, label, valor, sub, corValor }) {
  return (
    <View style={s.summaryCard}>
      <Text style={s.summaryIcone}>{icone}</Text>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValor, { color: corValor }]}>{valor}</Text>
      {sub && <Text style={s.summarySub}>{sub}</Text>}
    </View>
  );
}

function GraficoBarras({ titulo, dados, total }) {
  const max = Math.max(...dados.map(d => d.count), 1);
  return (
    <View style={s.chartCard}>
      <Text style={s.chartTitulo}>{titulo}</Text>
      {dados.map((d, i) => (
        <View key={i} style={s.barraRow}>
          <Text style={s.barraLabel} numberOfLines={1}>{d.label}</Text>
          <View style={s.barraFundo}>
            <View style={[s.barraPreenchida, { width: `${(d.count / max) * 100}%`, backgroundColor: d.cor }]} />
          </View>
          <Text style={s.barraValor}>{d.count}</Text>
        </View>
      ))}
      {total > 0 && <Text style={s.chartTotal}>{total} registro{total !== 1 ? 's' : ''} no total</Text>}
    </View>
  );
}

export default function EstatisticasScreen() {
  const { token } = useAuth();
  const [registros, setRegistros]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const buscar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setCarregando(true);
    setErro(null);
    try {
      const res = await api.listRegistros(token);
      if (!res.success) throw new Error(res.message || 'Erro ao buscar registros');
      setRegistros(res.data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { buscar(); }, [buscar]);

  const stats = calcular(registros);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {carregando ? (
        <View style={s.estado}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.estadoTexto}>Carregando estatísticas...</Text>
        </View>
      ) : erro ? (
        <View style={s.estado}>
          <Text style={s.estadoIcone}>⚠️</Text>
          <Text style={s.estadoTexto}>{erro}</Text>
          <TouchableOpacity style={s.btnTentar} onPress={() => buscar()} activeOpacity={0.8}>
            <Text style={s.btnTentarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => buscar(true)} tintColor={colors.primary} />}
        >
          <View style={s.header}>
            <Text style={s.titulo}>Estatísticas</Text>
            <Text style={s.subtitulo}>
              {registros.length} registro{registros.length !== 1 ? 's' : ''} analisados
            </Text>
          </View>

          {!stats ? (
            <View style={s.estado}>
              <Text style={s.estadoIcone}>📊</Text>
              <Text style={s.vazioTitulo}>Sem dados ainda</Text>
              <Text style={s.vazioSub}>Faça pelo menos um registro de humor para ver suas estatísticas.</Text>
            </View>
          ) : (
            <>
              {/* Cards de resumo */}
              <View style={s.summaryGrid}>
                <CardResumo icone="🌙" label="Sono médio"    valor={`${stats.sonoMedio.toFixed(1)}h`}      sub="ideal: 7–9h"     corValor="#6C5CE7" />
                <CardResumo icone="🖥️" label="Tela média"    valor={`${stats.telaMedio.toFixed(1)}h/dia`}  sub="ideal: < 6h"     corValor="#0984E3" />
                <CardResumo icone="🏃" label="Atividade"     valor={`${stats.atividadeMedio.toFixed(1)}h`} sub="por registro"    corValor="#00B894" />
                <CardResumo icone="😰" label="Ansiedade"     valor={`${stats.taxaAnsiedade}%`}             sub="antes de provas" corValor="#E17055" />
              </View>

              <GraficoBarras
                titulo="Distribuição do Humor"
                dados={stats.distHumor}
                total={registros.length}
              />

              <GraficoBarras
                titulo="Nível de Estresse"
                dados={stats.distEstresse}
                total={registros.length}
              />

              <GraficoBarras
                titulo="Desempenho Acadêmico"
                dados={stats.distDesempenho}
                total={registros.length}
              />

              {/* Médias detalhadas */}
              <View style={s.chartCard}>
                <Text style={s.chartTitulo}>Médias gerais</Text>
                {[
                  { label: 'Sono',             valor: stats.sonoMedio,      ref: '7–9h',   cor: '#6C5CE7', max: 12 },
                  { label: 'Tempo de tela',    valor: stats.telaMedio,      ref: '< 6h',   cor: '#E17055', max: 16 },
                  { label: 'Atividade física', valor: stats.atividadeMedio, ref: '> 4h',   cor: '#00B894', max: 8  },
                ].map((item, i) => (
                  <View key={i} style={s.mediaRow}>
                    <View style={s.mediaInfo}>
                      <Text style={s.mediaLabel}>{item.label}</Text>
                      <Text style={s.mediaRef}>ref: {item.ref}</Text>
                    </View>
                    <View style={s.barraFundo}>
                      <View style={[s.barraPreenchida, {
                        width: `${Math.min((item.valor / item.max) * 100, 100)}%`,
                        backgroundColor: item.cor,
                      }]} />
                    </View>
                    <Text style={[s.barraValor, { color: item.cor }]}>{item.valor.toFixed(1)}h</Text>
                  </View>
                ))}
              </View>

              <Text style={s.disclaimer}>
                Este conteúdo não substitui acompanhamento profissional de saúde mental.
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 16 },
  titulo: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text },
  subtitulo: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginTop: 2 },

  estado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  estadoIcone: { fontSize: 48 },
  estadoTexto: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'center' },
  vazioTitulo: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text },
  vazioSub: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'center' },

  btnTentar: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 24, marginTop: 4,
  },
  btnTentarTexto: { color: colors.white, fontWeight: fonts.weights.bold, fontSize: fonts.sizes.sm },

  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    width: '47%',
    alignItems: 'center',
    gap: 3,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  summaryIcone: { fontSize: 24, marginBottom: 2 },
  summaryLabel: { fontSize: fonts.sizes.xs, color: colors.textSecondary, fontWeight: fonts.weights.medium, textAlign: 'center' },
  summaryValor: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold },
  summarySub:   { fontSize: 11, color: colors.textLight, textAlign: 'center' },

  chartCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    marginBottom: 16, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  chartTitulo: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: 4 },
  chartTotal: { fontSize: fonts.sizes.xs, color: colors.textLight, textAlign: 'right', marginTop: 2 },

  barraRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barraLabel: { fontSize: 12, color: colors.textSecondary, width: 110 },
  barraFundo: { flex: 1, height: 12, backgroundColor: colors.surface, borderRadius: 6, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 6, minWidth: 4 },
  barraValor: { fontSize: 12, fontWeight: fonts.weights.bold, color: colors.text, width: 24, textAlign: 'right' },

  mediaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mediaInfo: { width: 110 },
  mediaLabel: { fontSize: 12, color: colors.text, fontWeight: fonts.weights.medium },
  mediaRef: { fontSize: 10, color: colors.textLight },

  disclaimer: {
    fontSize: fonts.sizes.xs, color: colors.textLight,
    textAlign: 'center', marginTop: 4,
  },
});
