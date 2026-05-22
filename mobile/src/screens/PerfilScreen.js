import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

function Avatar({ name }) {
  const iniciais = name
    ? name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : 'US';
  return (
    <View style={s.avatar}>
      <Text style={s.avatarTexto}>{iniciais}</Text>
    </View>
  );
}

function Campo({ label, value, onChangeText, placeholder, secureTextEntry, autoCapitalize }) {
  return (
    <View style={s.campo}>
      <Text style={s.campoLabel}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
      />
    </View>
  );
}

export default function PerfilScreen() {
  const { user, token, updateUser, logout } = useAuth();

  const [nome,  setNome]  = useState(user?.name  ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const [senhaAtual,    setSenhaAtual]    = useState('');
  const [novaSenha,     setNovaSenha]     = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [salvando,  setSalvando]  = useState('');
  const [feedback,  setFeedback]  = useState({ tipo: '', msg: '' });
  const [modalExcluir, setModalExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function mostrarFeedback(tipo, msg) {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback({ tipo: '', msg: '' }), 4000);
  }

  async function salvarPerfil() {
    if (!nome.trim()) return mostrarFeedback('erro', 'O nome não pode estar vazio.');
    if (!email.trim()) return mostrarFeedback('erro', 'O e-mail não pode estar vazio.');
    setSalvando('perfil');
    try {
      const res = await api.updateMe(token, { name: nome.trim(), email: email.trim() });
      if (!res.success) throw new Error(res.message || 'Erro ao salvar.');
      await updateUser({ name: nome.trim(), email: email.trim() });
      mostrarFeedback('ok', 'Perfil atualizado com sucesso!');
    } catch (e) {
      mostrarFeedback('erro', e.message);
    } finally {
      setSalvando('');
    }
  }

  async function trocarSenha() {
    if (!senhaAtual) return mostrarFeedback('erro', 'Informe a senha atual.');
    if (novaSenha.length < 6) return mostrarFeedback('erro', 'A nova senha deve ter pelo menos 6 caracteres.');
    if (novaSenha !== confirmarSenha) return mostrarFeedback('erro', 'As senhas não coincidem.');
    setSalvando('senha');
    try {
      const res = await api.updateMe(token, { currentPassword: senhaAtual, newPassword: novaSenha });
      if (!res.success) throw new Error(res.message || 'Erro ao trocar senha.');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      mostrarFeedback('ok', 'Senha alterada com sucesso!');
    } catch (e) {
      mostrarFeedback('erro', e.message);
    } finally {
      setSalvando('');
    }
  }

  async function excluirConta() {
    setExcluindo(true);
    try {
      await api.deleteMe(token);
      await logout();
    } catch {
      setModalExcluir(false);
      mostrarFeedback('erro', 'Erro ao excluir conta. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.titulo}>Meu Perfil</Text>

        <View style={s.avatarWrap}>
          <Avatar name={user?.name} />
          <Text style={s.nomeAtual}>{user?.name}</Text>
          <Text style={s.emailAtual}>{user?.email}</Text>
        </View>

        {feedback.msg !== '' && (
          <View style={[s.feedback, feedback.tipo === 'ok' ? s.feedbackOk : s.feedbackErro]}>
            <Text style={s.feedbackTexto}>{feedback.msg}</Text>
          </View>
        )}

        {/* Dados pessoais */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>Dados pessoais</Text>
          <Campo label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" autoCapitalize="words" />
          <Campo label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" />
          <TouchableOpacity
            style={[s.btn, salvando === 'perfil' && s.btnDisabled]}
            onPress={salvarPerfil}
            disabled={salvando !== ''}
            activeOpacity={0.8}
          >
            {salvando === 'perfil'
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={s.btnTexto}>Salvar alterações</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Troca de senha */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>Alterar senha</Text>
          <Campo label="Senha atual" value={senhaAtual} onChangeText={setSenhaAtual} placeholder="••••••••" secureTextEntry />
          <Campo label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} placeholder="Mínimo 6 caracteres" secureTextEntry />
          <Campo label="Confirmar nova senha" value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Repita a nova senha" secureTextEntry />
          <TouchableOpacity
            style={[s.btn, salvando === 'senha' && s.btnDisabled]}
            onPress={trocarSenha}
            disabled={salvando !== ''}
            activeOpacity={0.8}
          >
            {salvando === 'senha'
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={s.btnTexto}>Alterar senha</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Ações da conta */}
        <View style={s.acoesWrap}>
          <TouchableOpacity style={s.btnSair} onPress={logout} activeOpacity={0.8}>
            <Text style={s.btnSairTexto}>Sair da conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnExcluir} onPress={() => setModalExcluir(true)} activeOpacity={0.8}>
            <Text style={s.btnExcluirTexto}>Excluir conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>
          Este conteúdo não substitui acompanhamento profissional de saúde mental.
        </Text>
      </ScrollView>

      {/* Modal excluir conta */}
      <Modal visible={modalExcluir} transparent animationType="fade" onRequestClose={() => setModalExcluir(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>Excluir conta</Text>
            <Text style={s.modalMsg}>
              Esta ação é permanente. Todos os seus registros e dados serão removidos e não poderão ser recuperados.
            </Text>
            <TouchableOpacity
              style={s.modalBtnExcluir}
              onPress={excluirConta}
              disabled={excluindo}
              activeOpacity={0.8}
            >
              {excluindo
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={s.modalBtnExcluirTexto}>Sim, excluir minha conta</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.modalBtnCancelar} onPress={() => setModalExcluir(false)} activeOpacity={0.8}>
              <Text style={s.modalBtnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: 20, paddingBottom: 40 },

  titulo: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: 20,
  },

  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  avatarTexto: { fontSize: 28, fontWeight: fonts.weights.bold, color: colors.white },
  nomeAtual: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text },
  emailAtual: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginTop: 2 },

  feedback: {
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  feedbackOk:   { backgroundColor: '#D4EDDA' },
  feedbackErro: { backgroundColor: '#F8D7DA' },
  feedbackTexto: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium, color: colors.text },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },

  campo: { gap: 6 },
  campoLabel: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium, color: colors.textSecondary },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },

  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: colors.white, fontWeight: fonts.weights.bold, fontSize: fonts.sizes.md },

  acoesWrap: { gap: 10, marginBottom: 16 },
  btnSair: {
    backgroundColor: '#FFF0EE',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnSairTexto: { color: '#E17055', fontWeight: fonts.weights.bold, fontSize: fonts.sizes.md },

  btnExcluir: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E17055',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnExcluirTexto: { color: '#E17055', fontWeight: fonts.weights.bold, fontSize: fonts.sizes.md },

  disclaimer: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 14,
  },
  modalTitulo: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text },
  modalMsg: { fontSize: fonts.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
  modalBtnExcluir: {
    backgroundColor: '#E17055',
    borderRadius: 12, paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnExcluirTexto: { color: colors.white, fontWeight: fonts.weights.bold, fontSize: fonts.sizes.md },
  modalBtnCancelar: {
    backgroundColor: colors.surface,
    borderRadius: 12, paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnCancelarTexto: { color: colors.text, fontWeight: fonts.weights.medium, fontSize: fonts.sizes.md },
});
