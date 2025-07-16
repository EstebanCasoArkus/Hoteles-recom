import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class EventsFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://app.ticketmaster.com/discovery/v2/events.json"

    def get_events(
        self,
        city: Optional[str] = 'San Diego',
        days_ahead: int = 30,
        limit: int = 15,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius: int = 50,  # en km
        country_code: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        start_date = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        end_date = (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%dT%H:%M:%SZ")

        params = {
            'apikey': self.api_key,
            'startDateTime': start_date,
            'endDateTime': end_date,
            'sort': 'date,asc',
            'size': limit
        }

        if country_code:
            params['countryCode'] = country_code

        # Si se pasan coordenadas, usar latlong y radius
        if latitude is not None and longitude is not None:
            params['latlong'] = f"{latitude},{longitude}"
            params['radius'] = radius
            params['unit'] = 'km'
        elif city:
            params['city'] = city

        response = requests.get(self.base_url, params=params)
        data = response.json()

        events = []
        if '_embedded' in data and 'events' in data['_embedded']:
            for event in data['_embedded']['events']:
                event_info = {
                    'name': event.get('name', ''),
                    'url': event.get('url', ''),
                    'date': event['dates']['start'].get('localDate', '') if 'dates' in event and 'start' in event['dates'] else '',
                    'time': event['dates']['start'].get('localTime', '') if 'dates' in event and 'start' in event['dates'] else '',
                    'venue': event['_embedded']['venues'][0]['name'] if '_embedded' in event and 'venues' in event['_embedded'] and event['_embedded']['venues'] else '',
                    'genre': event['classifications'][0]['genre']['name'] if 'classifications' in event and event['classifications'] and 'genre' in event['classifications'][0] else '',
                    'price_range': f"{event['priceRanges'][0]['min']} - {event['priceRanges'][0]['max']} {event['priceRanges'][0]['currency']}" if 'priceRanges' in event and event['priceRanges'] else 'N/A'
                }
                events.append(event_info)

        return events

def get_hotel_coordinates(hotel_name):
    hotels = {
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
    }
    return hotels.get(hotel_name, (32.5149, -117.0382))