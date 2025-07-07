from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import subprocess
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration (server-side only)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

@app.route('/run-scrape-hotels', methods=['POST'])
def run_scrape_hotels():
    try:
        result = subprocess.run(
            ['python', 'python_scripts/scrape_hotels.py'],
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8'
        )
        return jsonify({'output': result.stdout}), 200
    except subprocess.CalledProcessError as e:
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return jsonify({'error': e.stderr}), 500
    except Exception as ex:
        print("General Exception:", ex)
        return jsonify({'error': str(ex)}), 500

@app.route('/run-scrapeo-geo', methods=['POST'])
def run_scrapeo_geo():
    try:
        from flask import request
        data = request.get_json()
        hotel_name = data.get('hotel_name', 'Grand Hotel Tijuana') if data else 'Grand Hotel Tijuana'
        
        result = subprocess.run(
            ['python', 'python_scripts/scrapeo_geo.py', '32.5149,-117.0382', hotel_name],
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8'
        )
        return jsonify({'output': result.stdout}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e.stderr}), 500

@app.route('/hoteles-tijuana-json', methods=['GET'])
def hoteles_tijuana_json():
    filename = os.path.join('resultados', 'hoteles_tijuana_promedios.json')
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = f.read()
        return app.response_class(data, mimetype='application/json')
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Fetch events from Supabase"""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return jsonify({'error': 'Supabase configuration missing'}), 500
    
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/events?select=*&order=created_at.desc',
            headers={
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            }
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': f'Supabase error: {response.status_code}'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    """Fetch hotels from Supabase"""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return jsonify({'error': 'Supabase configuration missing'}), 500
    
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/hotels?select=*&order=created_at.desc',
            headers={
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            }
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': f'Supabase error: {response.status_code}'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'supabase_configured': bool(SUPABASE_URL and SUPABASE_ANON_KEY)
    })

if __name__ == '__main__':
    app.run(port=5000) 