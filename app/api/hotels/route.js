export const runtime = 'nodejs';

import { spawn } from 'child_process';
import path from 'path';

export async function POST(request) {
  const body = await request.json();
  const { lat, lon, name } = body;
  console.log('API /api/hotels llamada con:', { lat, lon, name });

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'amadeus_search.js');
    const process = spawn('node', [
      scriptPath,
      '--lat', lat,
      '--lon', lon,
      '--name', name 
    ]);

    let data = '';
    process.stdout.on('data', (chunk) => {
      data += chunk;
    });
    process.stderr.on('data', (err) => {
      console.error('STDERR del script:', err.toString());
    });
    process.on('close', () => {
      try {
        console.log('Salida del script amadeus_search.js:', data);
        const lastLine = data.trim().split('\n').pop();
        const json = JSON.parse(lastLine);
        resolve(new Response(JSON.stringify(json), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      } catch (e) {
        console.error('Error parseando la salida del script:', e, data);
        resolve(new Response(JSON.stringify({ error: 'Error parsing hotels data', details: data }), { status: 500 }));
      }
    });
  });
} 