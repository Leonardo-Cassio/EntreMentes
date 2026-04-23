import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import DashboardScreen      from '../screens/DashboardScreen';
import RegistroDiarioScreen from '../screens/RegistroDiarioScreen';

const Tab = createBottomTabNavigator();

function TelaPlaceholder({ nome }) {
  return (
    <View style={s.placeholder}>
      <Text style={s.placeholderText}>{nome}</Text>
      <Text style={s.placeholderSub}>Em breve</Text>
    </View>
  );
}

const HumorScreen    = () => <TelaPlaceholder nome="Humor" />;
const HistoricoScreen = () => <TelaPlaceholder nome="Histórico" />;
const PerfilScreen   = () => <TelaPlaceholder nome="Perfil" />;

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
});
