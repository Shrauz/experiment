from flask import Flask
from app.extensions import db, bcrypt, jwt
from app.routes.auth import auth_bp

def create_app():
    app = Flask(__name__)

    # Config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["JWT_SECRET_KEY"] = "super-secret"  # Change in production

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)

    return app
