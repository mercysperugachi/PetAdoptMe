import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0F766E', // Color teal de nuestra app
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Refugio',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="pets" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="mail" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Asistente',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="smart-toy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}