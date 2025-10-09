from flask import Blueprint, request, jsonify
from app.models import User
from app.extensions import db
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# Login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": {"id": user.id, "username": user.username}}), 200

from flask_jwt_extended import jwt_required, get_jwt_identity

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()   # returns str(user.id)
    user = User.query.get(user_id)  # fetch user from DB

    if not user:
        return {"msg": "User not found"}, 404

    return {"msg": f"Hello, {user.username} ({user.email})!"}, 200


from flask_jwt_extended import JWTManager

jwt = JWTManager()

@jwt.unauthorized_loader
def unauthorized_callback(callback):
    return jsonify({"error": "Missing Authorization Header"}), 401


