# Hotel Dashboard con Correlación de Eventos

Un dashboard moderno para gestionar hoteles y eventos en Tijuana, con análisis de precios y correlación de eventos cercanos.

## 🚀 Características

- **Dashboard Interactivo** - Interfaz moderna con pestañas para diferentes funcionalidades
- **Gestión de Hoteles** - Visualización y análisis de hoteles con precios
- **Eventos Cercanos** - Scraping automático de eventos desde Eventbrite
- **Análisis de Precios** - Gráficos y estadísticas de precios de hoteles
- **Arquitectura Segura** - Backend que protege credenciales de Supabase

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Python Flask, Supabase
- **Base de Datos**: Supabase (PostgreSQL)
- **Scraping**: Selenium, BeautifulSoup

## 📋 Requisitos Previos

- Node.js 18+ y npm/pnpm
- Python 3.8+
- Chrome/Chromium y ChromeDriver
- Cuenta en Supabase

## ⚙️ Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd hotel-main
```

### 2. Instalar Dependencias

```bash
# Frontend
npm install
# o
pnpm install

# Backend
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno

#### Backend (.env)
Crea un archivo `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Frontend (.env.local)
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Crea las siguientes tablas:

#### Tabla `hotels`
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

#### Tabla `events`
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha DATE NOT NULL,
    lugar TEXT,
    enlace TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    distance_km DECIMAL(5,2),
    hotel_referencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Ejecución

### 1. Iniciar Backend

```bash
python backend_server.py
```

El servidor estará disponible en: `http://localhost:5000`

### 2. Iniciar Frontend

```bash
npm run dev
# o
pnpm dev
```

El frontend estará disponible en: `http://localhost:3000`

## 📊 Funcionalidades

### Dashboard Principal
- Resumen de hoteles y eventos
- Acciones rápidas
- Navegación por pestañas

### Gestión de Hoteles
- Lista de hoteles con precios
- Filtros avanzados
- Comparación de hoteles

### Eventos
- Scraping automático desde Eventbrite
- Eventos cercanos a hoteles específicos
- Gestión de eventos

### Análisis
- Gráficos de precios
- Estadísticas detalladas
- Correlación de datos

## 🔧 Endpoints del Backend

- `GET /api/health` - Verificar estado del servidor
- `GET /api/hotels` - Obtener hoteles desde Supabase
- `GET /api/events` - Obtener eventos desde Supabase
- `POST /run-scrape-hotels` - Ejecutar scraping de hoteles
- `POST /run-scrapeo-geo` - Ejecutar scraping de eventos
- `POST /run-scrape-hotel-propio` - Ejecutar scraping de hoteles propios

## 🛡️ Seguridad

- Credenciales de Supabase protegidas en el backend
- Variables de entorno separadas para frontend y backend
- CORS configurado para desarrollo
- Sin exposición de claves en el cliente

## 📝 Scripts Disponibles

- `python_scripts/scrape_hotels.py` - Scraping de hoteles
- `python_scripts/scrapeo_geo.py` - Scraping de eventos geolocalizados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que Supabase esté funcionando
3. Revisa los logs del backend y frontend
4. Consulta la documentación de Supabase