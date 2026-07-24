import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, RefreshControl, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, Share, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getRatesByDate, saveRates, getPreviousDayRates, DailyRates } from '../db/database';
import { fetchAllRates } from '../api/ratesApi';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
    green: '#10B981',
    red: '#EF4444',
    amber: '#F59E0B',
};

interface CardConfig {
    id: string;
    title: string;
    value: number | null | undefined;
    previousValue: number | null | undefined;
}

const calcTrend = (current: number | null | undefined, previous: number | null | undefined): string | null => {
    if (current == null || previous == null || previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
};

const HomeScreen = () => {
    const [rates, setRates] = useState<DailyRates | null>(null);
    const [prevRates, setPrevRates] = useState<DailyRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [offlineInfo, setOfflineInfo] = useState<string | null>(null);
    const toastOpacity = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async (isRefresh = false) => {
        const today = new Date().toISOString().split('T')[0];

        if (isRefresh) {
            setRefreshing(true);
        }

        let localRates = await getRatesByDate(today);
        let usedCache = false;

        const apiRates = await fetchAllRates();

        if (apiRates) {
            await saveRates(today, apiRates);
            localRates = apiRates;
            setOfflineInfo(null);
        } else if (localRates) {
            usedCache = true;
            const dateParts = localRates ? today.split('-') : [];
            setOfflineInfo(`Sin conexión - Mostrando datos de ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
        } else {
            setOfflineInfo(null);
        }

        setRates(localRates);

        const previous = await getPreviousDayRates(today);
        setPrevRates(previous);

        if (isRefresh) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const cardsConfig: CardConfig[] = [
        { id: 'bcv', title: 'BCV', value: rates?.bcv, previousValue: prevRates?.bcv },
        { id: 'euro', title: 'Euro', value: rates?.euro, previousValue: prevRates?.euro },
        { id: 'binance_buy', title: 'Binance (Compra)', value: rates?.binance_buy, previousValue: prevRates?.binance_buy },
        { id: 'binance_sell', title: 'Binance (Venta)', value: rates?.binance_sell, previousValue: prevRates?.binance_sell },
    ];

    const showToast = () => {
        Animated.sequence([
            Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(1200),
            Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    };

    const handleCopy = async (value: number | null | undefined) => {
        if (value != null) {
            await Clipboard.setStringAsync(value.toFixed(2));
            showToast();
        }
    };

    const handleShare = async (title: string, value: number | null | undefined) => {
        if (value != null) {
            await Share.share({
                message: `${title}: ${value.toFixed(2)} VES`,
            });
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Actualizando tasas...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Tasas de Hoy</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={() => loadData(true)}>
                    <MaterialIcons name="refresh" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {offlineInfo && (
                <View style={styles.offlineBanner}>
                    <MaterialIcons name="wifi-off" size={16} color={COLORS.amber} />
                    <Text style={styles.offlineText}>{offlineInfo}</Text>
                </View>
            )}

            {cardsConfig.map((item) => {
                const trend = calcTrend(item.value, item.previousValue);
                const isUp = trend && trend.startsWith('+');
                const isDown = trend && trend.startsWith('-');

                return (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.leftHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                {trend ? (
                                    <Text style={[
                                        styles.trendText,
                                        { color: isUp ? COLORS.green : isDown ? COLORS.red : COLORS.gray }
                                    ]}>
                                        {isUp ? '▲' : isDown ? '▼' : ''} {trend}
                                    </Text>
                                ) : (
                                    <Text style={styles.trendText}>--</Text>
                                )}
                            </View>

                            <View style={styles.rightHeader}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleCopy(item.value)}>
                                    <MaterialIcons name="content-copy" size={22} color={COLORS.gray} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, { marginLeft: 15 }]} onPress={() => handleShare(item.title, item.value)}>
                                    <MaterialIcons name="share" size={22} color={COLORS.gray} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.rateText}>
                            {item.value ? `${item.value.toFixed(2)} VES` : 'Sin datos'}
                        </Text>
                    </View>
                );
            })}

            <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
                <MaterialIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.toastText}>Copiado al portapapeles</Text>
            </Animated.View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    refreshBtn: { padding: 6 },
    offlineBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7',
        padding: 10, borderRadius: 10, marginBottom: 15,
    },
    offlineText: { fontSize: 12, color: '#92400E', fontWeight: '600', marginLeft: 8, flex: 1 },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftHeader: { flexDirection: 'row', alignItems: 'center' },
    rightHeader: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginRight: 10 },
    trendText: { fontWeight: '600', fontSize: 14 },
    actionBtn: { padding: 4 },
    rateText: { fontSize: 36, fontWeight: '900', marginVertical: 10, color: COLORS.text },
    toast: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
});

export default HomeScreen;
