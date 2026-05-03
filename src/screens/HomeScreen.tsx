import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { getRatesByDate, saveRates, DailyRates } from '../db/database';
import { fetchAllRates } from '../api/ratesApi';
import { useRatesStore } from '../store/useRatesStore';
import { formatCurrency } from '../utils/formatter';

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

    const loadData = async (forceRefresh = false) => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // 1. Buscamos en caché (SQLite) salvo que el usuario fuerce actualizar
        let localRates = forceRefresh ? null : await getRatesByDate(today);

        // 2. Si no hay datos hoy o forzamos, consumimos las APIs
        if (!localRates) {
            console.log("Buscando en API...");
            const apiRates = await fetchAllRates();

            if (apiRates) {
                await saveRates(today, apiRates);
                localRates = apiRates;
            }
        }

        // 3. Inyectamos a Zustand
        if (localRates) {
            useRatesStore.getState().setRates({
                bcv: localRates.bcv || 0,
                euro: localRates.euro || 0,
                binance: localRates.binance_sell || 0
            });
        }

        setRates(localRates);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
    };

    const cardsConfig = [
        { id: 'bcv', title: 'BCV', value: rates?.bcv },
        { id: 'euro', title: 'Euro', value: rates?.euro },
        { id: 'binance_buy', title: 'Binance (Compra)', value: rates?.binance_buy },
        { id: 'binance_sell', title: 'Binance (Venta)', value: rates?.binance_sell },
    ];

    if (loading && !rates) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Actualizando tasas...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Cabecera con título y botón de recargar */}
                <View style={styles.header}>
                    <Text style={styles.title}>Tasas de Hoy</Text>
                    <TouchableOpacity onPress={() => loadData(true)} disabled={loading} style={styles.refreshBtn}>
                        <MaterialIcons name="refresh" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {cardsConfig.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.leftHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.trendText}>--</Text>
                            </View>

                            <View style={styles.rightHeader}>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => item.value && copyToClipboard(formatCurrency(item.value))}
                                >
                                    <MaterialIcons name="content-copy" size={22} color={COLORS.gray} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, { marginLeft: 15 }]}>
                                    <MaterialIcons name="share" size={22} color={COLORS.gray} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.rateText}>
                            {item.value ? `${formatCurrency(item.value)} VES` : 'Sin datos'}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    refreshBtn: { padding: 4 },
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