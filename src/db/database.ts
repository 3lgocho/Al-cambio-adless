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
        db = await SQLite.openDatabaseAsync('alcambio.db');

        // Eliminamos la tabla vieja si existe para evitar conflictos de esquema 
        // (Ojo: esto borra datos locales previos, pero como estamos en desarrollo, es lo más limpio).
        await db.execAsync(`DROP TABLE IF EXISTS exchange_rates;`);

        // Nuevo esquema: La fecha es la llave primaria.
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