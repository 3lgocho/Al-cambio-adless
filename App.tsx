import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CalcScreen from './src/screens/CalcScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 1. Importamos la Base de Datos y el Store de Zustand
import { initDB } from './src/db/database';
import { useRatesStore } from './src/store/useRatesStore';

// Importa las funciones reales de tu BD (asegúrate de que los nombres coincidan)
// import { saveRateToSQLite, getLatestRatesFromSQLite } from './src/db/database';

const Tab = createBottomTabNavigator();

// --- CONFIGURACIÓN DE TU API SUPABASE ---
const SUPABASE_URL = 'https://ljtvqijdjiaphugbwepy.supabase.co/functions/v1/sync-rates';
// Reemplaza esto con tu Anon Key real que copiaste del Dashboard de Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHZxaWpkamlhcGh1Z2J3ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjc0OTMsImV4cCI6MjA5Mzk0MzQ5M30.FLm_KxdkpTPR-HLLP8DaYBHyB1gY_N5HkN9OFVcwD5A';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const { setRates } = useRatesStore();

  // Función para obtener y sincronizar las tasas
  const fetchAndSyncRates = useCallback(async () => {
    try {
      console.log('Intentando sincronizar con Supabase...');
      const response = await fetch(SUPABASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const bcvRate = data.fuentes.bcv.dolar;
      const binanceRate = data.fuentes.binance.promedio;
      const lastUpdate = data.fecha_actualizacion;

      // 1. Actualizamos el estado global en memoria (Zustand)
      setRates({
        bcv: bcvRate,
        binance: binanceRate,
        lastUpdate: lastUpdate
      });

      // 2. Guardamos en SQLite para uso offline
      // Descomenta estas líneas cuando tengas las funciones de SQLite listas
      // await saveRateToSQLite('BCV', bcvRate, lastUpdate);
      // await saveRateToSQLite('BINANCE', binanceRate, lastUpdate);

      console.log('Sincronización exitosa con Supabase.');

    } catch (error) {
      console.warn('Fallo la conexión con Supabase. Intentando cargar modo offline...', error);

      // Fallback Offline: Intentar leer de SQLite si no hay internet
      /*
      try {
        const offlineRates = await getLatestRatesFromSQLite();
        if (offlineRates && offlineRates.bcv && offlineRates.binance) {
          setRates({
             bcv: offlineRates.bcv,
             binance: offlineRates.binance,
             lastUpdate: offlineRates.lastUpdate || new Date().toISOString()
          });
          Alert.alert("Modo Offline", "Mostrando las últimas tasas guardadas.");
        }
      } catch (dbError) {
         console.error('Tampoco se pudo recuperar información de la BD local:', dbError);
      }
      */
    }
  }, [setRates]);

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        // Primero, inicializamos la base de datos local
        await initDB();
      } catch (e) {
        console.warn("Error al inicializar la BD local:", e);
      } finally {
        // Una vez la BD esté lista (o haya fallado de forma segura),
        // procedemos a buscar los datos frescos en la API
        await fetchAndSyncRates();
        setIsDbReady(true);
      }
    };

    bootstrapApp();
  }, [fetchAndSyncRates]);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

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