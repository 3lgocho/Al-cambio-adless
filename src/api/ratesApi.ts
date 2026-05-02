// src/api/ratesApi.ts

const API_BASE = 'https://ve.dolarapi.com/v1';

export const fetchAllRates = async () => {
    try {
        const [dolaresRes, eurosRes] = await Promise.all([
            fetch(`${API_BASE}/dolares`),
            fetch(`${API_BASE}/euros`)
        ]);

        if (!dolaresRes.ok || !eurosRes.ok) {
            throw new Error(`Error HTTP: Dolares ${dolaresRes.status}, Euros ${eurosRes.status}`);
        }

        const dolaresData = await dolaresRes.json();
        const eurosData = await eurosRes.json();

        // Usamos 'fuente' tal como lo devuelve la API
        const bcv = dolaresData.find((d: any) => d.fuente === 'oficial');
        const euro = Array.isArray(eurosData) 
            ? eurosData.find((e: any) => e.fuente === 'oficial') 
            : eurosData;
            
        // Seguimos buscando Binance por si la API lo habilita a futuro, 
        // pero sabemos que por ahora será undefined.
        const binance = dolaresData.find((d: any) => d.fuente === 'binance' || d.nombre?.toLowerCase() === 'binance');

        // Extraemos el paralelo temporalmente por si lo necesitas como comodín
        const paralelo = dolaresData.find((d: any) => d.fuente === 'paralelo');

        return {
            bcv: bcv ? bcv.promedio : null,
            euro: euro ? euro.promedio : null,
            binance_buy: binance ? (binance.compra || binance.promedio) : null,
            binance_sell: binance ? (binance.venta || binance.promedio) : null,
            paralelo: paralelo ? paralelo.promedio : null
        };
    } catch (error) {
        console.error('Error obteniendo datos de la API:', error);
        return null; 
    }
};