-- Funciones SQL para gestionar la tabla de hoteles en Supabase

-- Función para limpiar completamente la tabla de hoteles
CREATE OR REPLACE FUNCTION truncate_hotels()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Limpiar completamente la tabla (usando WHERE para cumplir con Supabase)
    DELETE FROM hotels WHERE TRUE;
    
    -- Resetear la secuencia del ID si existe
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'hotels_id_seq') THEN
        ALTER SEQUENCE hotels_id_seq RESTART WITH 1;
    END IF;
    
    RAISE NOTICE 'Tabla hotels limpiada completamente';
END;
$$;

-- Función para obtener estadísticas de hoteles
CREATE OR REPLACE FUNCTION get_hotel_stats()
RETURNS TABLE (
    total_hotels bigint,
    avg_price numeric,
    min_price numeric,
    max_price numeric,
    last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_hotels,
        AVG(precio_promedio) as avg_price,
        MIN(precio_promedio) as min_price,
        MAX(precio_promedio) as max_price,
        MAX(created_at)::timestamptz as last_updated
    FROM hotels;
END;
$$;

-- Función para limpiar y reinsertar hoteles (útil para el script de scraping)
CREATE OR REPLACE FUNCTION refresh_hotels(
    hotel_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Limpiar tabla existente (usando WHERE para cumplir con Supabase)
    DELETE FROM hotels WHERE TRUE;
    
    -- Resetear secuencia
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'hotels_id_seq') THEN
        ALTER SEQUENCE hotels_id_seq RESTART WITH 1;
    END IF;
    
    -- Insertar nuevos datos
    INSERT INTO hotels (nombre, estrellas, precio_promedio, noches_contadas, created_at)
    SELECT 
        (value->>'nombre')::text,
        (value->>'estrellas')::integer,
        (value->>'precio_promedio')::numeric,
        (value->>'noches_contadas')::integer,
        COALESCE((value->>'created_at')::timestamptz, NOW())
    FROM jsonb_array_elements(hotel_data);
    
    RAISE NOTICE 'Tabla hotels actualizada con % registros', jsonb_array_length(hotel_data);
END;
$$;

-- Dar permisos para que la función sea ejecutable por usuarios anónimos
GRANT EXECUTE ON FUNCTION truncate_hotels() TO anon;
GRANT EXECUTE ON FUNCTION get_hotel_stats() TO anon;
GRANT EXECUTE ON FUNCTION refresh_hotels(jsonb) TO anon; 