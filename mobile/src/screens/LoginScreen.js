import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import CadeadoIcon from '../assets/CadeadoIcon';
import { colors, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function EmailIcon({ color, size }) {
  return <MaterialCommunityIcons name="email-outline" size={size} color={color} />;
}

// Typewriter hook — escreve `text` em `durationMs` milissegundos
function useTypewriter(text, durationMs) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const ms = durationMs / text.length;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, ms);
    return () => clearInterval(id);
  }, []);
  return { displayed, done };
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { displayed: heading, done: typingDone } = useTypewriter('Olá!', 2000);

  // Cursor piscando
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (typingDone) { cursorOpacity.setValue(0); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [typingDone]);

  // Card sobe ao montar
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardY, { toValue: 0, duration: 520, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      if (!data.success) {
        Alert.alert('Erro', data.message || 'Credenciais inválidas.');
        return;
      }
      await login(data.data.token, data.data.user);
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#7B2FBE', '#4A90D9', '#6C5CE7']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.gradient}
    >
      <StatusBar style="light" />

      {/* Logo */}
      <View style={s.logoRow}>
        <View style={s.logoBox}><Text style={s.logoLetter}>E</Text></View>
        <Text style={s.logoName}>EntreMentes</Text>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card branco */}
          <Animated.View style={[s.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>

            {/* Heading com typewriter */}
            <View style={s.headingRow}>
              <Text style={s.heading}>{heading}</Text>
              {!typingDone && (
                <Animated.Text style={[s.cursor, { opacity: cursorOpacity }]}>|</Animated.Text>
              )}
            </View>
            <Text style={s.subtitle}>Bem-vindo de volta à comunidade</Text>

            {/* Campos */}
            <View style={s.form}>
              <View style={s.fieldGroup}>
                <Text style={s.label}>E-mail</Text>
                <Input
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  icon={EmailIcon}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Senha</Text>
                <Input
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  icon={CadeadoIcon}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={s.forgotRow}>
                <Text style={s.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <Button title="Entrar" onPress={handleLogin} loading={loading} />
            </View>

            {/* Rodapé */}
            <View style={s.footer}>
              <Text style={s.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 8,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  logoName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.3,
  },

  // Scroll
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Heading typewriter
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  heading: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 44,
  },
  cursor: {
    fontSize: 34,
    fontWeight: '300',
    color: colors.primary,
    marginLeft: 2,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 28,
  },

  // Formulário
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    fontSize: fonts.sizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  // Rodapé
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  footerLink: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
  },
});
