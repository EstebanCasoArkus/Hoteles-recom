from flask import Flask, jsonify, send_file
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

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
        result = subprocess.run(
            ['python', 'python_scripts/scrapeo_geo.py'],
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

if __name__ == '__main__':
    app.run(port=5000) 