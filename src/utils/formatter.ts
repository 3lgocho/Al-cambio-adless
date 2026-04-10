// src/utils/formatter.ts

export const cleanBcvPrice = (rawText: string): number => {
    // Ej: " 475,95830000 " -> "475.95830000" -> 475.96
    const cleaned = rawText.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);

    // Redondeamos a 2 decimales exactos como se usa en la calle
    return Math.round(parsed * 100) / 100;
};