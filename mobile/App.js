import React, { useRef, useEffect } from 'react';
import { View, Animated, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import AppTabs  from './src/navigation/AppTabs';
import { colors } from './src/theme/colors';

function Navegacao() {
  const { isAuthenticated, loading } = useAuth();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (loading) return;
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ scale }] }}>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          {Platform.OS === 'web' ? (
            <View style={web.fundo}>
              <View style={web.container}>
                <Navegacao />
              </View>
            </View>
          ) : (
            <Navegacao />
          )}
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const web = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    maxHeight: 932,
    overflow: 'hidden',
    borderRadius: Platform.OS === 'web' ? 16 : 0,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
});
