from flask import Blueprint, render_template, request, send_file, jsonify
from user.models import User
from datetime import datetime
import os
import uuid
import threading
from werkzeug.utils import secure_filename
from model.predict_skin_cancer import predict_skin_cancer
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

user_bp = Blueprint('user_bp', __name__)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def delete_file_later(filepath):
    def remove():
        try:
            os.remove(filepath)
            print(f"Deleted file: {filepath}")
        except Exception as e:
            print(f"Error deleting file: {e}")
    threading.Timer(600, remove).start()

@user_bp.route('/signup', methods=['GET'])
def signup_page():
    return render_template('signup.html')

@user_bp.route('/signup', methods=['POST'])
def signup():
    return User().signup()

@user_bp.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@user_bp.route('/login', methods=['POST'])
def login():
    return User().login()

@user_bp.route('/signout')
def signout():
    return User().signout()

@user_bp.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@user_bp.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'Empty file name'}), 400

    filename = secure_filename(image.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_name)
    image.save(filepath)

    delete_file_later(filepath)
    return jsonify({"filepath": f"/static/uploads/{unique_name}"})

@user_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    filepath = data.get("filepath")

    if not filepath:
        return jsonify({"error": "No filepath provided"}), 400

    full_path = os.path.join(os.getcwd(), filepath.strip("/"))

    try:
        predictions = predict_skin_cancer(full_path)
        return jsonify({
            "predictions": predictions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/download-pdf', methods=['POST'])
def download_pdf():
    data = request.get_json()
    filepath = data.get("filepath", "")
    predictions = data.get("predictions", [])  
    firstname = data.get("firstname", "")
    lastname = data.get("lastname", "")

    if not filepath.strip() or not predictions:
        return jsonify({"error": "Missing data"}), 400

    image_path = os.path.join(os.getcwd(), filepath.strip("/"))
    pdf_path = os.path.join("static", "reports", f"report_{uuid.uuid4().hex}.pdf")
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, y, "DermaCheck Analysis Report")

    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(100, y, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 20
    c.drawString(100, y, f"First Name: {firstname}")
    y -= 20
    c.drawString(100, y, f"Last Name: {lastname}")

    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, y, "Top Predictions")
    y -= 20

    c.setFont("Helvetica-Bold", 10)
    c.drawString(100, y, "Label")
    c.drawString(300, y, "Confidence")
    y -= 15

    c.setFont("Helvetica", 10)
    for pred in predictions:
        label = pred.get("label", "")
        confidence = f"{pred.get('confidence', 0):.2f}%"
        c.drawString(100, y, label)
        c.drawString(300, y, confidence)
        y -= 15
        if y < 100:
            c.showPage()
            y = height - 50

        y -= 40  # add extra space below the predictions table

    img_width = 10 * cm
    img_height = 10 * cm

    # Ensure we don't go below the bottom margin
    min_y = 50  # minimum bottom margin
    if y - img_height < min_y:
        c.showPage()
        y = height - 100  # start near top of next page

    # Normalize and print image path
    print("Original image path:", image_path)
    image_path = os.path.abspath(image_path).replace("\\", "/")
    print("Normalized image path:", image_path)

    try:
        c.drawImage(image_path, 100, y - img_height, width=img_width, height=img_height, preserveAspectRatio=True, mask='auto')
    except Exception as e:
        print("Image insert failed:", e)

    c.save()
    return send_file(pdf_path, as_attachment=True)




