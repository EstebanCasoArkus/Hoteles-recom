#!/usr/bin/env python3
"""
Script de diagnóstico para problemas de scraping
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Verificar versión de Python"""
    print(f"🐍 Python version: {sys.version}")
    if sys.version_info < (3, 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        return False
    print("✅ Python version OK")
    return True

def check_chrome_installation():
    """Verificar instalación de Chrome"""
    system = platform.system().lower()
    
    chrome_paths = {
        'windows': [
            r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        ],
        'darwin': [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ],
        'linux': [
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
        ]
    }
    
    paths = chrome_paths.get(system, [])
    
    for path in paths:
        if os.path.exists(path):
            print(f"✅ Chrome encontrado en: {path}")
            return True
    
    print("❌ Chrome no encontrado en las ubicaciones típicas")
    print("📥 Descarga Chrome desde: https://www.google.com/chrome/")
    return False

def check_chromedriver():
    """Verificar ChromeDriver"""
    try:
        # Intentar importar webdriver
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        print("✅ Selenium instalado correctamente")
        
        # Verificar si ChromeDriver está en PATH
        try:
            options = Options()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=options)
            driver.quit()
            print("✅ ChromeDriver funciona correctamente")
            return True
        except Exception as e:
            print(f"❌ Error con ChromeDriver: {e}")
            print("📥 Descarga ChromeDriver desde: https://chromedriver.chromium.org/")
            print("💡 Asegúrate de que esté en tu PATH o en el directorio del proyecto")
            return False
            
    except ImportError:
        print("❌ Selenium no está instalado")
        print("📦 Instala con: pip install selenium")
        return False

def check_network_connectivity():
    """Verificar conectividad de red"""
    import requests
    
    try:
        # Probar conexión a Booking.com
        response = requests.get("https://www.booking.com", timeout=10)
        if response.status_code == 200:
            print("✅ Conexión a Booking.com OK")
            return True
        else:
            print(f"⚠️ Booking.com responde con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando a Booking.com: {e}")
        return False

def check_script_file():
    """Verificar que el script de scraping existe"""
    script_path = Path("python_scripts/scrape_hotels.py")
    
    if script_path.exists():
        print(f"✅ Script de scraping encontrado: {script_path}")
        return True
    else:
        print(f"❌ Script de scraping no encontrado: {script_path}")
        return False

def test_scraping_script():
    """Probar el script de scraping con timeout"""
    print("\n🧪 Probando script de scraping (timeout: 30 segundos)...")
    
    try:
        # Ejecutar script con timeout
        result = subprocess.run(
            [sys.executable, "python_scripts/scrape_hotels.py"],
            timeout=30,
            capture_output=True,
            text=True
        )
        
        print(f"📋 Return code: {result.returncode}")
        print(f"📤 STDOUT: {result.stdout[:500]}...")  # Primeros 500 caracteres
        print(f"📥 STDERR: {result.stderr[:500]}...")  # Primeros 500 caracteres
        
        if result.returncode == 0:
            print("✅ Script de scraping funciona correctamente")
            return True
        else:
            print("❌ Script de scraping falló")
            return False
            
    except subprocess.TimeoutExpired:
        print("⏰ Script de scraping timeout (30 segundos)")
        print("💡 Esto es normal para el primer intento")
        return True
    except Exception as e:
        print(f"❌ Error ejecutando script: {e}")
        return False

def main():
    """Función principal de diagnóstico"""
    print("🔍 Diagnóstico de problemas de scraping\n")
    
    checks = [
        ("Versión de Python", check_python_version),
        ("Instalación de Chrome", check_chrome_installation),
        ("ChromeDriver", check_chromedriver),
        ("Conectividad de red", check_network_connectivity),
        ("Archivo de script", check_script_file),
    ]
    
    all_ok = True
    for check_name, check_func in checks:
        print(f"\n🔍 Verificando {check_name}...")
        if not check_func():
            all_ok = False
    
    if all_ok:
        print("\n✅ Todas las verificaciones básicas pasaron")
        print("🧪 Ejecutando prueba del script...")
        test_scraping_script()
    else:
        print("\n❌ Algunas verificaciones fallaron")
        print("📖 Revisa los errores arriba y soluciona los problemas")
    
    print("\n💡 Consejos adicionales:")
    print("- Asegúrate de que Chrome esté actualizado")
    print("- Descarga ChromeDriver compatible con tu versión de Chrome")
    print("- Verifica que no haya firewall bloqueando las conexiones")
    print("- El scraping puede tomar varios minutos en completarse")

if __name__ == '__main__':
    main() 