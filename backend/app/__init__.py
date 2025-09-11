from flask import Flask
from flask_cors import CORS
from app.extensions import db, bcrypt, jwt
from app.routes.auth import auth_bp
from .routes.feedback import feedback_bp
from .routes.generate import interview_bp

def create_app():
    app = Flask(__name__)

    # Config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["JWT_SECRET_KEY"] = "super-secret"  # Change in production

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS for frontend (Vite runs on port 5173 by default)
    CORS(app) #, resources={r"/api/*": {"origins": "http://localhost:5173"}}


    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(interview_bp)

    return app
