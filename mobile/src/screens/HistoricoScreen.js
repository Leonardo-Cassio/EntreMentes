import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ── Helpers ─────────────────────────────────────────────────────────────────

const EMOJIS = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const LABELS = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };

const COR_ESTRESSE = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Card de cada registro ────────────────────────────────────────────────────

function CardRegistro({ item }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => setExpandido(v => !v)}
      activeOpacity={0.85}
    >
      {/* Linha principal */}
      <View style={s.cardTopo}>
        <Text style={s.emoji}>{EMOJIS[item.nivelHumor]}</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardHumor}>{LABELS[item.nivelHumor]}</Text>
          <Text style={s.cardData}>{formatarData(item.createdAt)}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: COR_ESTRESSE[item.nivelEstresse] + '22' }]}>
          <Text style={[s.badgeTexto, { color: COR_ESTRESSE[item.nivelEstresse] }]}>
            {item.nivelEstresse}
          </Text>
        </View>
        <Ionicons
          name={expandido ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textLight}
        />
      </View>

      {/* Detalhes expandidos */}
      {expandido && (
        <View style={s.detalhes}>
          <View style={s.detalheGrade}>
            <ItemDetalhe icone="moon-outline"      label="Sono"      valor={`${item.duracaoSono.toFixed(1)}h`} />
            <ItemDetalhe icone="desktop-outline"   label="Tela"      valor={`${item.tempoTela.toFixed(1)}h`} />
            <ItemDetalhe icone="fitness-outline"   label="Exercício" valor={`${item.atividadeFisica.toFixed(1)}h`} />
            <ItemDetalhe icone="trending-up-outline" label="Desempenho" valor={item.desempenhoAcademico} />
          </View>
          {item.nota ? (
            <View style={s.notaBox}>
              <Ionicons name="chatbubble-outline" size={13} color={colors.textSecondary} />
              <Text style={s.notaTexto}>{item.nota}</Text>
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

function ItemDetalhe({ icone, label, valor }) {
  return (
    <View style={s.itemDetalhe}>
      <Ionicons name={icone} size={14} color={colors.primary} />
      <Text style={s.itemLabel}>{label}</Text>
      <Text style={s.itemValor}>{valor}</Text>
    </View>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function HistoricoScreen() {
  const { token } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Recarrega toda vez que a aba ganhar foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const carregar = async () => {
        setCarregando(true);
        setErro(null);
        try {
          const res = await api.listRegistros(token);
          if (!res.success) throw new Error(res.message || 'Erro ao buscar registros');
          if (ativo) setRegistros(res.data);
        } catch (e) {
          if (ativo) setErro(e.message);
        } finally {
          if (ativo) setCarregando(false);
        }
      };
      carregar();
      return () => { ativo = false; };
    }, [token])
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.titulo}>Histórico</Text>
        <Text style={s.subtitulo}>Seus registros de bem-estar</Text>
      </View>

      {carregando ? (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : erro ? (
        <View style={s.centro}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error ?? '#E17055'} />
          <Text style={s.erroTexto}>{erro}</Text>
        </View>
      ) : registros.length === 0 ? (
        <View style={s.centro}>
          <Text style={s.vazioEmoji}>📋</Text>
          <Text style={s.vazioTitulo}>Nenhum registro ainda</Text>
          <Text style={s.vazioSub}>Faça seu primeiro registro na aba Diário</Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CardRegistro item={item} />}
          contentContainerStyle={s.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 2,
  },
  titulo: {
    fontSize: 24,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  subtitulo: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },

  lista: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 0,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: 28 },
  cardInfo: { flex: 1, gap: 2 },
  cardHumor: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  cardData: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: fonts.weights.bold,
  },

  // Detalhes expandidos
  detalhes: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  detalheGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  itemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  itemValor: {
    fontSize: 11,
    color: colors.text,
    fontWeight: fonts.weights.bold,
  },
  notaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
  },
  notaTexto: {
    flex: 1,
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Estados
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  erroTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  vazioEmoji: { fontSize: 48 },
  vazioTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  vazioSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
