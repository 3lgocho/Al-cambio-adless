import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getRatesByDate, saveRates, DailyRates } from '../db/database';
import { fetchAllRates } from '../api/ratesApi';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
    green: '#10B981'
};

const HomeScreen = () => {
    const [rates, setRates] = useState<DailyRates | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const today = new Date().toISOString().split('T')[0];
            
            // 1. Buscamos en caché (SQLite)
            let localRates = await getRatesByDate(today);

            // 2. Si no hay datos hoy, consumimos las APIs
            if (!localRates) {
                console.log("No hay datos locales, buscando en API...");
                const apiRates = await fetchAllRates();
                
                if (apiRates) {
                    await saveRates(today, apiRates);
                    localRates = apiRates;
                }
            }

            setRates(localRates);
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Configuramos las tarjetas estáticas basadas en nuestro esquema
    const cardsConfig = [
        { id: 'bcv', title: 'BCV', value: rates?.bcv },
        { id: 'euro', title: 'Euro', value: rates?.euro },
        { id: 'binance_buy', title: 'Binance (Compra)', value: rates?.binance_buy },
        { id: 'binance_sell', title: 'Binance (Venta)', value: rates?.binance_sell },
    ];

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Actualizando tasas...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Tasas de Hoy</Text>
            
            {cardsConfig.map((item) => (
                <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.leftHeader}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            {/* TODO: Lógica real de porcentaje de subida/bajada */}
                            <Text style={styles.trendText}>--</Text> 
                        </View>

                        <View style={styles.rightHeader}>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialIcons name="content-copy" size={22} color={COLORS.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 15 }]}>
                                <MaterialIcons name="share" size={22} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <Text style={styles.rateText}>
                        {item.value ? `${item.value.toFixed(2)} VES` : 'Sin datos'}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftHeader: { flexDirection: 'row', alignItems: 'center' },
    rightHeader: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginRight: 10 },
    trendText: { color: COLORS.green, fontWeight: '600', fontSize: 14 },
    actionBtn: { padding: 4 },
    rateText: { fontSize: 36, fontWeight: '900', marginVertical: 10, color: COLORS.text },
});

export default HomeScreen;