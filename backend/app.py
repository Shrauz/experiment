from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)

@app.route("/api/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")

    prompt = f"""
    You are an interviewer.
    Interview Question: {question}
    Candidate's Answer: {answer}

    Give clear and short feedback on how well the candidate answered.
    """

    try:
        response = ollama.chat(
            model="tinyllama",  
            messages=[{"role": "user", "content": prompt}],
        )
        
        feedback_text = response["message"]["content"]

        return jsonify({"feedback": feedback_text})

    except Exception as e:
        import traceback
        print("Error in /api/feedback:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
