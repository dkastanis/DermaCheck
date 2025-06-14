from flask import jsonify, request, session, redirect, url_for, flash
from passlib.hash import pbkdf2_sha256
from db import db
import uuid

import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Email sending function
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(to_email, subject, body_text, body_html=None):
    from_email = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    # Plain version (на всякий случай)
    part1 = MIMEText(body_text, "plain")

    # HTML version
    if body_html:
        part2 = MIMEText(body_html, "html")
        msg.attach(part1)
        msg.attach(part2)
    else:
        msg.attach(part1)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(from_email, password)
        smtp.send_message(msg)



class User:
    def start_session(self, user):
        user['_id'] = str(user['_id'])
        del user['password']
        session['logged_in'] = True
        session['user'] = user
        print("Session data:", session)

    def signup(self):
        print(request.form)

        user = {
            "_id": uuid.uuid4().hex,
            "firstname": request.form.get('firstname'),
            "lastname": request.form.get('lastname'),
            "email": request.form.get('email').strip().lower(),
            "password": request.form.get('password')
        }

        email = user['email']
        if '@' not in email:
            return jsonify({"error": "Invalid email format"}), 400

        local_part, domain = email.split('@', 1)
        allowed_domains = ['gmail.com', 'yahoo.com', 'outlook.com']

        if domain not in allowed_domains:
            return jsonify({"error": "Email domain not allowed"}), 400

        if db.users.find_one({"email": user['email']}):
            return jsonify({"error": "Email address already in use"}), 400

        user['password'] = pbkdf2_sha256.hash(user['password'])

        if db.users.insert_one(user):
            self.start_session(user)

            # ✉️ Send welcome email
            subject = "Welcome to DermaCheck!"

            body_text = f"""
            Hello, {user['firstname']}!

            You have successfully registered with DermaCheck.
            Thank you for choosing us!
            """

            body_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hello, <strong>{user['firstname']}</strong>!</p>
                <p>You have successfully registered with <strong>DermaCheck</strong>.</p>
                <p>Thank you for choosing us!</p>
            </body>
            </html>
            """

            send_email(user["email"], subject, body_text, body_html)


            return jsonify({"success": True}), 200

        return jsonify({"error": "Signup failed, please try again"}), 400

    def login(self):
        user = db.users.find_one({"email": request.form.get('email')})
        print("User found:", user)

        if user and pbkdf2_sha256.verify(request.form.get('password'), user['password']):
            self.start_session(user)
            return jsonify({"success": True}), 200

        return jsonify({"error": "Invalid login credentials"}), 401

    def signout(self):
        session.clear()
        return redirect('/')
