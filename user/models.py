from flask import jsonify, request, session, redirect, url_for, flash
from passlib.hash import pbkdf2_sha256
from db import db
import uuid

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

        # Validate email format
        email = user['email']
        if '@' not in email:
            return jsonify({"error": "Invalid email format"}), 400

        local_part, domain = email.split('@', 1)
        allowed_domains = ['gmail.com', 'yahoo.com', 'outlook.com']

        if domain not in allowed_domains:
            return jsonify({"error": "Email domain not allowed"}), 400

        # Check if email already exists
        if db.users.find_one({"email": user['email']}):
            return jsonify({"error": "Email address already in use"}), 400

        # Hash password
        user['password'] = pbkdf2_sha256.hash(user['password'])

        # Insert into DB
        if db.users.insert_one(user):
            self.start_session(user)
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
