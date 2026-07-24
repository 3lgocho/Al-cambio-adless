import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    primary: '#2563EB',
    gray: '#9CA3AF',
};

const SettingsScreen = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Ajustes</Text>
            <Text style={styles.subTitle}>Personaliza tu experiencia financiera.</Text>

            <View style={styles.card}>
                {/* Notificaciones */}
                <View style={styles.settingRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.settingTitle}>Notificaciones</Text>
                        <Text style={styles.settingDesc}>Alertas de tasas y seguridad</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                        thumbColor={notificationsEnabled ? COLORS.primary : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={notificationsEnabled}
                    />
                </View>

                <View style={styles.divider} />

                {/* Compartir App */}
                <TouchableOpacity style={styles.settingRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="share-social" size={20} color={COLORS.text} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.settingTitle}>Compartir App</Text>
                        <Text style={styles.settingDesc}>Recomiéndanos a tus amigos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Califícanos */}
                <TouchableOpacity style={styles.settingRow}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="star" size={20} color="#D97706" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.settingTitle}>Califícanos</Text>
                        <Text style={styles.settingDesc}>Tu opinión nos ayuda a crecer</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
            </View>

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>VERSIÓN 1.0.0 • AL CAMBIO</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
    subTitle: { fontSize: 14, color: COLORS.gray, marginBottom: 25 },
    card: { backgroundColor: COLORS.card, borderRadius: 16, paddingVertical: 10, elevation: 2 },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    textContainer: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    settingDesc: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 },
    versionContainer: { marginTop: 40, alignItems: 'center', backgroundColor: '#E5E7EB', padding: 15, borderRadius: 12 },
    versionText: { fontSize: 12, color: COLORS.gray, fontWeight: 'bold', letterSpacing: 1 },
});

export default SettingsScreen;