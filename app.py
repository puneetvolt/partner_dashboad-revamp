from flask import Flask, redirect, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from api_routes import payout_api

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Register the API blueprint
app.register_blueprint(payout_api, url_prefix='/api/payout')

# Add a route for the incorrect path that redirects to the correct one
@app.route('/api/dashboard')
def redirect_dashboard():
    """Redirect from incorrect path to correct path"""
    return redirect('/api/payout/dashboard' + '?' + request.query_string.decode())

# Add a route for the new gst-dashboard endpoint
@app.route('/gst-dashboard')
def redirect_gst_dashboard():
    """Redirect from incorrect path to correct path"""
    return redirect('/api/payout/gst-dashboard' + '?' + request.query_string.decode())

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == '__main__':
    app.run(port=5001, debug=True)