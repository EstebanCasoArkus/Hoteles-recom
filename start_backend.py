#!/usr/bin/env python3
"""
Script de inicio para el backend del Hotel Dashboard
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Verificar versión de Python"""
    if sys.version_info < (3, 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} - OK")
    return True

def check_dependencies():
    """Verificar dependencias instaladas"""
    required_packages = [
        'flask',
        'flask_cors', 
        'requests',
        'python_dotenv',
        'selenium',
        'beautifulsoup4'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} - OK")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - Faltante")
    
    if missing_packages:
        print(f"\n📦 Instalando dependencias faltantes...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
            print("✅ Dependencias instaladas correctamente")
        except subprocess.CalledProcessError:
            print("❌ Error instalando dependencias")
            return False
    
    return True

def check_env_file():
    """Verificar archivo .env"""
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ Archivo .env no encontrado")
        print("📝 Creando archivo .env de ejemplo...")
        
        env_content = """# Supabase Configuration
SUPABASE_URL=https://xvwnwzlppenrtzxfwjax.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d253emxwcGVucnR6eGZ3amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjQyMzgsImV4cCI6MjA2NzE0MDIzOH0.e9rwMsihJfV8PIXX6mWLMtZS9KEO3R5GnE7tbcEapxA


# Backend Configuration
FLASK_ENV=development
FLASK_DEBUG=True
"""
        
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Archivo .env creado")
        print("⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de Supabase")
        return False
    
    print("✅ Archivo .env encontrado")
    return True

def check_script_files():
    """Verificar archivos de script"""
    script_files = [
        'python_scripts/scrape_hotels.py',
        'backend_server.py'
    ]
    
    for script_file in script_files:
        if not Path(script_file).exists():
            print(f"❌ Archivo {script_file} no encontrado")
            return False
        print(f"✅ {script_file} - OK")
    
    return True

def main():
    """Función principal"""
    print("🚀 Iniciando configuración del backend...\n")
    
    # Verificaciones
    checks = [
        ("Versión de Python", check_python_version),
        ("Dependencias", check_dependencies),
        ("Archivo .env", check_env_file),
        ("Archivos de script", check_script_files),
    ]
    
    all_ok = True
    for check_name, check_func in checks:
        print(f"\n🔍 Verificando {check_name}...")
        if not check_func():
            all_ok = False
    
    if not all_ok:
        print("\n❌ Algunas verificaciones fallaron")
        print("📖 Revisa el archivo SETUP_BACKEND.md para más información")
        return 1
    
    print("\n✅ Todas las verificaciones pasaron")
    print("\n🚀 Iniciando servidor backend...")
    print("📊 El servidor estará disponible en: http://localhost:5000")
    print("🛑 Presiona Ctrl+C para detener el servidor\n")
    
    # Iniciar servidor
    try:
        subprocess.run([sys.executable, 'backend_server.py'])
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido")
    except Exception as e:
        print(f"\n❌ Error iniciando servidor: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main()) 