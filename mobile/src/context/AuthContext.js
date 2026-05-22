import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão persistida ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser  = await AsyncStorage.getItem('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // falha silenciosa — usuário precisará fazer login novamente
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (tokenValue, userData) => {
    await AsyncStorage.setItem('token', tokenValue);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const updateUser = async (userData) => {
    const updated = { ...user, ...userData };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
