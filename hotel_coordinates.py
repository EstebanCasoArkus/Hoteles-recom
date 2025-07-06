# Configuración de coordenadas de hoteles en Tijuana
# Puedes agregar, modificar o eliminar hoteles según tus necesidades

HOTEL_COORDINATES = {
    "Grand Hotel Tijuana": (32.5149, -117.0382),
    "Hotel Real del Río": (32.5283, -117.0187),
    "Hotel Pueblo Amigo": (32.5208, -117.0278),
    "Hotel Ticuan": (32.5234, -117.0312),
    "Hotel Lucerna": (32.5267, -117.0256),
    "Hotel Fiesta Inn": (32.5212, -117.0298),
    "Hotel Marriott": (32.5245, -117.0334),
    "Hotel Holiday Inn": (32.5198, -117.0267),
    "Hotel Best Western": (32.5221, -117.0289),
    "Hotel Comfort Inn": (32.5256, -117.0321),
    # Agrega más hoteles aquí con sus coordenadas
    # "Nombre del Hotel": (latitud, longitud),
}

def get_hotel_coordinates(hotel_name):
    """Obtiene las coordenadas de un hotel específico"""
    return HOTEL_COORDINATES.get(hotel_name, (32.5149, -117.0382))  # Default a Tijuana

def get_all_hotels():
    """Obtiene la lista de todos los hoteles disponibles"""
    return list(HOTEL_COORDINATES.keys())

def add_hotel(name, latitude, longitude):
    """Agrega un nuevo hotel a la configuración"""
    HOTEL_COORDINATES[name] = (latitude, longitude)

def remove_hotel(name):
    """Elimina un hotel de la configuración"""
    if name in HOTEL_COORDINATES:
        del HOTEL_COORDINATES[name]

# Ejemplo de uso:
if __name__ == "__main__":
    print("Hoteles disponibles:")
    for hotel in get_all_hotels():
        coords = get_hotel_coordinates(hotel)
        print(f"  {hotel}: {coords}")
    
    # Ejemplo de agregar un nuevo hotel
    # add_hotel("Nuevo Hotel", 32.5200, -117.0300) 