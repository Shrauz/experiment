# app/routes/feedback.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import requests

feedback_bp = Blueprint("feedback", __name__)

OLLAMA_API_URL = "http://localhost:11434/api/chat"

@feedback_bp.route("/api/feedback", methods=["POST"])
@cross_origin()  # or configure globally
def feedback():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")

    prompt = f"""
        You are an interviewer.
        Interview Question: {question}
        Candidate's Answer: {answer}

        Give opinion in ONE sentence.
        Be specific and constructive.
        """
        
        # 👇 Debugging: print the prompt
    print("=== PROMPT DEBUG ===")
    print(prompt)
    print("====================")


    try:
        # Send chat request to Ollama API
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": "tinyllama",  # or any model you have pulled
                "messages": [{"role": "user", "content": prompt}],
                "stream": False  # disable streaming for simplicity
            },
            timeout=60
        )

        response.raise_for_status()
        result = response.json()

        # API returns an array of messages; get content safely
        feedback_text = result.get("message", {}).get("content", "")

        return jsonify({"feedback": feedback_text})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Ollama API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
