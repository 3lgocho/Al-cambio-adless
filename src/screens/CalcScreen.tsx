import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
};

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
    const [value, setValue] = useState(100);
    const TASA = 47.64;

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

    const usdDisplay = activeField === 'USD' ? formatValue(value) : (parseFloat(formatValue(value)) / TASA).toFixed(2);
    const vesDisplay = activeField === 'VES' ? formatValue(value) : (parseFloat(formatValue(value)) * TASA).toFixed(2);

    return (
        <View style={styles.container}>
            <View style={styles.displaySection}>
                <TouchableOpacity
                    style={[styles.inputBox, activeField === 'USD' && styles.activeBox]}
                    onPress={() => setActiveField('USD')}
                >
                    <Text style={styles.label}>DÓLARES (USD)</Text>
                    <Text style={styles.amount}>$ {activeField === 'USD' ? formatValue(value) : (parseFloat(vesDisplay) / TASA).toFixed(2)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.inputBox, activeField === 'VES' && styles.activeBox]}
                    onPress={() => setActiveField('VES')}
                >
                    <Text style={styles.label}>BOLÍVARES (VES)</Text>
                    <Text style={styles.amount}>Bs. {activeField === 'VES' ? formatValue(value) : (parseFloat(usdDisplay) * TASA).toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
            <CustomKeypad onKeyPress={handlePress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    displaySection: { marginBottom: 20 },
    inputBox: { backgroundColor: COLORS.card, padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    activeBox: { borderColor: COLORS.primary, borderWidth: 2 },
    label: { fontSize: 12, color: COLORS.gray, fontWeight: 'bold' },
    amount: { fontSize: 32, fontWeight: '900', color: COLORS.text },
    keypadContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    key: { width: '30%', height: 70, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderRadius: 12, elevation: 2 },
    keyText: { fontSize: 24, fontWeight: 'bold' },
});

export default CalcScreen;