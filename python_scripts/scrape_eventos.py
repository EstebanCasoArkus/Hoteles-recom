import os
import sys
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
from scrapeo_geo import EventsFetcher, get_hotel_coordinates
from pathlib import Path
import requests
import subprocess



# Cargar .env desde la raíz del proyecto
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

API_KEY = os.getenv('TICKETMASTER_API_KEY')
if not API_KEY:
    raise ValueError('Por favor, define la variable de entorno TICKETMASTER_API_KEY en tu archivo .env')

print("sys.argv:", sys.argv)

# Argumentos esperados:
#   hotel_name radio
if len(sys.argv) == 3:
    hotel_name = sys.argv[1]
    radius_km = int(sys.argv[2])
    lat, lon = get_hotel_coordinates(hotel_name)
else:
    print("Debes proporcionar los argumentos: hotel_name radio")
    sys.exit(1)

print(f"Hotel seleccionado: {hotel_name}")
print(f"Coordenadas: {lat}, {lon}")

# Parámetros fijos para Ticketmaster
DIAS = 90
LIMITE = 20
TIPO_EVENTO = "concert"

fetcher = EventsFetcher(api_key=API_KEY)

# Buscar eventos en Ticketmaster (solo conciertos)
eventos_us_raw = fetcher.get_events(
    days_ahead=DIAS,
    limit=LIMITE,
    latitude=lat,
    longitude=lon,
    radius=radius_km,
    country_code="US"
)
# Mostrar todos los eventos sin filtrar por género
eventos_us = eventos_us_raw

# Llamar a scrape_songkick.py para eventos de Songkick (Tijuana)
try:
    result = subprocess.run([
        'python', 'python_scripts/scrape_songkick.py',
        str(lat), str(lon), str(radius_km)
    ], capture_output=True, text=True, check=True, encoding='utf-8')
    eventos_mx = json.loads(result.stdout)
except Exception as e:
    print(f"Error ejecutando scrape_songkick.py: {e}")
    eventos_mx = []

print(f"\n=== EVENTOS EN MEXICO (Songkick) ===\n")
for evento in eventos_mx:
    print(f"Evento: {evento['nombre']}")
    print(f"Fecha: {evento['fecha']}")
    print(f"Lugar: {evento['lugar']}")
    print(f"URL: {evento['enlace']}")
    print("---")

print(f"\n=== EVENTOS EN ESTADOS UNIDOS (Ticketmaster) ===\n")
for evento in eventos_us:
    print(f"Evento: {evento['name']}")
    print(f"Fecha: {evento['date']}")
    print(f"Lugar: {evento['venue']}")
    print(f"Precio: {evento.get('price_range', '')}")
    print(f"URL: {evento['url']}")
    print("---")

# Guardar resultados en un archivo para el backend/UI
print(f"eventos_mx: {eventos_mx}")
print(f"eventos_us: {eventos_us}")
output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "resultados")
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "eventos_cercanos.json")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump({"mx": eventos_mx, "us": eventos_us}, f, ensure_ascii=False, indent=2)
print(f"Guardando eventos en: {output_file}")
print(f"{len(eventos_mx)} eventos en MX y {len(eventos_us)} en US guardados en {output_file}")

                        # -----SUPABASE----- #
                        # -----SUPABASE----- #
                        # -----SUPABASE----- #
                        # -----SUPABASE----- #

# Subir eventos a Supabase (MX y US) - SIEMPRE al final, aunque uno de los dos scrapings falle
def subir_a_supabase(eventos, hotel_name, supabase_url, supabase_key, pais):
    if not eventos:
        print(f"No hay eventos para subir a Supabase para {pais}.")
        return
    user_jwt = os.getenv('USER_JWT')
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {user_jwt if user_jwt else supabase_key}",
        "Content-Type": "application/json"
    }
    for event in eventos:
        if pais == 'MX':
            data = {
                "nombre": event["nombre"],
                "fecha": event["fecha"],
                "lugar": event["lugar"],
                "enlace": event["enlace"],
                "hotel_referencia": hotel_name
            }
        else:
            data = {
                "nombre": event.get("nombre") or event.get("name"),
                "fecha": event.get("fecha") or event.get("date"),
                "lugar": event.get("lugar") or event.get("venue"),
                "enlace": event.get("enlace") or event.get("url"),
                "hotel_referencia": hotel_name
            }
        try:
            print(f"Intentando guardar en Supabase: {data}")
            url = f"{supabase_url}/rest/v1/events?on_conflict=nombre,fecha"
            headers_upsert = headers.copy()
            headers_upsert["Prefer"] = "resolution=merge-duplicates"
            print(f"POST URL: {url}")
            r = requests.post(url, headers=headers_upsert, json=data)
            print(f"Status: {r.status_code}, Response: {r.text}")
            if r.status_code not in (200, 201):
                print(f" Error guardando evento en Supabase: {r.text}")
            else:
                print(f" Guardado en Supabase: {data['nombre']}")
        except Exception as e:
            print(f"Excepción al guardar en Supabase: {e}")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
if SUPABASE_URL and SUPABASE_ANON_KEY:
    print("\nGuardando eventos en Supabase...")
    user_jwt = os.getenv('USER_JWT')
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {user_jwt if user_jwt else SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    delete_resp = requests.delete(f"{SUPABASE_URL}/rest/v1/events?nombre=neq.\u0000", headers=headers)
    print(f"DELETE status: {delete_resp.status_code}, response: {delete_resp.text}")
    subir_a_supabase(eventos_mx, hotel_name, SUPABASE_URL, SUPABASE_ANON_KEY, 'MX')
    subir_a_supabase(eventos_us, hotel_name, SUPABASE_URL, SUPABASE_ANON_KEY, 'US')
else:
    print("No se encontró SUPABASE_URL o SUPABASE_ANON_KEY en el entorno.")

