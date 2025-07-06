# Configuración de la Tabla de Eventos en Supabase

## Paso 1: Crear la Tabla de Eventos

1. Ve a tu proyecto de Supabase
2. Navega a la sección "SQL Editor"
3. Ejecuta el siguiente SQL para crear la tabla de eventos:

```sql
-- Crear tabla de eventos para el scraping de Eventbrite
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha TEXT,
    lugar TEXT,
    enlace TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_events_nombre ON events(nombre);
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events(fecha);
CREATE INDEX IF NOT EXISTS idx_events_lugar ON events(lugar);
CREATE INDEX IF NOT EXISTS idx_events_distance ON events(distance_km);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) si es necesario
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (ajustar según tus necesidades)
CREATE POLICY "Allow public read access" ON events
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON events
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON events
    FOR DELETE USING (true);
```

## Paso 2: Verificar la Configuración

1. Ve a la sección "Table Editor" en Supabase
2. Verifica que la tabla `events` se haya creado correctamente
3. Verifica que las políticas de acceso estén configuradas

## Paso 3: Probar el Funcionamiento

1. Asegúrate de que el backend esté corriendo (`python backend_server.py`)
2. Ve a la pestaña "Eventos" en el dashboard
3. Haz clic en "Ejecutar Scraping"
4. Verifica que los eventos se guarden en la tabla

## Estructura de la Tabla

La tabla `events` contiene los siguientes campos:

- `id`: Identificador único (auto-incrementable)
- `nombre`: Nombre del evento
- `fecha`: Fecha del evento (formato texto)
- `lugar`: Lugar donde se realiza el evento
- `enlace`: URL del evento en Eventbrite
- `latitude`: Latitud del lugar del evento
- `longitude`: Longitud del lugar del evento
- `distance_km`: Distancia en kilómetros desde el punto de referencia
- `hotel_referencia`: Nombre del hotel desde donde se calculó la distancia
- `created_at`: Fecha de creación del registro
- `updated_at`: Fecha de última actualización del registro

## Configuración de Hoteles

Los hoteles y sus coordenadas se configuran en el archivo `hotel_coordinates.py`. Puedes:

1. **Agregar nuevos hoteles**: Edita el diccionario `HOTEL_COORDINATES`
2. **Modificar coordenadas**: Cambia las coordenadas de hoteles existentes
3. **Eliminar hoteles**: Quita hoteles que ya no necesites

### Ejemplo de configuración:
```python
HOTEL_COORDINATES = {
    "Grand Hotel Tijuana": (32.5149, -117.0382),
    "Hotel Real del Río": (32.5283, -117.0187),
    # Agrega más hoteles aquí
}
```

## Comportamiento del Script

El script `scrapeo_geo.py`:

1. **Borra todos los datos anteriores** antes de insertar nuevos eventos
2. Obtiene las coordenadas del hotel seleccionado
3. Busca eventos musicales en Eventbrite en Tijuana
4. Geocodifica las ubicaciones de los eventos
5. Filtra eventos dentro de un radio de 20km desde el hotel seleccionado
6. Guarda los eventos en la tabla `events` con el hotel de referencia

## Notas Importantes

- El script sobrescribe todos los datos existentes cada vez que se ejecuta
- Los eventos se filtran por proximidad geográfica (20km desde el hotel seleccionado)
- Se incluye información de coordenadas y distancia para cada evento
- La tabla incluye timestamps automáticos para auditoría
- Cada evento registra desde qué hotel se calculó la distancia
- Puedes agregar, modificar o eliminar hoteles editando `hotel_coordinates.py` 