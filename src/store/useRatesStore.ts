import { create } from 'zustand';

interface RatesState {
    bcv: number;
    euro: number;
    binance: number;
    // Acción para actualizar las tasas desde la DB
    setRates: (rates: { bcv: number; euro: number; binance: number }) => void;
}

export const useRatesStore = create<RatesState>((set) => ({
    bcv: 0,
    euro: 0,
    binance: 0,
    setRates: (rates) => set(rates),
}));