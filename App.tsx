import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CalcScreen from './src/screens/CalcScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 1. Importamos el inicializador de la BD
import { initDB } from './src/db/database'; 

const Tab = createBottomTabNavigator();

export default function App() {
  // 2. Estado para bloquear la UI hasta que SQLite esté listo
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDB();
      } catch (e) {
        console.warn("Error forzando inicio de BD:", e);
      } finally {
        // Pase lo que pase, liberamos la pantalla de carga
        setIsDbReady(true);
      }
    };

    setupDatabase();
  }, []);

  // 3. Pantalla de carga mientras se crea/conecta la base de datos local
  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 4. Renderizamos la app real
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            if (route.name === 'Tazas') iconName = 'trending-up';
            else if (route.name === 'Calcular') iconName = 'calculator';
            else if (route.name === 'Gráficos') iconName = 'stats-chart';
            else iconName = 'settings';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Tazas" component={HomeScreen} />
        <Tab.Screen name="Calcular" component={CalcScreen} />
        <Tab.Screen name="Gráficos" component={ChartsScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}