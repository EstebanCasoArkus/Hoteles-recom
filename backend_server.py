from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import subprocess
import os
import requests
from dotenv import load_dotenv
import json
import asyncio
import re
from datetime import datetime, timedelta
from supabase import create_client
from playwright.async_api import async_playwright

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration (server-side only)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")  # Debe ser la service key

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan variables SUPABASE_URL o SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/run-scrape-hotels', methods=['POST'])
def run_scrape_hotels():
    print("Petición recibida en /run-scrape-hotels")
    data = request.get_json()
    print("Después de get_json")
    user_id = data.get('user_id') if data else None
    print("Después de obtener user_id:", user_id)
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    try:
        # Ejecuta el script y pasa el user_id como argumento
        print("try")
        result = subprocess.run(
           
            ['python', 'python_scripts/scrape_hotels.py', user_id],
            capture_output=True, text=True, check=True,
            encoding='utf-8', errors='replace'
        )
        print("Antes de iniciar scraping")
        print("Después de scraping")
        return jsonify({'output': result.stdout})
    except subprocess.CalledProcessError as e:
        print("Error ejecutando el script:", e.stderr)
        return jsonify({'error': 'Error ejecutando el script', 'details': e.stderr}), 500

@app.route('/run-scrapeo-geo', methods=['POST'])
def run_scrapeo_geo():
    try:
        data = request.get_json()
        hotel_name = data.get('hotel_name', 'Grand Hotel Tijuana')
        radius = str(data.get('radius', 10))

        args = [
            'python', 'python_scripts/scrape_eventos.py',
            hotel_name, str(radius)
        ]

        print("Args to subprocess:", args)
        user_jwt = request.headers.get('x-user-jwt')
        env = os.environ.copy()
        if user_jwt:
            env['USER_JWT'] = user_jwt
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8',
            errors='replace',
            env=env
        )
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)

        return jsonify({'output': result.stdout}), 200
    except subprocess.CalledProcessError as e:
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return jsonify({'error': e.stderr}), 500

@app.route('/hoteles-tijuana-json', methods=['GET'])
def hoteles_tijuana_json():
    filename = os.path.join('resultados', 'hoteles_tijuana_promedios.json')
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = f.read()
        return app.response_class(data, mimetype='application/json')
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Fetch events from Supabase, RLS will filter by user automatically"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return jsonify({'error': 'Supabase configuration missing'}), 500

    user_jwt = request.headers.get('x-user-jwt')
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {user_jwt if user_jwt else SUPABASE_KEY}'
    }
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/events?select=*&order=created_at.desc',
            headers=headers
        )
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': f'Supabase error: {response.status_code}', 'details': response.text}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    """Fetch hotels from Supabase, RLS will filter by user automatically"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return jsonify({'error': 'Supabase configuration missing'}), 500

    user_jwt = request.headers.get('x-user-jwt')
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {user_jwt if user_jwt else SUPABASE_KEY}'
    }
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/hotels?select=*&order=created_at.desc',
            headers=headers
        )
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': f'Supabase error: {response.status_code}', 'details': response.text}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hotels', methods=['POST'])
def create_hotel():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    # Otros campos del hotel
    nombre = data.get('nombre')
    estrellas = data.get('estrellas')
    precio_promedio = data.get('precio_promedio')
    noches_contadas = data.get('noches_contadas')
    # Obtener JWT del header o del body
    user_jwt = request.headers.get('x-user-jwt') or data.get('jwt')
    # Guardar en Supabase
    response = requests.post(
        f'{SUPABASE_URL}/rest/v1/hotels',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {user_jwt if user_jwt else SUPABASE_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'nombre': nombre,
            'estrellas': estrellas,
            'precio_promedio': precio_promedio,
            'noches_contadas': noches_contadas,
            'user_id': user_id,
            'created_by': user_id

        }
    )
    return jsonify(response.json()), response.status_code

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    # Otros campos del evento
    nombre = data.get('nombre')
    fecha = data.get('fecha')
    lugar = data.get('lugar')
    # ...agrega los campos que uses...
    # Guardar en Supabase
    response = requests.post(
        f'{SUPABASE_URL}/rest/v1/events',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'nombre': nombre,
            'fecha': fecha,
            'lugar': lugar,
            'user_id': user_id
            # ...agrega los campos que uses...
        }
    )
    return jsonify(response.json()), response.status_code

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'supabase_configured': bool(SUPABASE_URL and SUPABASE_KEY)
    })

@app.route('/api/events-local', methods=['GET'])
def get_events_local():
    """Fetch events from local eventos_cercanos.json (MX + US juntos)"""
    try:
        filename = os.path.join('resultados', 'eventos_cercanos.json')
        if not os.path.exists(filename):
            return jsonify({'mx': [], 'us': []})
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except Exception:
                data = {}
        mx = data.get('mx', [])
        us = data.get('us', [])
        return jsonify({'mx': mx, 'us': us})
    except Exception as e:
        return jsonify({'mx': [], 'us': [], 'error': str(e)}), 500

async def scrape_booking_prices(hotel_name: str, locale="en-us", currency="USD"):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        today = datetime.today()
        tomorrow = today + timedelta(days=1)
        checkin = today.strftime("%Y-%m-%d")
        checkout = tomorrow.strftime("%Y-%m-%d")
        url = (
            f"https://www.booking.com/searchresults.html?lang={locale}&selected_currency={currency}"
            f"&checkin={checkin}&checkout={checkout}"
        )
        await page.goto(url)
        await page.wait_for_timeout(2000)
        await page.fill("input[name='ss']", hotel_name)
        await page.wait_for_timeout(1000)
        suggestion_selectors = [
            "li[data-testid='autocomplete-result']",
            "li[data-i='0']",
            "ul[role='listbox'] li",
            "li.sb-autocomplete__item"
        ]
        suggestions = []
        clicked = False
        for sel in suggestion_selectors:
            try:
                await page.wait_for_selector(sel, timeout=2000)
                suggestions = await page.query_selector_all(sel)
                if suggestions:
                    for s in suggestions:
                        try:
                            div_btn = await s.query_selector("div[role='button']")
                            if div_btn:
                                await page.evaluate('(el) => el.click()', div_btn)
                                clicked = True
                                break
                        except Exception:
                            continue
                    if not clicked:
                        try:
                            await page.evaluate('(el) => el.click()', suggestions[0])
                            clicked = True
                        except Exception:
                            pass
                    if clicked:
                        break
            except Exception:
                continue
        if not clicked:
            await page.wait_for_timeout(2000)
            await page.focus("input[name='ss']")
            await page.keyboard.press("Enter")
        await page.wait_for_selector("button[type='submit']", timeout=10000)
        await page.click("button[type='submit']")
        await page.wait_for_load_state("networkidle")
        popup_selectors = [
            "button[aria-label*='Dismiss']",
            ".bui-modal__close",
            "button[aria-label*='Cerrar']",
            "button[aria-label*='Close']",
            "button[aria-label*='Accept']",
            "button[aria-label*='Aceptar']",
            "button[aria-label*='Entendido']",
            "button[aria-label*='Got it']",
            "button[aria-label*='OK']",
            "button[aria-label*='Allow']",
            "button[aria-label*='Permitir']",
            "button[data-testid='cookie-banner-close-button']",
            "#onetrust-accept-btn-handler",
            ".modal-mask .modal-close",
            ".modal__close",
            ".close-button",
            ".c-modal__close"
        ]
        for _ in range(3):
            for sel in popup_selectors:
                try:
                    el = await page.query_selector(sel)
                    if el:
                        await el.click()
                        await page.wait_for_timeout(500)
                except Exception:
                    pass
        await page.wait_for_selector("a[data-testid='property-card-desktop-single-image']", timeout=10000)
        hotel_link = await page.query_selector("a[data-testid='property-card-desktop-single-image']")
        if not hotel_link:
            raise RuntimeError("No se encontró el enlace del hotel en los resultados.")
        context = page.context
        new_page_promise = context.wait_for_event("page")
        await hotel_link.click()
        try:
            new_page = await asyncio.wait_for(new_page_promise, timeout=10)
            await new_page.wait_for_load_state("networkidle")
            page_to_scrape = new_page
        except asyncio.TimeoutError:
            page_to_scrape = page
        for _ in range(3):
            for sel in popup_selectors:
                try:
                    el = await page_to_scrape.query_selector(sel)
                    if el:
                        await el.click()
                        await page_to_scrape.wait_for_timeout(500)
                except Exception:
                    pass
        try:
            await page_to_scrape.wait_for_selector("#hprt-table", timeout=30000, state='visible')
        except Exception:
            print("No se encontró la tabla de habitaciones")
            html = await page_to_scrape.content()
            print(html[:2000])
            await browser.close()
            return []
        results = []
        base_url = page_to_scrape.url
        for offset in range(0, 3):
            checkin = (today + timedelta(days=offset)).strftime("%Y-%m-%d")
            checkout = (today + timedelta(days=offset+1)).strftime("%Y-%m-%d")
            new_url = re.sub(r"checkin=\d{4}-\d{2}-\d{2}", f"checkin={checkin}", base_url)
            new_url = re.sub(r"checkout=\d{4}-\d{2}-\d{2}", f"checkout={checkout}", new_url)
            await page_to_scrape.goto(new_url)
            await asyncio.sleep(2)
            try:
                await page_to_scrape.wait_for_selector("#hprt-table", timeout=20000, state='visible')
            except Exception:
                print(f"No se encontró la tabla de habitaciones para {checkin}")
                continue
            rows = await page_to_scrape.query_selector_all("#hprt-table tr")
            day_rooms = []
            for row in rows:
                try:
                    room_type_el = await row.query_selector("th span.hprt-roomtype-icon-link")
                    price_el = None
                    tds = await row.query_selector_all("td")
                    for td in tds:
                        price_candidate = await td.query_selector("span.prco-valign-middle-helper")
                        if price_candidate:
                            price_el = price_candidate
                            break
                    if room_type_el and price_el:
                        room_text = (await room_type_el.inner_text()).strip()
                        price_text = (await price_el.inner_text()).strip()
                        day_rooms.append({"room_type": room_text, "price": price_text})
                except Exception:
                    continue
            results.append({"date": checkin, "rooms": day_rooms})
        await browser.close()
        return results

async def insert_user_hotel_prices(user_id: str, hotel_name: str, results: list):
    for day in results:
        checkin_date = day["date"]
        for room in day["rooms"]:
            r = supabase.table("hotel_usuario").insert({
                "user_id": user_id,
                "hotel_name": hotel_name,
                "scrape_date": datetime.today().strftime("%Y-%m-%d"),
                "checkin_date": checkin_date,
                "room_type": room["room_type"],
                "price": room["price"]
            }).execute()
            print("Insert response:", r)

async def main_scrape(user_id: str, hotel_name: str):
    prices = await scrape_booking_prices(hotel_name)
    print("Precios:", prices)
    await insert_user_hotel_prices(user_id, hotel_name, prices)
    print("¡Listo!")

@app.route('/run-scrape-hotel-propio', methods=['POST'])
def run_scrape_hotel_propio():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        hotel_name = data.get('hotel_name')
        jwt = data.get('jwt', '')  # <-- Nuevo: lee el JWT del body
        if not user_id or not hotel_name:
            return {'status': 'error', 'message': 'user_id y hotel_name requeridos'}, 400
        args = [
            'python', 'python_scripts/hotel_propio.py',
            user_id, hotel_name
        ]
        if jwt:
            args += ['--jwt', jwt]  # <-- Nuevo: agrega el JWT si existe
        print('Args to subprocess:', args)
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8',
            errors='replace'
        )
        print('STDOUT:', result.stdout)
        print('STDERR:', result.stderr)
        return jsonify({'output': result.stdout}), 200
    except subprocess.CalledProcessError as e:
        print('STDOUT:', e.stdout)
        print('STDERR:', e.stderr)
        return jsonify({'error': e.stderr}), 500
    except Exception as ex:
        print('General Exception:', ex)
        return jsonify({'error': str(ex)}), 500

if __name__ == '__main__':
    app.run(port=5000) 