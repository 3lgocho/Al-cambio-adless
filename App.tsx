import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importamos nuestro motor y base de datos
import { fetchBcvPrice } from './src/api/bcvScraper';
import { getPriceByDate, savePrice, initDB } from './src/db/database';

// --- TEMA ---
const COLORS = {
  bg: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  primary: '#2563EB',
  gray: '#9CA3AF',
};

// --- CALCULADORA ---
const CustomKeypad = ({ onKeyPress }: { onKeyPress: (key: string) => void }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'AC', '0', '⌫'];
  return (
    <View style={styles.keypadContainer}>
      {keys.map((key) => (
        <TouchableOpacity
          key={key}
          style={[styles.key, key === 'AC' && { backgroundColor: '#FEE2E2' }]}
          onPress={() => onKeyPress(key)}
        >
          <Text style={[styles.keyText, key === 'AC' && { color: '#EF4444' }]}>{key}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CalcScreen = () => {
  const [activeField, setActiveField] = useState<'USD' | 'VES'>('USD');
  const [value, setValue] = useState(100); // 1.00 guardado como entero
  const [tasa, setTasa] = useState<number>(0);

  useEffect(() => {
    const loadTasa = async () => {
      const today = new Date().toISOString().split('T')[0];
      const savedPrice = await getPriceByDate(today);
      if (savedPrice) setTasa(savedPrice);
    };
    loadTasa();
  }, []);

  const formatValue = (val: number) => (val / 100).toFixed(2);

  const handlePress = (key: string) => {
    if (key === 'AC') {
      setValue(0);
    } else if (key === '⌫') {
      setValue(Math.floor(value / 10));
    } else if (value.toString().length < 12) {
      const num = parseInt(key);
      if (!isNaN(num)) setValue(value * 10 + num);
    }
  };

  // Si la tasa no ha cargado, evitamos dividir por cero
  const displayTasa = tasa > 0 ? tasa : 1;

  const usdDisplay = activeField === 'USD' ? formatValue(value) : (parseFloat(formatValue(value)) / displayTasa).toFixed(2);
  const vesDisplay = activeField === 'VES' ? formatValue(value) : (parseFloat(formatValue(value)) * displayTasa).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora</Text>
      <View style={styles.displaySection}>
        <TouchableOpacity
          style={[styles.inputBox, activeField === 'USD' && styles.activeBox]}
          onPress={() => setActiveField('USD')}
        >
          <Text style={styles.label}>DÓLARES (USD)</Text>
          <Text style={styles.amount}>$ {usdDisplay}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.inputBox, activeField === 'VES' && styles.activeBox]}
          onPress={() => setActiveField('VES')}
        >
          <Text style={styles.label}>BOLÍVARES (VES)</Text>
          <Text style={styles.amount}>Bs. {vesDisplay}</Text>
        </TouchableOpacity>
      </View>
      <CustomKeypad onKeyPress={handlePress} />
    </View>
  );
};

// --- HOME SCREEN (Real Data) ---
const HomeScreen = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (force = false) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    if (!force) {
      const savedPrice = await getPriceByDate(today);
      if (savedPrice) {
        setPrice(savedPrice);
        setLoading(false);
        return;
      }
    }

    const scrapedPrice = await fetchBcvPrice();
    if (scrapedPrice) {
      await savePrice(today, scrapedPrice);
      setPrice(scrapedPrice);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tasas de Hoy</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardTitle}>Banco Central (BCV)</Text>
          <TouchableOpacity onPress={() => loadData(true)}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
        ) : (
          <Text style={styles.rateText}>{price ? `${price.toFixed(2)} VES` : 'Error'}</Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}><Text>Copiar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text>Compartir</Text></TouchableOpacity>
        </View>
      </View>

      {/* Mock Card para Paralelo por ahora */}
      <View style={[styles.card, { opacity: 0.5 }]}>
        <Text style={styles.cardTitle}>En Paralelo (Próximamente)</Text>
        <Text style={styles.rateText}>--- VES</Text>
      </View>

    </ScrollView>
  );
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDB();
      setDbReady(true);
    };
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Iniciando Base de Datos...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            if (route.name === 'Inicio') iconName = 'trending-up';
            else if (route.name === 'Calcular') iconName = 'calculator';
            else if (route.name === 'Gráficos') iconName = 'stats-chart';
            else iconName = 'settings';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Calcular" component={CalcScreen} />
        <Tab.Screen name="Gráficos" component={() => <View style={styles.container}><Text>Gráficos Mock</Text></View>} />
        <Tab.Screen name="Ajustes" component={() => <View style={styles.container}><Text>Ajustes Mock</Text></View>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  displaySection: { marginBottom: 20 },
  inputBox: { backgroundColor: COLORS.card, padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  activeBox: { borderColor: COLORS.primary, borderWidth: 2 },
  label: { fontSize: 12, color: COLORS.gray, fontWeight: 'bold' },
  amount: { fontSize: 32, fontWeight: '900', color: COLORS.text },
  keypadContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: { width: '30%', height: 70, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderRadius: 12, elevation: 2 },
  keyText: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray },
  rateText: { fontSize: 36, fontWeight: '900', marginVertical: 10, color: COLORS.text },
  cardActions: { flexDirection: 'row', marginTop: 10 },
  actionBtn: { marginRight: 15, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 8 },
});