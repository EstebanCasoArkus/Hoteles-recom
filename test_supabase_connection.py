#!/usr/bin/env python3
"""
Script de diagnóstico para verificar conexión a Supabase y funciones SQL
"""

import os
import requests
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Cargar .env desde la raíz del proyecto
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print("🔧 Diagnóstico de Supabase")
print("=" * 50)
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_ANON_KEY: {'***' + SUPABASE_ANON_KEY[-4:] if SUPABASE_ANON_KEY else 'No encontrada'}")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ Variables de entorno no configuradas")
    print("📝 Crea un archivo .env con:")
    print("SUPABASE_URL=tu_url_de_supabase")
    print("SUPABASE_ANON_KEY=tu_clave_anonima")
    exit(1)

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

def test_basic_connection():
    """Probar conexión básica a Supabase"""
    print("\n🔌 Probando conexión básica...")
    try:
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Conexión exitosa")
            return True
        else:
            print(f"❌ Error de conexión: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_table_exists():
    """Verificar si la tabla hotels existe"""
    print("\n📋 Verificando tabla hotels...")
    try:
        response = requests.get(f"{SUPABASE_URL}/rest/v1/hotels?select=count", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Tabla hotels existe")
            return True
        else:
            print(f"❌ Error accediendo a tabla: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_sql_functions():
    """Probar las funciones SQL personalizadas"""
    print("\n⚙️ Probando funciones SQL...")
    
    # Probar función truncate_hotels
    print("  - Probando truncate_hotels...")
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/truncate_hotels",
            headers=headers,
            json={}
        )
        print(f"    Status: {response.status_code}")
        if response.status_code == 200:
            print("    ✅ Función truncate_hotels funciona")
        else:
            print(f"    ❌ Error: {response.text}")
    except Exception as e:
        print(f"    ❌ Error: {e}")
    
    # Probar función get_hotel_stats
    print("  - Probando get_hotel_stats...")
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/get_hotel_stats",
            headers=headers,
            json={}
        )
        print(f"    Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"    ✅ Función get_hotel_stats funciona: {stats}")
        else:
            print(f"    ❌ Error: {response.text}")
    except Exception as e:
        print(f"    ❌ Error: {e}")

def test_refresh_function():
    """Probar la función refresh_hotels con datos de prueba"""
    print("\n🔄 Probando función refresh_hotels...")
    
    # Datos de prueba
    test_data = [
        {
            "nombre": "Hotel de Prueba 1",
            "estrellas": 4,
            "precio_promedio": 1500.0,
            "noches_contadas": 30,
            "created_at": datetime.now().isoformat()
        },
        {
            "nombre": "Hotel de Prueba 2", 
            "estrellas": 3,
            "precio_promedio": 1200.0,
            "noches_contadas": 25,
            "created_at": datetime.now().isoformat()
        }
    ]
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/refresh_hotels",
            headers=headers,
            json={"hotel_data": test_data}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Función refresh_hotels funciona")
            
            # Verificar que los datos se insertaron
            verify_response = requests.get(f"{SUPABASE_URL}/rest/v1/hotels", headers=headers)
            if verify_response.status_code == 200:
                hotels = verify_response.json()
                print(f"✅ Datos verificados: {len(hotels)} hoteles en la base de datos")
                for hotel in hotels:
                    print(f"  - {hotel['nombre']}: ${hotel['precio_promedio']}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_manual_insert():
    """Probar inserción manual de datos"""
    print("\n📝 Probando inserción manual...")
    
    test_hotel = {
        "nombre": "Hotel Manual Test",
        "estrellas": 5,
        "precio_promedio": 2000.0,
        "noches_contadas": 15,
        "created_at": datetime.now().isoformat()
    }
    
    try:
        # Primero limpiar
        delete_response = requests.delete(f"{SUPABASE_URL}/rest/v1/hotels?id=gte.0", headers=headers)
        print(f"Delete Status: {delete_response.status_code}")
        
        # Luego insertar
        insert_response = requests.post(
            f"{SUPABASE_URL}/rest/v1/hotels",
            headers=headers,
            json=test_hotel
        )
        print(f"Insert Status: {insert_response.status_code}")
        
        if insert_response.status_code in (200, 201):
            print("✅ Inserción manual funciona")
            return True
        else:
            print(f"❌ Error en inserción: {insert_response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 Iniciando diagnóstico completo...")
    
    # Pruebas básicas
    if not test_basic_connection():
        print("❌ No se puede continuar sin conexión básica")
        return
    
    if not test_table_exists():
        print("❌ No se puede continuar sin la tabla hotels")
        return
    
    # Pruebas de funciones SQL
    test_sql_functions()
    
    # Pruebas de inserción
    print("\n" + "=" * 50)
    print("📊 Resumen de pruebas:")
    
    # Probar función refresh_hotels
    refresh_works = test_refresh_function()
    
    # Probar inserción manual como fallback
    manual_works = test_manual_insert()
    
    print("\n🎯 Recomendaciones:")
    if refresh_works:
        print("✅ La función SQL refresh_hotels funciona correctamente")
        print("   El script de scraping debería funcionar sin problemas")
    elif manual_works:
        print("⚠️ La función SQL no funciona, pero la inserción manual sí")
        print("   El script usará el método alternativo (más lento pero funcional)")
    else:
        print("❌ Ningún método de inserción funciona")
        print("   Verifica los permisos de la API key en Supabase")

if __name__ == "__main__":
    main() 