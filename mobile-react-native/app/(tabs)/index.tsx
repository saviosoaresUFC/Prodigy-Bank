import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Skeleton } from '../../components/Skeleton';
import {
  Area,
  CartesianChart,
  Line,
} from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { TransactionCard } from '@/components/TransactionCard';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 10);

  const chartData = [
    { x: 'Seg', y: 200 },
    { x: 'Ter', y: 450 },
    { x: 'Qua', y: 300 },
    { x: 'Qui', y: 800 },
    { x: 'Sex', y: 500 },
    { x: 'Sab', y: 150 },
    { x: 'Dom', y: 100 },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), fetchTransactions()]);
    setRefreshing(false);
  };

  async function fetchTransactions() {
    try {
      const response = await api.get('/transacoes');
      setTransactions(response.data.slice(0, 5));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0001FA" />}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="p-6 pt-12">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-sm font-medium">Bem-vindo à Prodigy</Text>
            <Text className="text-slate-900 text-2xl font-bold">{user?.nome}</Text>
          </View>
          <TouchableOpacity className="bg-slate-50 p-3 rounded-full border border-slate-100 shadow-sm">
            <Ionicons name="notifications-outline" size={24} color="#0001FA" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Skeleton width="100%" height={160} style={{ borderRadius: 24, marginBottom: 32, backgroundColor: '#f1f5f9' }} />
        ) : (
          <LinearGradient
            colors={['#0001FA', '#00008B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 rounded-[32px] mb-8 shadow-2xl shadow-blue-900/40"
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={16} color="white" />
                <Text className="text-blue-100 text-xs font-medium ml-2 uppercase tracking-tighter">Saldo Total</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className="bg-white/20 p-2 rounded-full">
                <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={18} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-4xl font-bold tracking-tight">
              {showBalance ? `R$ ${user?.conta?.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
            </Text>

            <View className="mt-4 pt-4 border-t border-white/20 flex-row justify-between items-center">
              <Text className="text-white/80 text-[10px] font-mono">CC: {user?.conta?.numero}</Text>
              {/* <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-white mr-1" />
                <Text className="text-white text-[10px] font-bold tracking-wider">PRODIGY</Text>
              </View> */}
            </View>
          </LinearGradient>
        )}

        <View className="flex-row flex-wrap justify-between mb-10 w-full gap-2">
          <ActionBtn
            icon="paper-plane-outline"
            label="PIX"
            onPress={() => router.push('/pix')}
          />
          <ActionBtn
            icon="barcode-outline"
            label="Pagar"
          />
          <ActionBtn
            icon="trending-up-outline"
            label="Investir"
          />
          <ActionBtn
            icon="list-outline"
            label="Extrato"
            onPress={() => router.push('/(tabs)/history')}
          />
        </View>

        <View className="mb-10">
          <Text className="text-slate-900 text-lg font-bold mb-4">Fluxo de Caixa (Semana)</Text>
          <View className="bg-slate-50 rounded-3xl p-4 border border-slate-100 shadow-sm h-52">
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={["y"]}
              axisOptions={{
                font,
                labelColor: "#64748b",
                tickCount: 5,
              }}
              padding={{ top: 10, bottom: 30, left: 30, right: 10 }}
            >
              {({ points, chartBounds }) => (
                <>
                  <Area
                    points={points.y}
                    y0={chartBounds.bottom}
                    color="#0001FA"
                    opacity={0.1}
                    curveType="natural"
                  />

                  <Line
                    points={points.y}
                    color="#0001FA"
                    strokeWidth={3}
                    curveType="natural"
                  />
                </>
              )}
            </CartesianChart>
          </View>
        </View>

        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-900 text-lg font-bold">Atividades Recentes</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/history')}
              className='w-1/2 justify-end items-center flex-row gap-1'
            >
              <Text className="text-prodigy-blue text-sm px-2 py-1">Ver tudo</Text>
              <Ionicons name="arrow-forward-outline" size={16} color="#0001FA" />
            </TouchableOpacity>
          </View>

          {transactions.map((item) => (
            <TransactionCard key={item.id} item={item} />
          ))}

          {!loading && transactions.length === 0 && (
            <Text className="text-slate-400 text-center mt-4 italic">Nenhuma transação recente.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) {
  return (
    <View className="items-center w-[20%]">
      <TouchableOpacity
        className="bg-white w-20 h-20 rounded-2xl items-center justify-center mb-2 shadow-sm border border-slate-100"
        onPress={onPress}
      >
        <Ionicons name={icon} size={32} color="#0001FA" />
      </TouchableOpacity>
      <Text className="text-slate-600 text-sm font-medium">{label}</Text>
    </View>
  );
}
