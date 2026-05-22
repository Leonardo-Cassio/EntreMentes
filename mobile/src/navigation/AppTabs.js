import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import DashboardScreen      from '../screens/DashboardScreen';
import RegistroDiarioScreen from '../screens/RegistroDiarioScreen';
import HistoricoScreen      from '../screens/HistoricoScreen';
import EstatisticasScreen   from '../screens/EstatisticasScreen';
import PerfilScreen         from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard:    { focused: 'grid',        default: 'grid-outline'        },
  'Diário':     { focused: 'create',      default: 'create-outline'      },
  'Histórico':  { focused: 'time',        default: 'time-outline'        },
  'Estatísticas': { focused: 'bar-chart', default: 'bar-chart-outline'   },
  Perfil:       { focused: 'person',      default: 'person-outline'      },
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
      <Tab.Screen name="Dashboard"     component={DashboardScreen}      />
      <Tab.Screen name="Diário"        component={RegistroDiarioScreen} />
      <Tab.Screen name="Histórico"     component={HistoricoScreen}      />
      <Tab.Screen name="Estatísticas"  component={EstatisticasScreen}   />
      <Tab.Screen name="Perfil"        component={PerfilScreen}         />
    </Tab.Navigator>
  );
}
