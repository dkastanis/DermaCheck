from flask import Blueprint, render_template, request, redirect, url_for, flash
from user.models import User

user_bp = Blueprint('user_bp', __name__)

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