import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-white p-6 pt-12">
      <Text className="text-slate-900 text-2xl font-bold mb-8">Meu Perfil</Text>

      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-prodigy-blue rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
          <Text className="text-white text-4xl font-bold">
            {user?.nome.charAt(0)}
          </Text>
        </View>
        <Text className="text-slate-900 text-xl font-bold">{user?.nome}</Text>
        <Text className="text-slate-500">{user?.email}</Text>
      </View>

      <View className="bg-slate-50 rounded-3xl p-2 border border-slate-100 shadow-sm">
        <ProfileItem icon="person-outline" label="Dados Pessoais" />
        <ProfileItem icon="shield-checkmark-outline" label="Segurança" />
        <ProfileItem icon="help-circle-outline" label="Ajuda" />
        <TouchableOpacity 
          className="flex-row items-center p-4"
          onPress={() => setIsModalVisible(true)}
        >
          <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </View>
          <Text className="flex-1 ml-4 text-red-500 font-medium">Sair da Conta</Text>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <View className="mt-auto items-center pb-24">
        <Text className="text-slate-400 text-xs text-center">
          Prodigy Bank v1.0.0{"\n"}
          Orgulhosamente brasileiro
        </Text>
      </View>

      <ConfirmationModal 
        visible={isModalVisible}
        title="Sair da Conta"
        message="Tem certeza que deseja sair do seu aplicativo Prodigy Bank?"
        confirmText="Sair"
        cancelText="Ficar"
        isDestructive={true}
        onConfirm={() => {
          setIsModalVisible(false);
          signOut();
        }}
        onCancel={() => setIsModalVisible(false)}
      />
    </View>
  );
}

function ProfileItem({ icon, label }: { icon: any, label: string }) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-200/60">
      <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
        <Ionicons name={icon} size={22} color="#0001FA" />
      </View>
      <Text className="flex-1 ml-4 text-slate-800 font-medium">{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
}
