// Importamos Cheerio
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

// ---------------------------------------------------------
// 1. SCRAPER DE BINANCE P2P
// ---------------------------------------------------------
async function obtenerTasasBinance(rows = 5) {
  const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  
  const fetchTipo = async (tradeType: string) => {
    const payload = { fiat: "VES", page: 1, rows: rows, tradeType: tradeType, asset: "USDT", payTypes: [], publisherType: null };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.code === "000000" && data.data && data.data.length > 0) {
        const precios = data.data.map((item: any) => parseFloat(item.adv.price));
        return precios.reduce((a: number, b: number) => a + b, 0) / precios.length;
      }
      return null;
    } catch (error) {
      console.error(`Error en Binance (${tradeType}):`, error);
      return null;
    }
  };

  const promedioCompra = await fetchTipo("BUY");
  const promedioVenta = await fetchTipo("SELL");

  if (promedioCompra && promedioVenta) {
    return {
      compra: parseFloat(promedioCompra.toFixed(4)),
      venta: parseFloat(promedioVenta.toFixed(4)),
      promedio: parseFloat(((promedioCompra + promedioVenta) / 2).toFixed(4))
    };
  }
  return null;
}

// ---------------------------------------------------------
// 2. SCRAPER DEL BCV (Usando Proxy AllOrigins)
// ---------------------------------------------------------
async function obtenerTasasBCV() {
  // Usamos el proxy gratuito AllOrigins para que ellos lidien con el SSL roto del BCV
  const proxyUrl = "https://api.allorigins.win/raw?url=";
  const targetUrl = encodeURIComponent("https://www.bcv.org.ve");
  const url = proxyUrl + targetUrl;

  const monedas = ["dolar", "euro"]; 
  const tasas: Record<string, number | string> = {};

  try {
    // Volvemos al fetch limpio de Deno. ¡Esta conexión sí es segura!
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0"
      }
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const html = await response.text();
    
    const $ = cheerio.load(html);

    monedas.forEach((moneda) => {
      const container = $(`#${moneda}`);
      if (container.length > 0) {
        const strongTag = container.find("strong.strong-tb");
        if (strongTag.length > 0) {
          const rawValue = strongTag.text().trim().replace(",", ".");
          tasas[moneda] = parseFloat(rawValue);
        } else {
          tasas[moneda] = "Error: strong-tb no encontrado";
        }
      } else {
        tasas[moneda] = "Error: Contenedor no encontrado";
      }
    });

    return tasas;
  } catch (error) {
    console.error("Error conectando al BCV por proxy:", error);
    return null;
  }
}

// ---------------------------------------------------------
// 3. CONTROLADOR DE LA FUNCIÓN (ENDPOINT)
// ---------------------------------------------------------
Deno.serve(async (req: Request) => {
  console.log("Iniciando sincronización de tasas...");

  const [bcv, binance] = await Promise.all([
    obtenerTasasBCV(),
    obtenerTasasBinance()
  ]);

  const respuestaFinal = {
    fecha_actualizacion: new Date().toISOString(),
    fuentes: { bcv, binance }
  };

  return new Response(JSON.stringify(respuestaFinal, null, 2), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});