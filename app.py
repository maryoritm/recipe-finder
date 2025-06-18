from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID')
EDAMAM_APP_KEY = os.getenv('EDAMAM_APP_KEY')

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index.html')

@app.route('/search')
def search_recipes():
    """Handle recipe search requests"""
    ingredients = request.args.get('q', '')
    diet = request.args.get('diet', '')
    time = request.args.get('time', '')
    
    try:
        # Build the API request URL
        url = f"https://api.edamam.com/search?q={ingredients}&app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}"
        if diet:
            url += f"&diet={diet}"
        if time:
            url += f"&time={time}"
        
        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for bad status codes
        data = response.json()
        
        return jsonify(data.get('hits', []))
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


