import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/login', { email, senha });
      await signIn(response.data.auth_token);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'E-mail ou senha inválidos';
      Alert.alert('Falha no Login', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-12 items-center">
          <View className="bg-blue-50 p-4 rounded-3xl mb-4">
            <Ionicons name="shield-checkmark" size={48} color="#0001FA" />
          </View>
          <Text className="text-slate-900 text-4xl font-bold tracking-tighter">PRODIGY</Text>
          <Text className="text-slate-500 text-sm font-medium mt-2">O banco do futuro</Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-700 mb-2 ml-1 font-medium">E-mail de acesso</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl"
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-slate-700 mb-2 mt-4 ml-1 font-medium">Senha secreta</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <TouchableOpacity
            className={`bg-prodigy-blue p-4 rounded-2xl items-center mt-8 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-50' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? 'Acessando conta...' : 'Entrar na Prodigy'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500">Novo por aqui? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-prodigy-blue font-bold">Abra sua conta</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
