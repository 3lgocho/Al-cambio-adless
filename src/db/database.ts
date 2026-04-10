// src/db/database.ts
import * as SQLite from 'expo-sqlite';

// Variable global para mantener la conexión
let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
    try {
        // Abrimos (o creamos) la base de datos
        db = await SQLite.openDatabaseAsync('alcambio.db');

        // Creamos la tabla si no existe. 
        // Usamos UNIQUE en la fecha para no duplicar registros del mismo día.
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        price REAL NOT NULL
      );
    `);
        console.log('Base de datos local inicializada.');
    } catch (error) {
        console.error('Error inicializando la BD:', error);
    }
};

export const savePrice = async (date: string, price: number) => {
    if (!db) return;
    try {
        // INSERT OR REPLACE: Si ya existe un registro con esta fecha, lo actualiza. Si no, lo crea.
        await db.runAsync(
            'INSERT OR REPLACE INTO exchange_rates (date, price) VALUES (?, ?)',
            [date, price]
        );
        console.log(`Precio guardado en BD: ${price} para la fecha ${date}`);
    } catch (error) {
        console.error('Error guardando el precio:', error);
    }
};

export const getPriceByDate = async (date: string): Promise<number | null> => {
    if (!db) return null;
    try {
        // Buscamos la tasa específica de un día
        const result = await db.getFirstAsync<{ price: number }>(
            'SELECT price FROM exchange_rates WHERE date = ?',
            [date]
        );
        return result ? result.price : null;
    } catch (error) {
        console.error('Error buscando el precio:', error);
        return null;
    }
};