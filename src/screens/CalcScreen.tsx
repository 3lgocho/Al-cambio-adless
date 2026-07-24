import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getLatestRates, saveRates, DailyRates } from '../db/database';
import { fetchAllRates } from '../api/ratesApi';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
    green: '#10B981',
    amber: '#F59E0B',
};

interface RateOption {
    id: string;
    label: string;
    value: number | null;
}

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
    const [value, setValue] = useState(10000);
    const [hasTyped, setHasTyped] = useState(false);
    const [rates, setRates] = useState<DailyRates | null>(null);
    const [selectedRate, setSelectedRate] = useState<RateOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRates = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);

        let loadedRates = await getLatestRates();

        const apiRates = await fetchAllRates();
        if (apiRates?.bcv) {
            const today = new Date().toISOString().split('T')[0];
            await saveRates(today, apiRates);
            loadedRates = apiRates;
        }

        setRates(loadedRates);

        if (loadedRates?.bcv && (!selectedRate || isRefresh)) {
            setSelectedRate({ id: 'bcv', label: 'BCV Oficial', value: loadedRates.bcv });
        }

        if (isRefresh) setRefreshing(false);
        else setLoading(false);
    }, [selectedRate]);

    useEffect(() => {
        loadRates();
    }, []);

    const rateOptions: RateOption[] = [
        { id: 'bcv', label: 'BCV Oficial', value: rates?.bcv ?? null },
        { id: 'euro', label: 'Euro', value: rates?.euro ?? null },
        { id: 'binance_buy', label: 'Binance Compra', value: rates?.binance_buy ?? null },
        { id: 'binance_sell', label: 'Binance Venta', value: rates?.binance_sell ?? null },
    ];

    const tasa = selectedRate?.value ?? 0;

    const displayValue = hasTyped ? value : 100;
    const formatValue = (val: number) => (val / 100).toFixed(2);

    const handlePress = (key: string) => {
        if (key === 'AC') {
            setValue(100);
            setHasTyped(false);
        } else if (key === '⌫') {
            const newVal = Math.floor(value / 10);
            setValue(newVal);
            if (newVal === 0) {
                setValue(0);
                setHasTyped(false);
            }
        } else if (value.toString().length < 12) {
            const num = parseInt(key);
            if (!isNaN(num)) {
                if (!hasTyped) {
                    setValue(num);
                    setHasTyped(true);
                } else {
                    setValue(value * 10 + num);
                }
            }
        }
    };

    if (loading || !selectedRate) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.gray }}>Cargando tasa...</Text>
            </View>
        );
    }

    const usdDisplay = activeField === 'USD' ? formatValue(displayValue) : tasa > 0 ? (parseFloat(formatValue(displayValue)) / tasa).toFixed(2) : '0.00';
    const vesDisplay = activeField === 'VES' ? formatValue(displayValue) : tasa > 0 ? (parseFloat(formatValue(displayValue)) * tasa).toFixed(2) : '0.00';

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.rateInfo} onPress={() => setModalVisible(true)}>
                <View style={styles.rateInfoLeft}>
                    <Text style={styles.rateLabelText}>Tasa</Text>
                    <Text style={styles.rateValueText}>{selectedRate.label}</Text>
                </View>
                <View style={styles.rateInfoRight}>
                    <Text style={styles.rateAmount}>{tasa.toFixed(2)} VES</Text>
                    <TouchableOpacity onPress={() => loadRates(true)} style={styles.refreshBtn}>
                        {refreshing ? (
                            <ActivityIndicator size={16} color={COLORS.primary} />
                        ) : (
                            <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                    <Ionicons name="chevron-down" size={18} color={COLORS.gray} style={{ marginLeft: 4 }} />
                </View>
            </TouchableOpacity>

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

            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar tasa</Text>
                        <FlatList
                            data={rateOptions.filter(r => r.value != null)}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, selectedRate.id === item.id && styles.modalOptionActive]}
                                    onPress={() => {
                                        setSelectedRate(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, selectedRate.id === item.id && styles.modalOptionTextActive]}>
                                        {item.label}
                                    </Text>
                                    <Text style={[styles.modalOptionRate, selectedRate.id === item.id && styles.modalOptionTextActive]}>
                                        {item.value?.toFixed(2)} VES
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    rateInfo: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2,
    },
    rateInfoLeft: { flexDirection: 'row', alignItems: 'center' },
    rateInfoRight: { flexDirection: 'row', alignItems: 'center' },
    rateLabelText: { fontSize: 14, color: COLORS.gray, fontWeight: 'bold', marginRight: 8 },
    rateValueText: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
    rateAmount: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginRight: 6 },
    refreshBtn: { padding: 4 },
    displaySection: { marginBottom: 20 },
    inputBox: { backgroundColor: COLORS.card, padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    activeBox: { borderColor: COLORS.primary, borderWidth: 2 },
    label: { fontSize: 12, color: COLORS.gray, fontWeight: 'bold' },
    amount: { fontSize: 32, fontWeight: '900', color: COLORS.text },
    keypadContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    key: { width: '30%', height: 70, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderRadius: 12, elevation: 2 },
    keyText: { fontSize: 24, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: '50%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15, textAlign: 'center' },
    modalOption: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, marginBottom: 5,
    },
    modalOptionActive: { backgroundColor: '#EFF6FF' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    modalOptionTextActive: { color: COLORS.primary },
    modalOptionRate: { fontSize: 14, color: COLORS.gray },
});

export default CalcScreen;
