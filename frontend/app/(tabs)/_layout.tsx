import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../_layout'; // Pega o hook de auth

export default function TabLayout() {
  const { user, loading } = useAuth();

  // Mostra o loading qnd ta verificando o user
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Se n tem user, manda pro login. Rota protegida
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Se tem user, mostra as abas principais
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // tira o titulo default
        tabBarActiveTintColor: '#007AFF',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // TODO: add icone
        }}
      />
      <Tabs.Screen
        name="explore" // o nome do arquivo eh explore.tsx
        options={{
          title: 'Perfil',
          // TODO: add icone
        }}
      />
    </Tabs>
  );
}