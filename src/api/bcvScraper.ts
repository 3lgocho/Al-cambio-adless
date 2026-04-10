// src/api/bcvScraper.ts
// Adiós HTML sucio, hola JSON limpio.

// Usaremos el endpoint oficial de una de las APIs comunitarias más estables
const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

export const fetchBcvPrice = async (): Promise<number | null> => {
    try {
        const response = await fetch(API_URL, {
            // Ya no necesitamos fingir ser un navegador
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();

        // La API nos devuelve un objeto ordenado, solo tomamos la propiedad "promedio"
        if (data && data.promedio) {
            return data.promedio;
        } else {
            throw new Error('La API respondió, pero no se encontró el precio.');
        }

    } catch (error) {
        console.error('Fallo en la conexión a la API comunitaria:', error);
        return null;
    }
};