import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function HumorScreen({ navigation }) {
  const { token } = useAuth();
  const [perfil, setPerfil]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [semPerfil, setSemPerfil] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const buscarPerfil = useCallback(async (isRefresh = false) => {
    if (!token) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.getProfile(token);
      if (res.success) {
        setPerfil(res.data);
        setSemPerfil(false);
      } else {
        setSemPerfil(true);
      }
    } catch {
      setSemPerfil(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { buscarPerfil(); }, [buscarPerfil]);

  // ── Estado: carregando ───────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.centrado}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Carregando perfil…</Text>
      </SafeAreaView>
    );
  }

  // ── Estado: sem perfil ainda ─────────────────────────────────────────────
  if (semPerfil || !perfil) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={s.semPerfilContainer}>
          <Text style={s.semPerfilEmoji}>🧠</Text>
          <Text style={s.semPerfilTitulo}>Perfil não disponível</Text>
          <Text style={s.semPerfilSub}>
            Complete registros diários para receber sua classificação comportamental com base em IA.
          </Text>
          <TouchableOpacity
            style={s.semPerfilBtn}
            onPress={() => navigation.navigate('Diário')}
            activeOpacity={0.85}
          >
            <Text style={s.semPerfilBtnText}>Fazer primeiro registro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Estado: perfil disponível ────────────────────────────────────────────
  const medias = [
    { label: 'Sono médio',       valor: `${perfil.medias.duracaoSono.toFixed(1)}h`,         ref: 'ideal: 7–9h' },
    { label: 'Tempo de tela',    valor: `${perfil.medias.tempoTela.toFixed(1)}h/dia`,       ref: 'ideal: < 6h' },
    { label: 'Atividade física', valor: `${perfil.medias.atividadeFisica.toFixed(1)}h/sem`, ref: 'ideal: > 4h' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => buscarPerfil(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header com gradiente */}
        <LinearGradient colors={['#7B2FBE', '#4A90D9']} style={s.header}>
          <Text style={s.headerEmoji}>{perfil.emoji}</Text>
          <Text style={s.headerTitulo}>{perfil.nomePerfil}</Text>
          <View style={[s.badge, { backgroundColor: perfil.bgRisco }]}>
            <Text style={[s.badgeText, { color: perfil.corRisco }]}>
              Risco {perfil.nivelRisco}
            </Text>
          </View>
          <Text style={s.headerData}>
            Atualizado em {new Date(perfil.geradoEm).toLocaleDateString('pt-BR')}
          </Text>
        </LinearGradient>

        {/* Corpo */}
        <View style={s.corpo}>

          {/* Justificativa */}
          <Text style={s.justificativa}>{perfil.justificativa}</Text>

          {/* Pills de médias */}
          <View style={s.mediasRow}>
            {medias.map(m => (
              <View key={m.label} style={s.mediaPill}>
                <Text style={s.mediaValor}>{m.valor}</Text>
                <Text style={s.mediaLabel}>{m.label}</Text>
                <Text style={s.mediaRef}>{m.ref}</Text>
              </View>
            ))}
          </View>

          <View style={s.divisor} />

          {/* Insights */}
          <Text style={s.secaoTitulo}>⚠️ Pontos de atenção</Text>
          {perfil.insights.map((item, i) => (
            <View key={i} style={[s.listaItem, s.listaInsight]}>
              <View style={[s.listaDot, { backgroundColor: '#E17055' }]} />
              <Text style={[s.listaTexto, { color: '#7A4A00' }]}>{item}</Text>
            </View>
          ))}

          <View style={s.espacador} />

          {/* Recomendações */}
          <Text style={s.secaoTitulo}>💡 Recomendações</Text>
          {perfil.recomendacoes.map((item, i) => (
            <View key={i} style={[s.listaItem, s.listaRec]}>
              <View style={[s.listaDot, { backgroundColor: colors.primary }]} />
              <Text style={[s.listaTexto, { color: '#1A4A7A' }]}>{item}</Text>
            </View>
          ))}

          {/* Disclaimer */}
          <Text style={s.disclaimer}>
            Este resultado é baseado em padrões estatísticos e não substitui acompanhamento profissional de saúde mental.
          </Text>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 12,
  },
  loadingText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },

  // Sem perfil
  semPerfilContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  semPerfilEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  semPerfilTitulo: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  semPerfilSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  semPerfilBtn: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  semPerfilBtnText: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
    fontSize: fonts.sizes.sm,
  },

  // Header gradiente
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  headerEmoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  headerTitulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
  },
  headerData: {
    fontSize: fonts.sizes.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },

  // Corpo
  corpo: {
    padding: 20,
    gap: 12,
  },
  justificativa: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },

  // Médias
  mediasRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaValor: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  mediaLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: fonts.weights.medium,
  },
  mediaRef: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: 'center',
  },

  divisor: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  espacador: {
    height: 8,
  },

  // Seções
  secaoTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  listaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  listaInsight: {
    backgroundColor: '#FFF8F0',
  },
  listaRec: {
    backgroundColor: '#F0F7FF',
  },
  listaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  listaTexto: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
  },

  // Disclaimer
  disclaimer: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 8,
  },
});
