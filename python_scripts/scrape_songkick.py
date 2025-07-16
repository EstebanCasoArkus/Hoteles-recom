import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    import json
    import re
    from bs4 import BeautifulSoup
    from geopy.distance import geodesic
    # Selenium imports
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.wait import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.options import Options

    # Argumentos: latitud, longitud, radio_km
    if len(sys.argv) < 4:
        print(json.dumps([]))
        sys.exit(0)

    hotel_lat = float(sys.argv[1])
    hotel_lon = float(sys.argv[2])
    radius_km = float(sys.argv[3])

    BASE_URL = "https://www.songkick.com"
    URL = "https://www.songkick.com/es/metro-areas/31097-mexico-tijuana"

    # Configurar Selenium para modo headless
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--lang=es')

    # Iniciar el navegador
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(URL)

    try:
        # Esperar a que los eventos estén presentes
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "li.event-listings-element"))
        )
        html = driver.page_source
    finally:
        driver.quit()

    soup = BeautifulSoup(html, "html.parser")

    # Buscar todos los eventos
    li_events = soup.find_all("li", class_="event-listings-element")
    eventos = []

    for li in li_events:
        # Fecha
        time_tag = li.find("time")
        fecha = time_tag["datetime"] if time_tag and time_tag.has_attr("datetime") else li.get("title", "")
        # Limpiar fecha: solo los primeros 10 caracteres (YYYY-MM-DD)
        if len(fecha) > 10:
            fecha = fecha[:10]

        # Nombre del artista/evento
        strong = li.find("strong")
        nombre = strong.get_text(strip=True) if strong else ""

        # Lugar
        venue = li.find("a", class_="venue-link")
        lugar = venue.get_text(strip=True) if venue else ""

        # Enlace
        event_link = li.find("a", class_="event-link")
        enlace = BASE_URL + event_link["href"] if event_link and event_link.has_attr("href") else ""

        # Coordenadas (del JSON embebido)
        lat, lon = None, None
        microformat = li.find("div", class_="microformat")
        if microformat:
            script_tag = microformat.find("script", type="application/ld+json")
            if script_tag:
                try:
                    data = json.loads(script_tag.string)
                    if isinstance(data, list):
                        data = data[0]
                    geo = data.get("location", {}).get("geo", {})
                    lat = geo.get("latitude")
                    lon = geo.get("longitude")
                except Exception:
                    pass
        if lat is None or lon is None:
            continue

        eventos.append({
            "nombre": nombre,
            "fecha": fecha,
            "lugar": lugar,
            "enlace": enlace,
            "latitude": lat,
            "longitude": lon,
            "distance_km": None
        })

    print(json.dumps(eventos, ensure_ascii=False, indent=2))
except Exception as e:
    print("[]")
    print(f"Error en scraping: {e}", file=sys.stderr)
    sys.stderr.flush()
finally:
    sys.stdout.flush()
    sys.stderr.flush() 