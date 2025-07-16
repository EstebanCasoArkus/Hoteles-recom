import fetch from 'node-fetch';
import 'dotenv/config';

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
  console.error('❌ Faltan las variables de entorno AMADEUS_CLIENT_ID o AMADEUS_CLIENT_SECRET');
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET
    })
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('❌ Error obteniendo token:', text);
    process.exit(1);
  }
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, lat, lon } = req.body;
  const token = await getAccessToken();

  const latitude = lat;
  const longitude = lon;

  const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${latitude}&longitude=${longitude}&radius=20`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('❌ Error en la consulta de hoteles:', text);
    res.status(500).json({ error: 'Error consultando hoteles', details: text });
    return;
  }

  const data = await response.json();
  if (!data.data) {
    console.error('❌ Respuesta inesperada de Amadeus:', data);
    res.status(500).json({ error: 'Respuesta inesperada de Amadeus', details: data });
    return;
  }
  const filtered = data.data.filter((h) => h.name.toLowerCase().includes(name.toLowerCase()));

  res.status(200).json({ hotels: filtered });
}

// Permitir ejecución por CLI en ES Modules
const isDirect = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirect) {
  // Parsear argumentos CLI
  const args = process.argv.slice(2);
  let lat = '', lon = '', name = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lat') lat = args[i + 1];
    if (args[i] === '--lon') lon = args[i + 1];
    if (args[i] === '--name') name = args[i + 1];
  }
  (async () => {
    try {
      const token = await getAccessToken();
      console.log('Token obtenido:', token);
      const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${lat}&longitude=${lon}&radius=20`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Status de respuesta hoteles:', response.status);
      const data = await response.json();
      console.log('Respuesta cruda de Amadeus:', JSON.stringify(data));
      if (!data.data) {
        console.error('❌ Respuesta inesperada de Amadeus:', data);
        process.exit(1);
      }
      const filtered = data.data.filter((h) => h.name.toLowerCase().includes((name || '').toLowerCase()));
      console.log(JSON.stringify({ hotels: filtered }));
    } catch (e) {
      console.error('❌ Error inesperado:', e);
      process.exit(1);
    }
  })();
} 
