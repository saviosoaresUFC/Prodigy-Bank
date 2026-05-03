import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { api } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/usuarios/cadastro', { nome, email, senha });
      Alert.alert('Parabéns!', 'Sua conta Prodigy foi criada. Agora é só entrar.', [
        { text: 'Acessar agora', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      Alert.alert('Erro no Cadastro', message);
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
        <View className="mb-10">
          <Text className="text-slate-900 text-3xl font-bold tracking-tighter">Seja Prodigy</Text>
          <View className="flex-row items-center mt-2">
            <View className="w-6 h-1 bg-prodigy-blue mr-2" />
            <Text className="text-slate-500 text-lg">Inicie sua jornada financeira</Text>
          </View>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 mb-2 ml-1 font-medium">Nome Completo</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl"
              placeholder="Ex: Savio Soares"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View>
            <Text className="text-slate-700 mb-2 mt-4 ml-1 font-medium">E-mail pessoal</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl"
              placeholder="seu@provedor.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-slate-700 mb-2 mt-4 ml-1 font-medium">Defina uma senha</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <TouchableOpacity 
            className={`bg-prodigy-blue p-4 rounded-2xl items-center mt-10 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-50' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? 'Preparando tudo...' : 'Confirmar Abertura de Conta'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500">Já é parte do time? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-prodigy-blue font-bold">Faça login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
