import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0001FA',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 30,
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          shadowColor: '#0001FA',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          borderTopWidth: 0,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-12 h-12 rounded-full items-center justify-center ${focused ? 'bg-blue-50' : 'bg-transparent'}`}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#0001FA' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-12 h-12 rounded-full items-center justify-center ${focused ? 'bg-blue-50' : 'bg-transparent'}`}>
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={focused ? '#0001FA' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-12 h-12 rounded-full items-center justify-center ${focused ? 'bg-blue-50' : 'bg-transparent'}`}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#0001FA' : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
