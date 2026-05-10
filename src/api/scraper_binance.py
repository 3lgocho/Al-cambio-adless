import requests
from statistics import mean

def obtener_precio_binance(fiat="VES", asset="USDT", trade_type="BUY", rows=5):
    url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    payload = {
        "fiat": fiat,
        "page": 1,
        "rows": rows,
        "tradeType": trade_type,
        "asset": asset,
        "payTypes": [],
        "publisherType": None
    }
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("code") == "000000" and data.get("data"):
            precios = [float(anuncio["adv"]["price"]) for anuncio in data["data"]]
            return mean(precios) if precios else None
    except Exception as e:
        print(f"Error: {e}")
    return None

if __name__ == "__main__":
    print("Consultando el mercado P2P de Binance...\n")
    
    # 1. Obtenemos el promedio de Compra (Top 5)
    promedio_compra = obtener_precio_binance(trade_type="BUY", rows=5)
    
    # 2. Obtenemos el promedio de Venta (Top 5)
    promedio_venta = obtener_precio_binance(trade_type="SELL", rows=5)
    
    if promedio_compra and promedio_venta:
        # 3. Calculamos la Tasa Media del Mercado
        tasa_media = (promedio_compra + promedio_venta) / 2
        
        print("--- COTIZACIÓN BINANCE P2P ---")
        print(f"🟢 Compra (Para adquirir USDT) : {promedio_compra:.2f} Bs")
        print(f"🔴 Venta  (Para cambiar a Bs)  : {promedio_venta:.2f} Bs")
        print("------------------------------")
        print(f"⭐ DÓLAR PROMEDIO (Mid-Market): {tasa_media:.2f} Bs")
    else:
        print("No se pudo obtener la información completa.")