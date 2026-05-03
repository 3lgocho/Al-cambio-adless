// Formatea números a estilo español/venezolano (ej: 1.234.567,89)
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Mantenemos la tuya por si la usas para limpiar datos del scraper
export const cleanBcvPrice = (rawText: string): number => {
    const cleaned = rawText.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    return Math.round(parsed * 100) / 100;
};