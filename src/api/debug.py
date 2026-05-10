import requests
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print("Consultando estructura al BCV...")
url = "https://www.bcv.org.ve"
response = requests.get(url, verify=False, timeout=15)
soup = BeautifulSoup(response.text, "html.parser")

# Vamos a inspeccionar solo el dólar para no saturar la consola
div_dolar = soup.find("div", {"id": "dolar"})

if div_dolar:
    print("\n--- ESTRUCTURA HTML ACTUAL DEL DÓLAR ---")
    print(div_dolar.prettify())
    print("----------------------------------------")
else:
    print("El BCV cambió por completo, ya ni siquiera existe el id='dolar'")