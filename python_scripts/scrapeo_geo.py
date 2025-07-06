import json
import requests
from geopy.distance import geodesic
import time
import sys
import io
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar .env desde la raíz del proyecto
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_user_location():
    """Get user location from command line arguments or use default"""
    if len(sys.argv) > 1:
        try:
            lat, lon = map(float, sys.argv[1].split(','))
            return (lat, lon)
        except:
            print("⚠️ Formato de coordenadas inválido, usando ubicación por defecto")
    
    # Default location (Tijuana)
    return (32.5149, -117.0382)

def get_hotel_coordinates(hotel_name):
    """Get coordinates for a specific hotel"""
    try:
        # Importar desde el archivo de configuración
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from hotel_coordinates import get_hotel_coordinates as get_coords
        return get_coords(hotel_name)
    except ImportError:
        # Fallback si no se puede importar el archivo de configuración
        hotels = {
            "Grand Hotel Tijuana": (32.5149, -117.0382),
            "Hotel Real del Río": (32.5283, -117.0187),
            "Hotel Pueblo Amigo": (32.5208, -117.0278),
            "Hotel Ticuan": (32.5234, -117.0312),
            "Hotel Lucerna": (32.5267, -117.0256),
            "Hotel Fiesta Inn": (32.5212, -117.0298),
            "Hotel Marriott": (32.5245, -117.0334),
            "Hotel Holiday Inn": (32.5198, -117.0267),
            "Hotel Best Western": (32.5221, -117.0289),
            "Hotel Comfort Inn": (32.5256, -117.0321),
        }
        return hotels.get(hotel_name, (32.5149, -117.0382))  # Default to Tijuana if hotel not found

def geocode_nominatim(address, cache):
    """Geocode address using Nominatim API"""
    if address in cache:
        return cache[address]

    query = f"{address}, Tijuana, Baja California, México"
    url = 'https://nominatim.openstreetmap.org/search'
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'mx'
    }
    headers = {
        'User-Agent': 'HotelManagementPlatform/1.0'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            results = response.json()
            if results:
                coords = (float(results[0]['lat']), float(results[0]['lon']))
                cache[address] = coords
                return coords
    except Exception as e:
        print(f"❌ Error geocodificando {address}: {e}")

    cache[address] = None
    return None

def scrape_eventos():
    """Scrape events from Eventbrite"""
    print("🌐 Conectando a Eventbrite...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
    
    service = Service()
    driver = webdriver.Chrome(service=service, options=chrome_options)

    url = "https://www.eventbrite.com/d/mexico--tijuana/events/?q=musica"
    driver.get(url)
    time.sleep(5)

    nuevos_eventos = []
    page_count = 0
    max_pages = 5  # Limit to avoid infinite loops

    while page_count < max_pages:
        try:
            events = driver.find_elements(By.CSS_SELECTOR, 'div[data-testid="search-event"]')
            
            if not events:
                print("❌ No se encontraron eventos en esta página")
                break
            
            print(f"🎫 Encontrados {len(events)} eventos en la página {page_count + 1}")

            for ev in events:
                try:
                    # Get event name
                    try:
                        enlace_tag = ev.find_element(By.CSS_SELECTOR, 'a.event-card-link')
                        raw_label = enlace_tag.get_attribute('aria-label') or ""
                        nombre = raw_label[5:].strip() if raw_label.lower().startswith("view ") else enlace_tag.text.strip()
                    except NoSuchElementException:
                        nombre = "Sin nombre"

                    # Get event link
                    try:
                        enlace = enlace_tag.get_attribute("href")
                    except:
                        enlace = "Sin enlace"

                    fecha = "Sin fecha"
                    lugar = "Sin lugar"

                    # Get date and location
                    try:
                        p_tags = ev.find_elements(By.CSS_SELECTOR, 'p.event-card__clamp-line--one')
                        for p in p_tags:
                            text = p.text.strip()
                            if any(char.isdigit() for char in text):
                                fecha = text
                            else:
                                lugar = text
                    except NoSuchElementException:
                        pass

                    if nombre != "Sin nombre":
                        nuevos_eventos.append({
                            'nombre': nombre, 
                            'fecha': fecha, 
                            'lugar': lugar, 
                            'enlace': enlace
                        })

                except Exception as e:
                    print(f"⚠️ Error procesando evento: {e}")
                    continue

            # Try to go to next page
            try:
                next_button = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'button[data-testid="page-next"]'))
                )
                aria_disabled = next_button.get_attribute("aria-disabled")
                if aria_disabled == "false":
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
                    time.sleep(0.5)
                    driver.execute_script("arguments[0].click();", next_button)
                    time.sleep(5)
                    page_count += 1
                else:
                    print("✅ No hay más páginas disponibles")
                    break
            except Exception as e:
                print(f"✅ Fin de paginación: {e}")
                break

        except Exception as e:
            print(f"❌ Error en página {page_count + 1}: {e}")
            break

    driver.quit()
    
    print(f"✅ Scrapeo finalizado. Total de eventos encontrados: {len(nuevos_eventos)}")
    return nuevos_eventos

def filtrar_eventos_cercanos(events, user_location):
    """Filter events by proximity to user location"""
    print("📍 Filtrando eventos cercanos a tu ubicación...")
    print(f"📍 Ubicación del usuario: {user_location}")

    lugares_unicos = set(event['lugar'] for event in events if event.get('lugar') and event['lugar'] != 'Sin lugar')
    print(f"🗺️ Encontrados {len(lugares_unicos)} lugares únicos para geocodificar")

    # Load geocoding cache
    coords_por_lugar = {}
    cache_file = '/tmp/geocode_cache.json'
    
    try:
        if os.path.exists(cache_file) and os.path.getsize(cache_file) > 0:
            with open(cache_file, 'r', encoding='utf-8') as f:
                coords_por_lugar = json.load(f)
            print(f"📋 Cache cargado con {len(coords_por_lugar)} ubicaciones")
        else:
            print("📋 Creando nuevo cache de geocodificación")
    except json.JSONDecodeError:
        print("⚠️ Cache corrupto, creando nuevo")
        coords_por_lugar = {}

    # Geocode unique locations
    for lugar in lugares_unicos:
        if lugar not in coords_por_lugar:
            print(f"🔍 Geocodificando: {lugar}")
            coords = geocode_nominatim(lugar, coords_por_lugar)
            time.sleep(1)  # Rate limiting
        else:
            print(f"📋 Usando cache para: {lugar}")

    # Save updated cache
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(coords_por_lugar, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Error guardando cache: {e}")

    # Filter nearby events
    nearby_events = []
    for event in events:
        lugar = event.get('lugar')
        coords = coords_por_lugar.get(lugar)
        
        if coords:
            try:
                distancia = geodesic(user_location, coords).km
                print(f"📏 {event['nombre']} está a {distancia:.2f} km")
                
                if distancia <= 20:  # Within 20km
                    event_with_coords = event.copy()
                    event_with_coords['latitude'] = coords[0]
                    event_with_coords['longitude'] = coords[1]
                    event_with_coords['distance_km'] = round(distancia, 2)
                    nearby_events.append(event_with_coords)
            except Exception as e:
                print(f"❌ Error calculando distancia para {lugar}: {e}")
        else:
            print(f"❌ No se pudo geocodificar: {lugar}")

    return nearby_events

def main():
    """Main function"""
    try:
        # Get hotel name from command line arguments
        hotel_name = "Grand Hotel Tijuana"  # Default hotel
        if len(sys.argv) > 2:
            hotel_name = sys.argv[2]
        
        # Get coordinates for the selected hotel
        user_location = get_hotel_coordinates(hotel_name)
        print(f"🏨 Hotel seleccionado: {hotel_name}")
        print(f"📍 Coordenadas del hotel: {user_location}")
        
        # Scrape events
        print("🔍 Iniciando scraping de eventos...")
        events = scrape_eventos()
        
        if not events:
            print("❌ No se encontraron eventos")
            return
        
        # Filter nearby events
        nearby_events = filtrar_eventos_cercanos(events, user_location)
        
        # Save results
        output_dir = "resultados"
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, "eventos_cercanos.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(nearby_events, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {len(nearby_events)} eventos cercanos guardados en {output_file}")
        
        # Guardar en Supabase
        if SUPABASE_URL and SUPABASE_ANON_KEY:
            print("\n🌐 Guardando eventos en Supabase...")
            headers = {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json"
            }
            # Borra todos los datos anteriores
            delete_resp = requests.delete(f"{SUPABASE_URL}/rest/v1/events?nombre=neq.\u0000", headers=headers)
            print(f"DELETE status: {delete_resp.status_code}, response: {delete_resp.text}")
            for event in nearby_events:
                data = {
                    "nombre": event["nombre"],
                    "fecha": event["fecha"],
                    "lugar": event["lugar"],
                    "enlace": event["enlace"],
                    "latitude": event.get("latitude", None),
                    "longitude": event.get("longitude", None),
                    "distance_km": event.get("distance_km", None),
                    "hotel_referencia": hotel_name
                }
                r = requests.post(f"{SUPABASE_URL}/rest/v1/events", headers=headers, json=data)
                print(f"Enviando: {data}")
                print(f"Status: {r.status_code}, Response: {r.text}")
                if r.status_code not in (200, 201):
                    print(f"❌ Error guardando evento en Supabase: {r.text}")
                else:
                    print(f"✅ Guardado en Supabase: {event['nombre']}")
        else:
            print("⚠️ No se encontró SUPABASE_URL o SUPABASE_ANON_KEY en el entorno.")
        
        # Print summary
        for event in nearby_events:
            print(f"🎫 {event['nombre']} - {event.get('distance_km', 'N/A')} km")
            
    except Exception as e:
        print(f"❌ Error general: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()