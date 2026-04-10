// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchBcvPrice } from '../api/bcvScraper';
import { getPriceByDate, savePrice } from '../db/database';
import { Ionicons } from '@expo/vector-icons'; // Usamos los íconos que instalamos

export default function HomeScreen() {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('Iniciando...');

    // Función para obtener la fecha de hoy en formato "YYYY-MM-DD"
    const getTodayString = () => new Date().toISOString().split('T')[0];

    const loadData = async (forceScrape = false) => {
        setLoading(true);
        const today = getTodayString();

        // 1. Intentamos leer la base de datos primero (si no estamos forzando)
        if (!forceScrape) {
            setStatus('Consultando memoria local...');
            const savedPrice = await getPriceByDate(today);
            if (savedPrice) {
                setPrice(savedPrice);
                setStatus('Cargado al instante desde la BD ⚡');
                setLoading(false);
                return;
            }
        }

        // 2. Si no hay dato o forzamos el refresco, activamos el Scraper
        setStatus('Conectando sigilosamente al BCV 🕵️‍♂️...');
        const scrapedPrice = await fetchBcvPrice();

        if (scrapedPrice) {
            await savePrice(today, scrapedPrice);
            setPrice(scrapedPrice);
            setStatus('Precio raspado y guardado con éxito ✅');
        } else {
            setStatus('Error: El BCV no respondió o cambió la página ❌');
        }
        setLoading(false);
    };

    // Se ejecuta automáticamente al abrir la app
    useEffect(() => {
        loadData();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Referencia Oficial</Text>

            <View style={styles.card}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1a2b4c" />
                ) : (
                    <>
                        <Text style={styles.currency}>Bs.</Text>
                        <Text style={styles.price}>{price ? price.toFixed(2) : '---'}</Text>
                    </>
                )}
            </View>

            <Text style={styles.statusText}>{status}</Text>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => loadData(true)}
                disabled={loading}
            >
                <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Forzar Extracción</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 50,
        borderRadius: 20,
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOpacity: 0.1,
        shadowRadius: 10,
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    currency: {
        fontSize: 30,
        fontWeight: '600',
        color: '#1a2b4c',
        marginRight: 8,
    },
    price: {
        fontSize: 60,
        fontWeight: '900',
        color: '#1a2b4c',
    },
    statusText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1a2b4c',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#a0aabf',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});