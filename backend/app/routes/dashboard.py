# routes/dashboard.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Interview, Question

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/my-interviews", methods=["GET"])
@jwt_required()
def get_my_interviews():
    user_id = get_jwt_identity()
    interviews = Interview.query.filter_by(user_id=user_id).all()

    result = []
    for interview in interviews:
        result.append({
            "interview_id": interview.id,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "expected_answer_keywords": q.expected_answer_keywords
                } for q in interview.questions
            ]
        })
    return jsonify(result), 200
