from flask import Flask, render_template, session, redirect
from functools import wraps
from user.routes import user_bp
from dotenv import load_dotenv
import os

load_dotenv()

google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')

app = Flask(__name__)
app.secret_key = b'N\x97\xdd\x1f\x8fpv\xf2r\x97+\xb5Mzw^'

app.config['GOOGLE_MAPS_API_KEY'] = google_maps_api_key
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            return redirect('/')
    return wrap

@app.route('/')
def index():
    return render_template('index.html', google_maps_api_key=google_maps_api_key)

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', google_maps_api_key=google_maps_api_key)

@app.route('/login')
def login_page():
    return render_template('login.html', google_maps_api_key=google_maps_api_key)

@app.route('/signup')
def signup_page():
    return render_template('signup.html', google_maps_api_key=google_maps_api_key)

app.register_blueprint(user_bp, url_prefix='/user')

if __name__ == '__main__':
    app.run(debug=True)
