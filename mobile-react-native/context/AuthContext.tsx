import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, setAuthToken } from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  conta?: {
    id: number;
    numero: string;
    saldo: number;
  }
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isBiometricAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  authenticateBiometrically: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const TOKEN_KEY = 'prodigy_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    const storagedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (storagedToken) {
      setAuthToken(storagedToken);
      try {
        const response = await api.get('/usuarios/me');
        setUser(response.data);
      } catch (error) {
        setAuthToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    }
    
    setLoading(false);
  }

  async function authenticateBiometrically(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setIsBiometricAuthenticated(true); // Se não tem biometria, libera
      return true;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticação Prodigy',
      fallbackLabel: 'Usar senha',
    });

    if (success) {
      setIsBiometricAuthenticated(true);
    }

    return success;
  }

  async function signIn(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    await refreshUser();
    setIsBiometricAuthenticated(true);
  }

  async function refreshUser() {
    try {
      const response = await api.get('/usuarios/me');
      setUser(response.data);
    } catch (error) {
      signOut();
    }
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setIsBiometricAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isBiometricAuthenticated,
      signIn, 
      signOut, 
      refreshUser,
      authenticateBiometrically
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
