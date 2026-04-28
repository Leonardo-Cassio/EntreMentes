import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ── Constantes ─────────────────────────────────────────────────────────────
const EMOJIS_HUMOR = [
  { nivel: 1, emoji: '😢', label: 'Muito mal' },
  { nivel: 2, emoji: '😟', label: 'Mal'       },
  { nivel: 3, emoji: '😐', label: 'Neutro'    },
  { nivel: 4, emoji: '🙂', label: 'Bem'       },
  { nivel: 5, emoji: '😄', label: 'Muito bem' },
];

const OPCOES_ESTRESSE = [
  { valor: 'Baixo', emoji: '😊', label: 'Baixo' },
  { valor: 'Medio', emoji: '😤', label: 'Médio' },
  { valor: 'Alto',  emoji: '😫', label: 'Alto'  },
];

const OPCOES_DESEMPENHO = [
  { valor: 'Melhorou', icone: 'trending-up',   label: 'Melhorou' },
  { valor: 'Mesmo',    icone: 'remove',         label: 'Mesmo'    },
  { valor: 'Piorou',   icone: 'trending-down',  label: 'Piorou'   },
];

const DATA_HOJE = new Date().toLocaleDateString('pt-BR', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// ── Sub-componentes ─────────────────────────────────────────────────────────

function HeaderApp({ iniciais }) {
  return (
    <View style={s.headerApp}>
      <Text style={s.appNome}>EntreMentes</Text>
      <View style={s.avatar}>
        <Text style={s.avatarTexto}>{iniciais}</Text>
      </View>
    </View>
  );
}

function BarraProgresso({ progresso }) {
  return (
    <View style={s.progressoWrapper}>
      <View style={s.progressoBarra}>
        <View style={[s.progressoFill, { width: `${progresso}%` }]} />
      </View>
      <Text style={s.progressoLabel}>{progresso}% completo</Text>
    </View>
  );
}

function Divisor({ texto }) {
  return (
    <View style={s.divisorRow}>
      <View style={s.divisorLinha} />
      <Text style={s.divisorTexto}>{texto}</Text>
      <View style={s.divisorLinha} />
    </View>
  );
}

function CardSlider({ icone, titulo, subtitulo, valor, min, max, step, unidade, onChange }) {
  return (
    <View style={s.avaliacaoCard}>
      <View style={s.avaliacaoHeader}>
        <Ionicons name={icone} size={18} color={colors.primary} />
        <View style={s.avaliacaoInfo}>
          <Text style={s.avaliacaoTitulo}>{titulo}</Text>
          <Text style={s.avaliacaoSub}>{subtitulo}</Text>
        </View>
      </View>
      <View style={s.sliderRow}>
        <Slider
          style={s.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={valor}
          onValueChange={onChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <Text style={s.sliderValor}>{valor.toFixed(1)}{unidade}</Text>
      </View>
    </View>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export default function RegistroDiarioScreen({ navigation, route }) {
  const { user, token } = useAuth();

  const iniciais = user?.name
    ? user.name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : 'US';

  const [humor,      setHumor]      = useState(null);
  const [nota,       setNota]       = useState('');
  const [tempoTela,  setTempoTela]  = useState(7);
  const [sono,       setSono]       = useState(6);
  const [atividade,  setAtividade]  = useState(2);
  const [estresse,   setEstresse]   = useState(null);
  const [ansiedade,  setAnsiedade]  = useState(null);
  const [desempenho, setDesempenho] = useState(null);
  const [salvando,   setSalvando]   = useState(false);
  const [sucesso,    setSucesso]    = useState(false);

  // Reseta o formulário toda vez que a aba for focada.
  // Se vier nivelHumorInicial via parâmetro (do Dashboard), pré-preenche o humor.
  useFocusEffect(
    useCallback(() => {
      const humorInicial = route.params?.nivelHumorInicial ?? null;
      setHumor(humorInicial);
      setNota('');
      setTempoTela(7);
      setSono(6);
      setAtividade(2);
      setEstresse(null);
      setAnsiedade(null);
      setDesempenho(null);
      setSucesso(false);
      if (humorInicial !== null) {
        navigation.setParams({ nivelHumorInicial: undefined });
      }
    }, [route.params?.nivelHumorInicial])
  );

  const preenchidos = 3
    + (humor      !== null ? 1 : 0)
    + (estresse   !== null ? 1 : 0)
    + (ansiedade  !== null ? 1 : 0)
    + (desempenho !== null ? 1 : 0);
  const progresso = Math.round((preenchidos / 7) * 100);
  const completo  = preenchidos === 7;

  const handleSalvar = async () => {
    if (!completo) return;
    setSalvando(true);
    try {
      const res = await api.createRegistro(token, {
        nivelHumor:          humor,
        nota:                nota || undefined,
        tempoTela:           tempoTela,
        duracaoSono:         sono,
        atividadeFisica:     atividade,
        nivelEstresse:       estresse,
        ansiedadeAntesProva: ansiedade,
        desempenhoAcademico: desempenho,
      });
      if (!res.success) throw new Error(res.message || 'Erro ao salvar');
      setSucesso(true);
      setTimeout(() => navigation.navigate('Dashboard'), 1500);
    } catch (err) {
      Alert.alert('Erro', `Não foi possível salvar o registro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  if (sucesso) {
    return (
      <SafeAreaView style={[s.safe, s.sucessoContainer]}>
        <Text style={s.sucessoIcone}>✅</Text>
        <Text style={s.sucessoTitulo}>Registro salvo!</Text>
        <Text style={s.sucessoSub}>Redirecionando para o Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header do app */}
        <HeaderApp iniciais={iniciais} />

        {/* Título da página */}
        <View style={s.paginaHeader}>
          <View style={s.paginaTituloBloco}>
            <Text style={s.paginaTitulo}>Registro Diário</Text>
            <Text style={s.paginaSub}>
              Como você está hoje? Registre seu humor e{'\n'}responda algumas perguntas rápidas
            </Text>
          </View>
          <View style={s.dataRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={s.dataTexto}>{DATA_HOJE}</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <BarraProgresso progresso={progresso} />

        {/* ── Seu Humor Hoje ── */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>Seu Humor Hoje</Text>
          <View style={s.emojiRow}>
            {EMOJIS_HUMOR.map(e => (
              <TouchableOpacity
                key={e.nivel}
                style={[s.emojiBtn, humor === e.nivel && s.emojiBtnAtivo]}
                onPress={() => setHumor(e.nivel)}
                activeOpacity={0.7}
              >
                <Text style={s.emojiIcon}>{e.emoji}</Text>
                <Text style={[s.emojiLabel, humor === e.nivel && s.emojiLabelAtivo]}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Nota opcional ── */}
        <View style={s.card}>
          <Text style={s.notaLabel}>
            Deseja adicionar uma nota?{' '}
            <Text style={s.opcional}>(opcional)</Text>
          </Text>
          <TextInput
            style={s.textarea}
            placeholder="Escreva como você está se sentindo..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={280}
            value={nota}
            onChangeText={setNota}
            textAlignVertical="top"
          />
          <Text style={s.contador}>{nota.length}/280</Text>
        </View>

        {/* ── Divisor ── */}
        <Divisor texto="Avaliação de Bem-Estar" />

        {/* ── Sliders ── */}
        <CardSlider
          icone="desktop-outline"
          titulo="Tempo de Tela"
          subtitulo="Quantas horas por dia você fica em frente a telas?"
          valor={tempoTela}
          min={0} max={12} step={0.5}
          unidade="h"
          onChange={setTempoTela}
        />

        <CardSlider
          icone="moon-outline"
          titulo="Duração do Sono"
          subtitulo="Quantas horas por noite você dorme?"
          valor={sono}
          min={0} max={12} step={0.5}
          unidade="h"
          onChange={setSono}
        />

        <CardSlider
          icone="fitness-outline"
          titulo="Atividade Física"
          subtitulo="Quantas horas por semana você pratica exercício?"
          valor={atividade}
          min={0} max={10} step={0.5}
          unidade="h"
          onChange={setAtividade}
        />

        {/* ── Nível de Estresse ── */}
        <View style={s.avaliacaoCard}>
          <View style={s.avaliacaoHeader}>
            <MaterialCommunityIcons name="emoticon-outline" size={18} color={colors.primary} />
            <View style={s.avaliacaoInfo}>
              <Text style={s.avaliacaoTitulo}>Nível de Estresse</Text>
              <Text style={s.avaliacaoSub}>Como você avalia seu nível de estresse atual?</Text>
            </View>
          </View>
          <View style={s.opcoesRow}>
            {OPCOES_ESTRESSE.map(o => (
              <TouchableOpacity
                key={o.valor}
                style={[s.opcaoBtn, estresse === o.valor && s.opcaoBtnAtivo]}
                onPress={() => setEstresse(o.valor)}
                activeOpacity={0.7}
              >
                <Text style={s.opcaoEmoji}>{o.emoji}</Text>
                <Text style={[s.opcaoLabel, estresse === o.valor && s.opcaoLabelAtivo]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Ansiedade antes de Provas ── */}
        <View style={s.avaliacaoCard}>
          <View style={s.avaliacaoHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <View style={s.avaliacaoInfo}>
              <Text style={s.avaliacaoTitulo}>Ansiedade antes de Provas</Text>
              <Text style={s.avaliacaoSub}>Você sente ansiedade antes de provas ou avaliações?</Text>
            </View>
          </View>
          <View style={s.opcoesRow}>
            {[{ valor: true, label: 'Sim' }, { valor: false, label: 'Não' }].map(o => (
              <TouchableOpacity
                key={String(o.valor)}
                style={[s.opcaoBtn, ansiedade === o.valor && s.opcaoBtnAtivo]}
                onPress={() => setAnsiedade(o.valor)}
                activeOpacity={0.7}
              >
                <Text style={[s.opcaoLabel, ansiedade === o.valor && s.opcaoLabelAtivo]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Desempenho Acadêmico ── */}
        <View style={s.avaliacaoCard}>
          <View style={s.avaliacaoHeader}>
            <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
            <View style={s.avaliacaoInfo}>
              <Text style={s.avaliacaoTitulo}>Desempenho Acadêmico</Text>
              <Text style={s.avaliacaoSub}>Como você percebe seu desempenho acadêmico recente?</Text>
            </View>
          </View>
          <View style={s.opcoesRow}>
            {OPCOES_DESEMPENHO.map(o => (
              <TouchableOpacity
                key={o.valor}
                style={[s.opcaoBtn, desempenho === o.valor && s.opcaoBtnAtivo]}
                onPress={() => setDesempenho(o.valor)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={o.icone}
                  size={16}
                  color={desempenho === o.valor ? colors.primary : colors.textSecondary}
                />
                <Text style={[s.opcaoLabel, desempenho === o.valor && s.opcaoLabelAtivo]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Botão salvar ── */}
        <TouchableOpacity
          style={[s.salvarBtn, !completo && s.salvarBtnDesabilitado]}
          onPress={handleSalvar}
          disabled={!completo || salvando}
          activeOpacity={0.85}
        >
          <Text style={s.salvarBtnTexto}>
            {salvando ? 'Salvando...' : 'Salvar Registro Completo'}
          </Text>
        </TouchableOpacity>

        <Text style={s.aviso}>Você pode atualizar seu registro uma vez por dia</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },

  // Header do app
  headerApp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appNome: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },

  // Cabeçalho da página
  paginaHeader: {
    gap: 8,
  },
  paginaTituloBloco: {
    gap: 4,
  },
  paginaTitulo: {
    fontSize: 24,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  paginaSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dataTexto: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },

  // Progresso
  progressoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressoBarra: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressoFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  progressoLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
    minWidth: 80,
    textAlign: 'right',
  },

  // Cards genéricos
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },

  // Emojis de humor
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  emojiBtnAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#F3F1FF',
  },
  emojiIcon: {
    fontSize: 24,
  },
  emojiLabel: {
    fontSize: 10,
    fontWeight: fonts.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emojiLabelAtivo: {
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
  },

  // Nota
  notaLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  opcional: {
    fontWeight: fonts.weights.regular,
    color: colors.textSecondary,
  },
  textarea: {
    height: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: fonts.sizes.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'System',
  },
  contador: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: -4,
  },

  // Divisor
  divisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  divisorTexto: {
    fontSize: 11,
    fontWeight: fonts.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cards de avaliação (slider + opções)
  avaliacaoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avaliacaoInfo: {
    flex: 1,
    gap: 2,
  },
  avaliacaoTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  avaliacaoSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Slider
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 32,
  },
  sliderValor: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },

  // Botões de opção
  opcoesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opcaoBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
  },
  opcaoBtnAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#F3F1FF',
  },
  opcaoEmoji: {
    fontSize: 20,
  },
  opcaoLabel: {
    fontSize: 12,
    fontWeight: fonts.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  opcaoLabelAtivo: {
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
  },

  // Botão salvar
  salvarBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  salvarBtnDesabilitado: {
    opacity: 0.45,
  },
  salvarBtnTexto: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  aviso: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: -4,
  },

  // Tela de sucesso
  sucessoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sucessoIcone: {
    fontSize: 56,
  },
  sucessoTitulo: {
    fontSize: 22,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  sucessoSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
});
