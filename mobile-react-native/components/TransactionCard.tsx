import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionProps {
    item: {
        id: string | number;
        isEntrada: boolean;
        contato: string;
        tipo: string;
        valor: number;
        createdAt?: string;
        descricao?: string;
    };
    showDate?: boolean;
}

export function TransactionCard({ item, showDate = false }: Readonly<TransactionProps>) {
    return (
        <View className="flex-row items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-3 shadow-sm">
            {/* Ícone */}
            <View className={`w-10 h-10 rounded-full items-center justify-center ${item.isEntrada ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Ionicons
                    name={item.isEntrada ? "arrow-down" : "arrow-up"}
                    size={20}
                    color={item.isEntrada ? "#10b981" : "#ef4444"}
                />
            </View>

            {/* Informações da Transação */}
            <View className="flex-1 ml-4 mr-2">
                <Text className="text-slate-900 font-bold" numberOfLines={1}>
                    {item.contato}
                </Text>
                <Text className="text-slate-500 text-[10px] uppercase tracking-wider">
                    {showDate && item.createdAt
                        ? `${new Date(item.createdAt).toLocaleDateString('pt-BR')} • `
                        : ""}
                    {item.tipo}
                </Text>

                {/* Descrição */}
                {item.descricao && (
                    <Text
                        className="text-slate-400 text-[10px] mt-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.descricao}
                    </Text>
                )}
            </View>

            {/* Valor */}
            <View className="items-end">
                <Text className={`font-bold text-sm ${item.isEntrada ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.isEntrada ? '+' : '-'} R$ {item.valor.toFixed(2)}
                </Text>
            </View>
        </View>
    );
}