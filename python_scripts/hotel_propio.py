import asyncio
import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client, AsyncClient
from playwright.async_api import async_playwright
import uuid
import random
import requests



load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan variables SUPABASE_URL o SUPABASE_KEY")

# Usar cliente asíncrono
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
async_supabase = AsyncClient(SUPABASE_URL, SUPABASE_KEY)

def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

async def popup_closer(page, popup_selectors, interval=2):
    while True:
        for sel in popup_selectors:
            try:
                el = await page.query_selector(sel)
                if el:
                    await el.click()
                    await page.wait_for_timeout(300)
            except Exception:
                pass
        await asyncio.sleep(interval)

USER_AGENTS = [
    # Chrome Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    # Chrome Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    # Firefox Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    # Edge Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    # Chrome Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    # Safari Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
]

def get_random_user_agent():
    return random.choice(USER_AGENTS)

async def scrape_booking_prices(hotel_name: str, locale="en-us", currency="USD", headless_mode="new"):
    user_agent = get_random_user_agent()
    # Convierte headless_mode a bool si es string
    if isinstance(headless_mode, str):
        if headless_mode.lower() == "false":
            headless = False
        else:
            headless = True  # "true" o "new" o cualquier otro string
    else:
        headless = headless_mode
    # Elimina el try sin except/finally
    # try:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        page = await browser.new_page()
        # Universal: set user-agent via extra headers
        await page.set_extra_http_headers({"user-agent": user_agent})

        # Calcular fechas: hoy y mañana
        today = datetime.today()
        tomorrow = today + timedelta(days=1)
        checkin = today.strftime("%Y-%m-%d")
        checkout = tomorrow.strftime("%Y-%m-%d")

        # Construir URL con fechas y configuración
        url = (
            f"https://www.booking.com/searchresults.html?lang={locale}&selected_currency={currency}"
            f"&checkin={checkin}&checkout={checkout}"
        )
        await page.goto(url)
        await page.wait_for_timeout(10000)

        # Escribir el nombre del hotel y seleccionar el primer resultado sugerido
        await page.fill("input[name='ss']", hotel_name)
        await page.wait_for_timeout(10000)  # Esperar 1 segundo para que aparezcan sugerencias
        # Probar varios selectores de sugerencias
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
                    # Intentar click en el div[role='button'] hijo usando JS
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
            # Si no hay sugerencias, esperar 2 segundos y enviar Enter al input para forzar la búsqueda
            await page.wait_for_timeout(10000)
            await page.focus("input[name='ss']")
            await page.keyboard.press("Enter")
        # Presionar el botón de búsqueda
        # --- NUEVO: Cierra popups y overlays antes de hacer click en el botón de submit ---
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
        for sel in popup_selectors:
            try:
                el = await page.query_selector(sel)
                if el:
                    await el.click()
                    await page.wait_for_timeout(300)
            except Exception:
                pass
        await page.wait_for_selector("button[type='submit']", timeout=10000)
        # Haz scroll al botón
        try:
            await page.eval_on_selector("button[type='submit']", "el => el.scrollIntoView()")
        except Exception:
            pass
        # Intenta click normal, si falla, click JS
        try:
            await page.click("button[type='submit']")
        except Exception as e:
            print("[WARN] Click normal falló, intentando click JS", e)
            try:
                await page.evaluate('document.querySelector("button[type=\\\'submit\\\']").click()')
            except Exception as e2:
                print("[ERROR] Click JS también falló", e2)

        # Cerrar pop-ups extra en la segunda pantalla
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
        # Lanzar tarea de cierre de popups en background
        popup_task = asyncio.create_task(popup_closer(page, popup_selectors, interval=2))

        # Esperar el primer card y hacer clic en la imagen/enlace del hotel
        await page.wait_for_selector("a[data-testid='property-card-desktop-single-image']", timeout=10000)
        hotel_link = await page.query_selector("a[data-testid='property-card-desktop-single-image']")
        if not hotel_link:
            popup_task.cancel()
            raise RuntimeError("No se encontró el enlace del hotel en los resultados.")

        # Justo antes de hacer clic en el enlace del hotel:
        context = page.context

        # Prepara para capturar la nueva página
        new_page_promise = context.wait_for_event("page")

        await hotel_link.click()

        # Espera la nueva página (pestaña)
        try:
            new_page = await asyncio.wait_for(new_page_promise, timeout=10)
            await new_page.wait_for_load_state("networkidle")
            page_to_scrape = new_page
        except asyncio.TimeoutError:
            # Si no se abre nueva pestaña, sigue en la misma
            page_to_scrape = page

        # Lanzar tarea de cierre de popups en la página del hotel
        hotel_popup_task = asyncio.create_task(popup_closer(page_to_scrape, popup_selectors, interval=2))

        # Esperar a que la tabla de habitaciones esté presente y visible
        try:
            await page_to_scrape.wait_for_selector("#hprt-table", timeout=30000, state='visible')
        except Exception:
            print("No se encontró la tabla de habitaciones")
            html = await page_to_scrape.content()
            print(html[:2000])
            await browser.close()
            popup_task.cancel()
            hotel_popup_task.cancel()
            return []

        # --- NUEVO: Scraping para los próximos 30 días, agrupado por día ---
        results = []
        base_url = page_to_scrape.url  # URL de la página de detalle del hotel
        for offset in range(0, 30):
            checkin = (today + timedelta(days=offset)).strftime("%Y-%m-%d")
            checkout = (today + timedelta(days=offset+1)).strftime("%Y-%m-%d")
            # Modifica la URL con las nuevas fechas
            new_url = re.sub(r"checkin=\d{4}-\d{2}-\d{2}", f"checkin={checkin}", base_url)
            new_url = re.sub(r"checkout=\d{4}-\d{2}-\d{2}", f"checkout={checkout}", new_url)
            await page_to_scrape.goto(new_url)
            await asyncio.sleep(2) # Espera entre fechas
            try:
                await page_to_scrape.wait_for_selector("#hprt-table", timeout=20000, state='visible')
            except Exception:
                print(f"No se encontró la tabla de habitaciones para {checkin}")
                html = await page_to_scrape.content()
                print(f"[HTML para {checkin}]:\n" + html[:2000])
                continue
            rows = await page_to_scrape.query_selector_all("#hprt-table tr")
            day_rooms = []
            for row in rows:
                try:
                    
                    room_type_el = await row.query_selector("th span.hprt-roomtype-icon-link")
                    price_el = None
                    tds = await row.query_selector_all("td")
                    for td in tds:
                        price_candidate = await td.query_selector("span.js-average-per-night-price")
                        if not price_candidate:
                            price_candidate = await td.query_selector("span.prc-no-css")
                        if price_candidate:
                            price_el = price_candidate
                            break
                    if room_type_el and price_el:
                        room_text = (await room_type_el.inner_text()).strip()
                        price_text = (await price_el.inner_text()).strip()
                        day_rooms.append({"room_type": room_text, "price": price_text})
                except Exception:
                    continue
            if not day_rooms:
                # Si no se encontraron cuartos, imprime el HTML de la tabla
                table = await page_to_scrape.query_selector("#hprt-table")
                if table:
                    table_html = await table.inner_html()
                    print(f"[Tabla vacía para {checkin}]:\n" + table_html[:2000])
                else:
                    print(f"[No se encontró el selector #hprt-table para {checkin}]")
            results.append({"date": checkin, "rooms": day_rooms})
        await browser.close()
        popup_task.cancel()
        hotel_popup_task.cancel()
        return results
   
                        # -----SUPABASE----- #
                        # -----SUPABASE----- #
                        # -----SUPABASE----- #
                        # -----SUPABASE----- #

async def insert_user_hotel_prices(user_id: str, hotel_name: str, results: list, jwt: str = ""): 
    user_id = user_id.strip()
    if not is_valid_uuid(user_id):
        print("ERROR: user_id no es un UUID válido:", user_id)
        return
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
    url = f"{SUPABASE_URL}/rest/v1/hotel_usuario?on_conflict=user_id,hotel_name,checkin_date,room_type"
    token = jwt if jwt else SUPABASE_KEY
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    for day in results:
        checkin_date = day["date"]
        for room in day["rooms"]:
            data = {
                "user_id": user_id,
                "hotel_name": hotel_name,
                "scrape_date": datetime.today().strftime("%Y-%m-%d"),
                "checkin_date": checkin_date,
                "room_type": room["room_type"],
                "price": room["price"]
            }
            try:
                r = requests.post(url, headers=headers, json=data)
                print(f"Status: {r.status_code}, Response: {r.text}")
            except Exception as e:
                print("Error upserting:", data)
                print("Exception:", e)

async def main(user_id: str, hotel_name: str, headless_mode="new", jwt: str = ""):
    prices = await scrape_booking_prices(hotel_name, headless_mode=headless_mode)
    print("Precios:", prices)
    await insert_user_hotel_prices(user_id, hotel_name, prices, jwt=jwt)
    print("¡Listo!")

# --- Bloque para ejecución directa por CLI ---
if __name__ == "__main__":
    import sys
    user_id = None
    hotel_name = None
    headless_mode = "new"
    jwt = ""
    args = sys.argv[1:]
    if len(args) >= 2:
        user_id = args[0]
        hotel_name = args[1]
        # Buscar headless_mode y jwt en los argumentos
        for i, arg in enumerate(args[2:]):
            if arg == "--headless" and i+3 < len(args):
                headless_mode = args[i+3]
            if arg == "--jwt" and i+3 < len(args):
                jwt = args[i+3]
        asyncio.run(main(user_id, hotel_name, headless_mode, jwt))
    else:
        print("Modo API: ejecuta con 'uvicorn hotel_propio:app --reload'")
        print("Modo CLI: python hotel_propio.py <user_id> <hotel_name> [--headless <true|false|new>] [--jwt <token>]")
