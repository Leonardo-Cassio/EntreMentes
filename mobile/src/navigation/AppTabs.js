import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import DashboardScreen      from '../screens/DashboardScreen';
import RegistroDiarioScreen from '../screens/RegistroDiarioScreen';
import HistoricoScreen      from '../screens/HistoricoScreen';

const Tab = createBottomTabNavigator();

function TelaPlaceholder({ nome }) {
  return (
    <View style={s.placeholder}>
      <Text style={s.placeholderText}>{nome}</Text>
      <Text style={s.placeholderSub}>Em breve</Text>
    </View>
  );
}

const HumorScreen = () => <TelaPlaceholder nome="Humor" />;

function PerfilScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={s.placeholder}>
      <View style={s.perfilAvatar}>
        <Text style={s.perfilIniciais}>
          {user?.name ? user.name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('') : 'US'}
        </Text>
      </View>
      <Text style={s.perfilNome}>{user?.name ?? 'Usuário'}</Text>
      <Text style={s.perfilEmail}>{user?.email ?? ''}</Text>
      <TouchableOpacity style={s.sairBtn} onPress={logout} activeOpacity={0.8}>
        <Text style={s.sairTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const ICONS = {
  Dashboard: { focused: 'grid',                 default: 'grid-outline'                },
  Diário:    { focused: 'create',               default: 'create-outline'              },
  Humor:     { focused: 'happy',                default: 'happy-outline'               },
  Histórico: { focused: 'time',                 default: 'time-outline'                },
  Perfil:    { focused: 'person',               default: 'person-outline'              },
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: fonts.weights.medium,
        },
        tabBarIcon: ({ focused, color }) => {
          const map = ICONS[route.name];
          const name = focused ? map.focused : map.default;
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen}      />
      <Tab.Screen name="Diário"     component={RegistroDiarioScreen} />
      <Tab.Screen name="Humor"      component={HumorScreen}          />
      <Tab.Screen name="Histórico"  component={HistoricoScreen}      />
      <Tab.Screen name="Perfil"     component={PerfilScreen}         />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 8,
  },
  placeholderText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  placeholderSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },

  perfilAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  perfilIniciais: {
    fontSize: 28,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  perfilNome: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  perfilEmail: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 32,
  },
  sairBtn: {
    backgroundColor: '#FFF0EE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  sairTexto: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: '#E17055',
  },
});
