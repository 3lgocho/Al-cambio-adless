import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
};

const HomeScreen = () => (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>Tasas de Hoy</Text>
        {['BCV', 'Paralelo', 'Binance'].map((item) => (
            <View key={item} style={styles.card}>
                <div className="flex justify-between items-center">
                    <Text style={styles.cardTitle}>{item}</Text>
                    <Text style={{ color: 'green' }}>↑ 0.45%</Text>
                </div>
                <Text style={styles.rateText}>47.50 VES</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn}><Text>Copiar</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}><Text>Compartir</Text></TouchableOpacity>
                </View>
            </View>
        ))}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    rateText: { fontSize: 36, fontWeight: '900', marginVertical: 10 },
    cardActions: { flexDirection: 'row', marginTop: 10 },
    actionBtn: { marginRight: 15, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 8 },
});

export default HomeScreen;