import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import CadeadoIcon from '../assets/CadeadoIcon';
import { colors, fonts } from '../theme';

function EmailIcon({ color, size }) {
  return (
    <MaterialCommunityIcons name="email-outline" size={size} color={color} />
  );
}

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Erro', data.message);
        return;
      }

      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'Fazer login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Bem vindo!</Text>
            <Text style={styles.subtitle}>Crie sua conta para continuar</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome</Text>
              <Input
                placeholder="Digite seu Nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Input
                placeholder="Digite seu E-mail"
                value={email}
                onChangeText={setEmail}
                icon={EmailIcon}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <Input
                placeholder="Digite sua Senha"
                value={password}
                onChangeText={setPassword}
                icon={CadeadoIcon}
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <Input
                placeholder="Digite sua Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={CadeadoIcon}
                secureTextEntry
              />
            </View>

            <Button
              title="Cadastrar"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.copyright}>EntreMentes © 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: fonts.sizes.xxl, fontWeight: fonts.weights.bold, color: colors.text },
  subtitle: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginTop: 4 },
  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  label: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium, color: colors.text },
  button: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  footerLink: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: fonts.weights.semibold },
  copyright: { textAlign: 'center', fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 40, marginBottom: 20 },
});
