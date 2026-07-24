import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAllRates, DailyRatesWithDate } from '../db/database';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
    green: '#10B981',
    red: '#EF4444',
};

const screenWidth = Dimensions.get('window').width - 40;

const ChartsScreen = () => {
    const [data, setData] = useState<DailyRatesWithDate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const allRates = await getAllRates();
            setData(allRates);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.emptyText}>No hay datos históricos aún.</Text>
                <Text style={styles.emptySubText}>Las tasas se guardan automáticamente cada día.</Text>
            </View>
        );
    }

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    const labels = sorted.map(d => {
        const parts = d.date.split('-');
        return `${parts[2]}/${parts[1]}`;
    });

    const bcvData = sorted.map(d => d.bcv ?? 0);
    const euroData = sorted.map(d => d.euro ?? 0);

    const latest = sorted[sorted.length - 1];
    const bcvValues = sorted.map(d => d.bcv).filter((v): v is number => v != null);
    const highest = Math.max(...bcvValues);
    const lowest = Math.min(...bcvValues);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Gráficos</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Evolución BCV</Text>
                {bcvData.length > 1 ? (
                    <LineChart
                        data={{
                            labels: labels.length > 6
                                ? labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0 || i === labels.length - 1)
                                : labels,
                            datasets: [{ data: bcvData }],
                        }}
                        width={screenWidth - 20}
                        height={220}
                        yAxisLabel="Bs."
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: COLORS.card,
                            backgroundGradientFrom: COLORS.card,
                            backgroundGradientTo: COLORS.card,
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                            labelColor: () => COLORS.gray,
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: COLORS.primary,
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                ) : (
                    <Text style={styles.noDataText}>Se necesitan al menos 2 días de datos.</Text>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Resumen BCV</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Actual</Text>
                        <Text style={styles.statValue}>{latest.bcv?.toFixed(2) ?? '--'}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Más alto</Text>
                        <Text style={[styles.statValue, { color: COLORS.green }]}>{highest.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Más bajo</Text>
                        <Text style={[styles.statValue, { color: COLORS.red }]}>{lowest.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            {euroData.some(v => v > 0) && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Evolución Euro</Text>
                    <LineChart
                        data={{
                            labels: labels.length > 6
                                ? labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0 || i === labels.length - 1)
                                : labels,
                            datasets: [{ data: euroData.map(v => v || 0) }],
                        }}
                        width={screenWidth - 20}
                        height={220}
                        yAxisLabel="Bs."
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: COLORS.card,
                            backgroundGradientFrom: COLORS.card,
                            backgroundGradientTo: COLORS.card,
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            labelColor: () => COLORS.gray,
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: COLORS.green,
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    chart: { borderRadius: 12, marginLeft: -10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: COLORS.gray, fontWeight: 'bold', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '900', color: COLORS.text },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
    emptySubText: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginTop: 8 },
    noDataText: { fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingVertical: 20 },
});

export default ChartsScreen;
