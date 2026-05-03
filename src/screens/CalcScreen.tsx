import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRatesStore } from '../store/useRatesStore';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatter';

type RateSource = 'BCV' | 'EURO' | 'BINANCE';
type ActiveInput = 'FOREIGN' | 'VES';

export default function CalcScreen() {
    const { bcv, euro, binance } = useRatesStore();
    const [activeSource, setActiveSource] = useState<RateSource>('BCV');
    const [activeInput, setActiveInput] = useState<ActiveInput>('FOREIGN');
    const [inputValue, setInputValue] = useState<string>('100');

    const currentRate =
        activeSource === 'BCV' ? bcv :
            activeSource === 'EURO' ? euro : binance;

    const currencyInfo = {
        BCV: { label: 'DÓLARES (USD)', symbol: '$' },
        EURO: { label: 'EUROS (EUR)', symbol: '€' },
        BINANCE: { label: 'TETHER (USDT)', symbol: '₮' }
    }[activeSource];

    const parsedInput = parseInt(inputValue || '0', 10) / 100;

    const foreignAmount = activeInput === 'FOREIGN'
        ? parsedInput
        : (currentRate > 0 ? parsedInput / currentRate : 0);

    const vesAmount = activeInput === 'VES'
        ? parsedInput
        : parsedInput * currentRate;

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
    };

    const handleKeyPress = (key: string) => {
        if (key === 'AC') {
            setInputValue('0');
        } else if (key === 'DEL') {
            setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
        } else {
            setInputValue((prev) => (prev === '0' ? key : prev + key));
        }
    };

    const renderKey = (key: string, isAction = false, isDel = false) => (
        <TouchableOpacity
            key={key}
            style={[styles.keyButton, isAction && styles.keyAction]}
            onPress={() => handleKeyPress(key)}
        >
            <Text style={[styles.keyText, isAction && styles.keyTextAction]}>
                {isDel ? '⌫' : key}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.pillsContainer}>
                {(['BCV', 'EURO', 'BINANCE'] as RateSource[]).map((source) => (
                    <TouchableOpacity
                        key={source}
                        style={[styles.pill, activeSource === source && styles.pillActive]}
                        onPress={() => setActiveSource(source)}
                    >
                        <Text style={[styles.pillText, activeSource === source && styles.pillTextActive]}>
                            {source}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.rateInfo}>
                Tasa usada: {currentRate > 0 ? `${formatCurrency(currentRate)} VES` : 'Cargando...'}
            </Text>

            <TouchableOpacity
                style={[styles.inputCard, activeInput === 'FOREIGN' && styles.inputCardActive]}
                onPress={() => { setActiveInput('FOREIGN'); setInputValue('0'); }}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.label}>{currencyInfo.label}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(formatCurrency(foreignAmount))}>
                        <MaterialIcons name="content-copy" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.value}>{currencyInfo.symbol} {formatCurrency(foreignAmount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.inputCard, activeInput === 'VES' && styles.inputCardActive]}
                onPress={() => { setActiveInput('VES'); setInputValue('0'); }}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.label}>BOLÍVARES (VES)</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(formatCurrency(vesAmount))}>
                        <MaterialIcons name="content-copy" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.value}>Bs. {formatCurrency(vesAmount)}</Text>
            </TouchableOpacity>

            <View style={styles.keyboard}>
                <View style={styles.row}>{['1', '2', '3'].map((k) => renderKey(k))}</View>
                <View style={styles.row}>{['4', '5', '6'].map((k) => renderKey(k))}</View>
                <View style={styles.row}>{['7', '8', '9'].map((k) => renderKey(k))}</View>
                <View style={styles.row}>
                    {renderKey('AC', true)}
                    {renderKey('0')}
                    {renderKey('DEL', false, true)}
                </View>
            </View>

        </SafeAreaView>
    );
}

const shadowStyles = Platform.select({
    web: {
        // @ts-ignore
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    },
    default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F4F5F7',
    },
    pillsContainer: {
        marginTop: 10,
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    pill: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    pillActive: {
        backgroundColor: '#FFFFFF',
        ...shadowStyles,
    },
    pillText: {
        fontWeight: '600',
        color: '#64748B',
        fontSize: 14,
    },
    pillTextActive: {
        color: '#0F172A',
    },
    rateInfo: {
        textAlign: 'center',
        marginBottom: 16,
        color: '#64748B',
        fontSize: 12,
    },
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        ...shadowStyles,
    },
    inputCardActive: {
        borderColor: '#3B82F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '700',
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    keyboard: {
        marginTop: 'auto',
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    keyButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadowStyles,
    },
    keyText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0F172A',
    },
    keyAction: {
        backgroundColor: '#FEE2E2',
    },
    keyTextAction: {
        color: '#EF4444',
    },
});