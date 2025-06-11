from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# Get API keys from environment variables
EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID', 'your-app-id')
EDAMAM_APP_KEY = os.getenv('EDAMAM_APP_KEY', 'your-app-key')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search')
def search_recipes():
    ingredients = request.args.get('q', '')
    url = f"https://api.edamam.com/search?q={ingredients}&app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        return jsonify(data.get('hits', []))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)