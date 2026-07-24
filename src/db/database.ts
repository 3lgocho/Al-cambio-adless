// src/db/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export interface DailyRates {
    bcv: number | null;
    euro: number | null;
    binance_buy: number | null;
    binance_sell: number | null;
}

export const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('alcambio_v2.db');

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS exchange_rates (
                date TEXT PRIMARY KEY,
                bcv REAL,
                euro REAL,
                binance_buy REAL,
                binance_sell REAL
            );
        `);
        console.log('Base de datos reestructurada e inicializada.');
    } catch (error) {
        console.error('Error inicializando la BD:', error);
    }
};

export const saveRates = async (date: string, rates: DailyRates) => {
    if (!db) return;
    try {
        await db.runAsync(
            `INSERT OR REPLACE INTO exchange_rates (date, bcv, euro, binance_buy, binance_sell) 
             VALUES (?, ?, ?, ?, ?)`,
            [date, rates.bcv, rates.euro, rates.binance_buy, rates.binance_sell]
        );
        console.log(`Tasas guardadas para la fecha ${date}`);
    } catch (error) {
        console.error('Error guardando las tasas:', error);
    }
};

export const getRatesByDate = async (date: string): Promise<DailyRates | null> => {
    if (!db) return null;
    try {
        const result = await db.getFirstAsync<DailyRates>(
            'SELECT bcv, euro, binance_buy, binance_sell FROM exchange_rates WHERE date = ?',
            [date]
        );
        return result || null;
    } catch (error) {
        console.error('Error buscando las tasas:', error);
        return null;
    }
};

export interface DailyRatesWithDate extends DailyRates {
    date: string;
}

export const getAllRates = async (): Promise<DailyRatesWithDate[]> => {
    if (!db) return [];
    try {
        const results = await db.getAllAsync<DailyRatesWithDate>(
            'SELECT date, bcv, euro, binance_buy, binance_sell FROM exchange_rates ORDER BY date DESC'
        );
        return results;
    } catch (error) {
        console.error('Error obteniendo histórico de tasas:', error);
        return [];
    }
};

export const getLatestRates = async (): Promise<DailyRates | null> => {
    if (!db) return null;
    try {
        const result = await db.getFirstAsync<DailyRates>(
            'SELECT bcv, euro, binance_buy, binance_sell FROM exchange_rates ORDER BY date DESC LIMIT 1'
        );
        return result || null;
    } catch (error) {
        console.error('Error obteniendo últimas tasas:', error);
        return null;
    }
};

export const getPreviousDayRates = async (beforeDate: string): Promise<DailyRates | null> => {
    if (!db) return null;
    try {
        const result = await db.getFirstAsync<DailyRates>(
            'SELECT bcv, euro, binance_buy, binance_sell FROM exchange_rates WHERE date < ? ORDER BY date DESC LIMIT 1',
            [beforeDate]
        );
        return result || null;
    } catch (error) {
        console.error('Error obteniendo tasas del día anterior:', error);
        return null;
    }
};