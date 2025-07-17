import fetch from 'node-fetch';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lon, name } = body;
    console.log('API /api/hotels llamada con:', { lat, lon, name });

    const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
    const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: 'Faltan las variables de entorno AMADEUS_CLIENT_ID o AMADEUS_CLIENT_SECRET' }), { status: 500 });
    }

    // Obtener token de acceso
    const tokenRes = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET
      })
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('❌ Error obteniendo token:', text);
      return new Response(JSON.stringify({ error: 'Error obteniendo token', details: text }), { status: 500 });
    }
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    // Consultar hoteles
    const hotelsRes = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${lat}&longitude=${lon}&radius=20`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    if (!hotelsRes.ok) {
      const text = await hotelsRes.text();
      console.error('❌ Error en la consulta de hoteles:', text);
      return new Response(JSON.stringify({ error: 'Error consultando hoteles', details: text }), { status: 500 });
    }
    const data = await hotelsRes.json();
    if (!data.data) {
      console.error('❌ Respuesta inesperada de Amadeus:', data);
      return new Response(JSON.stringify({ error: 'Respuesta inesperada de Amadeus', details: data }), { status: 500 });
    }
    const filtered = data.data.filter((h) => h.name.toLowerCase().includes((name || '').toLowerCase()));

    return new Response(JSON.stringify({ hotels: filtered }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Error inesperado en /api/hotels:', e);
    return new Response(JSON.stringify({ error: 'Error inesperado en /api/hotels', details: e.message }), { status: 500 });
  }
} 