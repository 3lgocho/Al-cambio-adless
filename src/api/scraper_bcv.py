import requests
from bs4 import BeautifulSoup
import urllib3

# Suprimimos la advertencia de conexión insegura
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def obtener_todas_las_tasas_bcv():
    url = "https://www.bcv.org.ve"
    monedas_a_buscar = ["dolar", "euro", "yuan", "lira", "rublo"]
    tasas = {}

    print(f"Conectando a {url} ...\n")
    
    try:
        response = requests.get(url, verify=False, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        for moneda in monedas_a_buscar:
            div_container = soup.find("div", {"id": moneda})
            
            if div_container:
                # ---> AQUÍ ESTÁ LA MAGIA <---
                # Ahora buscamos directamente la etiqueta <strong> donde está el precio
                valor_strong = div_container.find("strong", {"class": "strong-tb"})
                
                if valor_strong:
                    raw_value = valor_strong.get_text(strip=True)
                    try:
                        # Convertimos la coma en punto
                        rate = float(raw_value.replace(",", "."))
                        tasas[moneda.capitalize()] = rate
                    except ValueError:
                        tasas[moneda.capitalize()] = f"Error al formatear: {raw_value}"
                else:
                    tasas[moneda.capitalize()] = "Etiqueta strong no encontrada"
            else:
                tasas[moneda.capitalize()] = "Contenedor no encontrado"
                
        return tasas

    except requests.RequestException as e:
        print(f"Error de red conectando al BCV: {e}")
        return None

if __name__ == "__main__":
    resultados = obtener_todas_las_tasas_bcv()
    
    if resultados:
        print("--- PRECIOS BCV ENCONTRADOS ---")
        for moneda, precio in resultados.items():
            print(f"{moneda}: {precio} Bs")
        print("-------------------------------")
    else:
        print("No se pudo extraer la información del BCV.")