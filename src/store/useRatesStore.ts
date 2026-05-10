import { create } from 'zustand';

interface RatesState {
    bcv: number;
    euro: number;
    binance: number;
    lastUpdate: string;
    // Usamos Partial<RatesState> para que puedas actualizar solo el bcv, o solo binance, sin que pida todo
    setRates: (rates: Partial<RatesState>) => void;
}

export const useRatesStore = create<RatesState>((set) => ({
    // Valores iniciales
    bcv: 0,
    euro: 0,
    binance: 0,
    lastUpdate: '', // <-- Faltaba darle un valor inicial vacío al arrancar la app

    // Al usar Partial, debemos fusionar el estado anterior (...state) con los datos nuevos (...rates)
    setRates: (rates) => set((state) => ({ ...state, ...rates })),
}));