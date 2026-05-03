import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { TransactionCard } from '@/components/TransactionCard';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchTransactions() {
    try {
      const response = await api.get('/transacoes');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-white p-6 pt-12">
      <Text className="text-slate-900 text-2xl font-bold mb-6">Extrato Completo</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0001FA" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TransactionCard item={item} showDate={true} />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="receipt-outline" size={64} color="#e2e8f0" />
            <Text className="text-slate-400 mt-4">Nenhuma movimentação encontrada.</Text>
          </View>
        }
      />
    </View>
  );
}
