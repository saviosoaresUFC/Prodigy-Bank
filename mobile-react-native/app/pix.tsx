import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PixScreen() {
  const [numeroDestino, setNumeroDestino] = useState('');
  const [valorStr, setValorStr] = useState(''); // Armazena os dígitos digitados
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroConta, setErroConta] = useState('');
  const [erroValor, setErroValor] = useState('');

  const { refreshUser } = useAuth();
  const router = useRouter();

  const displayValor = React.useMemo(() => {
    if (!valorStr) return '0,00';
    const num = Number.parseInt(valorStr, 10);
    if (Number.isNaN(num)) return '0,00';
    return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [valorStr]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setValorStr(prev => prev.slice(0, -1));
      setErroValor('');
    } else if (valorStr.length < 10) { // Limite razoável para o valor
      setValorStr(prev => prev + key);
      setErroValor('');
    }
  };

  async function handleTransfer() {
    setErroConta('');
    setErroValor('');
    let hasError = false;

    if (!numeroDestino) {
      setErroConta('A conta de destino é obrigatória');
      hasError = true;
    }

    const numericValue = Number.parseInt(valorStr || '0', 10) / 100;
    if (numericValue <= 0) {
      setErroValor('O valor deve ser maior que zero');
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);
      await api.post('/transacoes/transferir', {
        numeroDestino,
        valor: numericValue,
        descricao: descricao || 'Transferência PIX'
      });

      await refreshUser();
      Alert.alert('Sucesso', 'Transferência realizada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao realizar transferência';
      Alert.alert('Falha na Operação', message);
    } finally {
      setLoading(false);
    }
  }

  const KeyButton = ({ num }: { num: string }) => (
    <TouchableOpacity
      className="w-[30%] h-16 items-center justify-center rounded-2xl active:bg-slate-100"
      onPress={() => handleKeyPress(num)}
    >
      <Text className="text-slate-800 text-3xl font-medium">{num}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white pt-12">
      <View className="px-6 pb-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
          <Ionicons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="text-slate-900 text-3xl font-bold mb-8">Transferência PIX</Text>

        <View className="mb-6">
          <Text className="text-slate-600 mb-2 font-medium">Conta do Destinatário</Text>
          <TextInput
            className={`bg-slate-50 text-slate-900 p-4 rounded-2xl border ${erroConta ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="Ex: 123456"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={numeroDestino}
            onChangeText={(t) => {
              setNumeroDestino(t);
              setErroConta('');
            }}
          />
          {!!erroConta && <Text className="text-red-500 text-xs mt-1 ml-1">{erroConta}</Text>}
        </View>

        <View className="mb-6">
          <Text className="text-slate-600 mb-2 font-medium">Valor</Text>
          <View className={`bg-slate-50 p-4 rounded-2xl border flex-row items-center ${erroValor ? 'border-red-500' : 'border-slate-200'}`}>
            <Text className="text-slate-400 text-2xl font-bold mr-2">R$</Text>
            <Text className={`text-3xl font-bold ${valorStr ? 'text-slate-900' : 'text-slate-400'}`}>
              {displayValor}
            </Text>
          </View>
          {!!erroValor && <Text className="text-red-500 text-xs mt-1 ml-1">{erroValor}</Text>}
        </View>

        <View className="mb-8">
          <Text className="text-slate-600 mb-2 font-medium">Mensagem (opcional)</Text>
          <TextInput
            className="bg-slate-50 text-slate-900 p-4 rounded-2xl border border-slate-200"
            placeholder="Para que é este PIX?"
            placeholderTextColor="#94a3b8"
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>
      </ScrollView>

      {/* Teclado Customizado */}
      <View className="px-6 pb-8 bg-white border-t border-slate-100 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <KeyButton key={num} num={num} />
          ))}
          <View className="w-[30%]" />
          <KeyButton num="0" />
          <TouchableOpacity
            className="w-[30%] h-16 items-center justify-center rounded-2xl active:bg-slate-100"
            onPress={() => handleKeyPress('backspace')}
          >
            <Ionicons name="backspace-outline" size={32} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`bg-prodigy-blue p-5 rounded-2xl items-center mt-6 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-50' : ''}`}
          onPress={handleTransfer}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">
            {loading ? 'Validando...' : 'Confirmar Envio'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
