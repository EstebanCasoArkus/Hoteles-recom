# Configuración del Backend para Hotel Dashboard

## Requisitos Previos

1. **Python 3.8+** instalado en tu sistema
2. **Chrome/Chromium** navegador instalado
3. **ChromeDriver** compatible con tu versión de Chrome

## Instalación

### 1. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Backend Configuration (opcional)
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Configurar Frontend

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Supabase Configuration (debe coincidir con el .env del backend)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## Ejecución

### 1. Iniciar el Backend

```bash
python backend_server.py
```

El servidor estará disponible en: `http://localhost:5000`

### 2. Iniciar el Frontend

```bash
npm run dev
# o
pnpm dev
```

El frontend estará disponible en: `http://localhost:3000`

## Endpoints del Backend

### Health Check
- **GET** `/api/health` - Verificar estado del servidor

### Hoteles
- **GET** `/api/hotels` - Obtener lista de hoteles desde Supabase
- **GET** `/api/hotels/stats` - Obtener estadísticas de hoteles

### Scraping
- **GET** `/api/scrape/status` - Obtener estado del proceso de scraping
- **POST** `/api/scrape/start` - Iniciar proceso de scraping

## Estructura de la Base de Datos

La tabla `hotels` en Supabase debe tener la siguiente estructura:

```sql
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    estrellas INTEGER DEFAULT 0,
    precio_promedio DECIMAL(10,2) DEFAULT 0,
    noches_contadas INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Solución de Problemas

### Error: ChromeDriver no encontrado
1. Descarga ChromeDriver desde: https://chromedriver.chromium.org/
2. Asegúrate de que esté en tu PATH o en el directorio del proyecto

### Error: Supabase no configurado
1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que la tabla `hotels` exista en tu base de datos de Supabase

### Error: CORS
1. El backend ya tiene CORS configurado para desarrollo
2. Para producción, configura los dominios permitidos en `backend_server.py`

## Notas Importantes

- El script de scraping puede tomar varios minutos en completarse
- Los datos se guardan automáticamente en Supabase
- El frontend actualiza automáticamente los datos cuando el scraping termina
- El proceso de scraping se ejecuta en un hilo separado para no bloquear el servidor 