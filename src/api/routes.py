

from flask import Flask, request, jsonify, url_for, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

from app import db, bcrypt
from api.models import User

api = Blueprint('api_routes', __name__)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend..."
    }
    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    email = data['email']
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 409

    try:
        hashed_password_str = bcrypt.generate_password_hash(password).decode('utf-8')
    except Exception as e:
         print(f"Error hashing password during signup: {e}")
         return jsonify({"message": "Error processing password"}), 500

    new_user = User(
        email=email,
        password=hashed_password_str,
        is_active=True
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Signup Database Error: {e}")
        return jsonify({"message": "Database error during registration"}), 500

    return jsonify({"message": "User registered successfully"}), 201


@api.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token
        }), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    

@api.route('/private', methods=['GET'])
@jwt_required()
def privated_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user is None:
        return jsonify({"message": "User not found"}), 404
    return jsonify({
        "message": "Access granted to private route.",
        "user_info": {
             "id": user.id,
             "email": user.email
        }
    }), 200