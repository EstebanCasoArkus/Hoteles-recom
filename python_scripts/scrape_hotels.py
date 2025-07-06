from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup, Tag
from datetime import datetime, timedelta
import json
import time
import statistics
import sys
import io
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cargar .env desde la raíz del proyecto
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY)

def scrape_hotels():
    """Scrape hotel prices from Booking.com"""
    print("🏨 Iniciando scraping de hoteles en Tijuana...")
    
    # Configure browser
    options = Options()
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=options)

    # Date range
    hoy = datetime.today().date()
    dias_a_buscar = 15

    # Dictionary to accumulate prices per hotel
    hoteles_info = {}

    try:
        for i in range(dias_a_buscar):
            checkin = hoy + timedelta(days=i)
            checkout = checkin + timedelta(days=1)
            
            url = (
                "https://www.booking.com/searchresults.es.html?"
                f"ss=Tijuana&checkin={checkin}&checkout={checkout}&group_adults=1&no_rooms=1&group_children=0"
            )
            
            print(f"📅 Consultando hoteles para {checkin} → {checkout}")
            driver.get(url)
            
            try:
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='property-card']"))
                )
            except Exception as e:
                print(f"❌ No se pudieron cargar los hoteles para {checkin}: {e}")
                continue
            
            soup = BeautifulSoup(driver.page_source, "html.parser")
            hotels = soup.find_all("div", {"data-testid": "property-card"})
            
            hotels_found = 0
            for hotel in hotels:  # type: ignore
                try:
                    # Get hotel name
                    nombre_element = hotel.find("div", {"data-testid": "title"})  # type: ignore
                    if not nombre_element:
                        continue
                    nombre = nombre_element.get_text(strip=True)

                    # Get stars using aria-label
                    estrellas = None
                    estrellas_div = hotel.find("div", {"class": "ebc566407a"})  # type: ignore
                    if isinstance(estrellas_div, Tag) and estrellas_div.has_attr("aria-label"):
                        texto = estrellas_div.get("aria-label")
                        if isinstance(texto, str):
                            try:
                                estrellas = float(texto.split(" ")[0].replace(",", "."))
                            except Exception:
                                estrellas = None

                    # Get price
                    precio_tag = hotel.find("span", {"data-testid": "price-and-discounted-price"})  # type: ignore
                    precio_num = 0
                    if isinstance(precio_tag, Tag):
                        precio_texto = precio_tag.get_text(strip=True)  # type: ignore
                        # Extract numbers from price text
                        precio_num = int("".join(filter(str.isdigit, precio_texto)))

                    if precio_num > 0:  # Valid price
                        if nombre not in hoteles_info:
                            hoteles_info[nombre] = {
                                "Nombre del Hotel": nombre,
                                "Estrellas": estrellas,
                                "Precios": []
                            }

                        hoteles_info[nombre]["Precios"].append(precio_num)
                        hotels_found += 1

                except Exception as e:
                    print(f"⚠️ Error procesando hotel: {e}")
                    continue
            
            print(f"🏨 Procesados {hotels_found} hoteles")
            time.sleep(2.5)  # Rate limiting

    except Exception as e:
        print(f"❌ Error general durante scraping: {e}")
    finally:
        driver.quit()

    # Calculate average per hotel
    print("📊 Procesando datos de precios...")
    print("🧮 Calculando promedios por hotel...")
    
    resultado_final = []
    for hotel in hoteles_info.values():
        precios = hotel["Precios"]
        if precios:
            promedio = statistics.mean(precios)
            resultado_final.append({
                "nombre": hotel["Nombre del Hotel"],
                "estrellas": hotel["Estrellas"] if hotel["Estrellas"] is not None else 0,
                "precio_promedio": round(promedio, 2),
                "noches_contadas": len(precios)
            })

    # Save to JSON
    output_dir = "resultados"
    os.makedirs(output_dir, exist_ok=True)
    filename = os.path.join(output_dir, "hoteles_tijuana_promedios.json")
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(resultado_final, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Resultados guardados en {filename}")
        print(f"📊 Total de hoteles procesados: {len(resultado_final)}")
        
        # Print summary
        for hotel in resultado_final:
            estrellas_str = f"⭐ {hotel['estrellas']}" if hotel['estrellas'] else "⭐ N/A"
            print(f"🏨 {hotel['nombre']} — {estrellas_str} — 💰 ${hotel['precio_promedio']} MXN")
            
        # Insertar en Supabase
        if SUPABASE_URL and SUPABASE_ANON_KEY:
            print("\n🌐 Guardando resultados en Supabase...")
            headers = {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json"
            }
            
            # Usar función SQL personalizada para limpiar y reinsertar datos
            print("🧹 Limpiando y reinsertando datos con función SQL...")
            
            # Preparar datos para la función SQL
            hotel_data = []
            for hotel in resultado_final:
                hotel_data.append({
                    "nombre": hotel["nombre"],
                    "estrellas": int(hotel["estrellas"]) if hotel["estrellas"] is not None else 0,
                    "precio_promedio": hotel["precio_promedio"] if hotel["precio_promedio"] is not None else 0,
                    "noches_contadas": hotel["noches_contadas"] if hotel["noches_contadas"] is not None else 0,
                    "created_at": datetime.now().isoformat()
                })
            
            # Llamar a la función SQL personalizada
            refresh_resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/refresh_hotels",
                headers=headers,
                json={"hotel_data": hotel_data}
            )
            
            if refresh_resp.status_code == 200:
                print(f"✅ Datos actualizados correctamente con función SQL")
                print(f"🎉 {len(resultado_final)} hoteles procesados y guardados")
            else:
                print(f"⚠️ Error con función SQL: {refresh_resp.status_code} - {refresh_resp.text}")
                print("🔄 Intentando método alternativo...")
                
                # Fallback: método manual
                # Primero limpiar
                delete_resp = requests.delete(f"{SUPABASE_URL}/rest/v1/hotels?id=gte.0", headers=headers)
                if delete_resp.status_code in (200, 204):
                    print("✅ Datos anteriores eliminados")
                    
                    # Luego insertar uno por uno
                    print(f"💾 Insertando {len(resultado_final)} hoteles...")
                    for i, hotel in enumerate(resultado_final, 1):
                        data = {
                            "nombre": hotel["nombre"],
                            "estrellas": int(hotel["estrellas"]) if hotel["estrellas"] is not None else 0,
                            "precio_promedio": hotel["precio_promedio"] if hotel["precio_promedio"] is not None else 0,
                            "noches_contadas": hotel["noches_contadas"] if hotel["noches_contadas"] is not None else 0,
                            "created_at": datetime.now().isoformat()
                        }
                        
                        r = requests.post(f"{SUPABASE_URL}/rest/v1/hotels", headers=headers, json=data)
                        
                        if r.status_code in (200, 201):
                            print(f"✅ [{i}/{len(resultado_final)}] Guardado: {hotel['nombre']}")
                        else:
                            print(f"❌ [{i}/{len(resultado_final)}] Error guardando {hotel['nombre']}: {r.status_code}")
                        
                        time.sleep(0.1)
                else:
                    print(f"❌ No se pudieron eliminar datos: {delete_resp.status_code}")
            
            print(f"🎉 Proceso completado. {len(resultado_final)} hoteles guardados en Supabase.")
        else:
            print("⚠️ No se encontró SUPABASE_URL o SUPABASE_ANON_KEY en el entorno.")

    except Exception as e:
        print(f"❌ Error guardando resultados: {e}")
        sys.exit(1)

def main():
    """Main function"""
    try:
        scrape_hotels()
    except Exception as e:
        print(f"❌ Error general: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()