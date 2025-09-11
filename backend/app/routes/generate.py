import re
import json
import requests
import time
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import the database object and the new models
from app.extensions import db
from app.models import Interview, Question

# The Blueprint for our API endpoints
interview_bp = Blueprint("interview", __name__)

@interview_bp.route("/api/generate-interview", methods=["POST"])
@cross_origin()
@jwt_required()
def generate_interview():
    """
    Generates a list of open-ended interview questions and saves them to the
    database, linked to the authenticated user.
    
    The request is a JSON object with 'experience', 'field', and 'languages'.
    The response is a JSON object containing a 'questions' key with the generated data.
    """
    # The user_id is now securely obtained from the JWT token.
    user_id = get_jwt_identity()

    data = request.get_json()
    experience = data.get("experience", "").strip()
    field = data.get("field", "").strip()
    languages = data.get("languages", "").strip()

    if not all([experience, field, languages]):
        return jsonify({"error": "Experience, field, and languages are required."}), 400

    # === Gemini API Configuration ===
    API_KEY = "AIzaSyAGE81zaPIygNtEQa0JZELSf3fYLyAeQ14" 
    API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={API_KEY}"

    prompt = f"""
    You are an expert interviewer. Generate a list of exactly 5 theoretical, open-ended interview questions for a candidate with the following requirements:
    - Experience: {experience}
    - Field: {field}
    - Programming Languages: {languages}

    For each question, also provide a comma-separated string of the most important keywords or concepts expected in a correct answer.
    """

    # Re-added minItems and maxItems to guide the model more strictly.
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "question_text": {"type": "STRING"},
                "expected_answer_keywords": {"type": "STRING"},
            },
            "required": ["question_text", "expected_answer_keywords"],
        },
        "minItems": 5,
        "maxItems": 5,
    }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }

    try:
        for i in range(3):
            try:
                response = requests.post(
                    API_URL,
                    json=payload,
                    timeout=60
                )
                response.raise_for_status()
                
                full_response = response.json()
                questions_data = json.loads(full_response["candidates"][0]["content"]["parts"][0]["text"])

                # === Database Persistence Logic ===
                new_interview = Interview(user_id=user_id)
                db.session.add(new_interview)
                db.session.commit()

                for q_data in questions_data:
                    # Validate the data to prevent errors
                    if not q_data.get("question_text") or not q_data.get("expected_answer_keywords"):
                        continue
                        
                    new_question = Question(
                        question_text=q_data["question_text"],
                        expected_answer_keywords=q_data["expected_answer_keywords"],
                        interview_id=new_interview.id
                    )
                    db.session.add(new_question)

                db.session.commit()
                
                return jsonify({
                    "message": "Interview and questions generated and saved successfully.",
                    "interview_id": new_interview.id,
                    "questions": questions_data
                }), 201

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429 and i < 2:
                    print("Rate limit exceeded, retrying...")
                    time.sleep(2 ** (i + 1))
                elif e.response.status_code == 422:
                    return jsonify({"error": f"Gemini API could not process the request. Try adjusting your query."}), 422
                else:
                    raise
            except (KeyError, json.JSONDecodeError, Exception) as e:
                db.session.rollback()
                print(f"Error during database operation: {str(e)}")
                return jsonify({"error": f"An unexpected error occurred during database save: {str(e)}"}), 500

    except requests.exceptions.Timeout:
        return jsonify({"error": "The request to the Gemini service timed out. Please try again."}), 500
    except (requests.exceptions.RequestException, ValueError) as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
