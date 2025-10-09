import os
import base64
import numpy as np
import io
import wave
import time
import librosa
import google.generativeai as genai
from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin
from transformers import pipeline

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

# Configure Gemini API (can be set via env var, fallback to hardcoded key)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "AIzaSyCAN__m_YzXOzlkESPIhShUlanuTBceGvI"))
gemini_model = genai.GenerativeModel("models/gemini-2.5-pro")

# Load HuggingFace models
sentiment_analyzer = pipeline("sentiment-analysis")
emotion_analyzer = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)

# --- Helper Classes & Functions ---
class VoiceAnalyzer:
    def analyze_audio_features(self, audio_data, sample_rate):
        try:
            mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)
            pitch_variance = np.var(spectral_centroid)
            energy_variance = np.var(mfccs[0])
            confidence_score = 0.5
            if pitch_variance > 1000:
                confidence_score -= 0.2
            elif pitch_variance > 500:
                confidence_score -= 0.1
            if energy_variance < 5:
                confidence_score += 0.2
            elif energy_variance > 15:
                confidence_score -= 0.1
            return max(0.1, min(1.0, confidence_score))
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return 0.5

    def detect_pauses(self, audio_data, sample_rate):
        try:
            frame_length = int(0.1 * sample_rate)
            frames = [np.sum(audio_data[i:i + frame_length] ** 2)
                      for i in range(0, len(audio_data), frame_length)]
            threshold = np.mean(frames) * 0.1
            silent_frames = [energy < threshold for energy in frames]
            max_silence, current = 0, 0
            for s in silent_frames:
                if s:
                    current += 1
                else:
                    max_silence = max(max_silence, current)
                    current = 0
            return (max_silence * frame_length) / sample_rate
        except Exception as e:
            print(f"Pause detection error: {e}")
            return 0

    def analyze_speech_comprehensive(self, text, audio_data=None, sample_rate=None):
        results = {
            "sentiment": {"label": "NEUTRAL", "score": 0.5},
            "emotion": {"label": "neutral", "score": 0.5},
            "confidence": {"score": 0.5, "level": "medium"},
            "tone_indicators": [],
            "flags": [],
            "audio_confidence": 0.5,
            "pause_duration": 0,
            "overall_assessment": "Average response",
        }

        if not text.strip():
            results["flags"].append("Empty or unclear response")
            return results

        try:
            if sentiment_analyzer:
                sentiment = sentiment_analyzer(text)[0]
                results["sentiment"] = sentiment
                if sentiment["label"].upper() == "NEGATIVE" and sentiment["score"] > 0.7:
                    results["flags"].append("Negative tone detected")
                    results["tone_indicators"].append("frustrated")

            if emotion_analyzer:
                emotion = emotion_analyzer(text)[0]
                results["emotion"] = emotion
                if emotion["label"] in ["anger", "fear", "sadness"]:
                    results["flags"].append(f"Emotional distress: {emotion['label']}")
                    results["tone_indicators"].append(emotion["label"])
                elif emotion["label"] in ["joy", "surprise"]:
                    results["tone_indicators"].append("positive")

            confidence_keywords = {
                "high": ["definitely", "absolutely", "certainly", "confident", "sure", "exactly"],
                "low": ["maybe", "perhaps", "i think", "probably", "not sure", "um", "uh", "like"],
                "filler": ["um", "uh", "er", "ah", "you know", "like", "basically", "actually"],
            }

            text_lower = text.lower()
            high_conf = sum(w in text_lower for w in confidence_keywords["high"])
            low_conf = sum(w in text_lower for w in confidence_keywords["low"])
            fillers = sum(w in text_lower for w in confidence_keywords["filler"])

            text_conf = 0.5 + high_conf * 0.1 - low_conf * 0.1 - fillers * 0.05
            text_conf = max(0.1, min(1.0, text_conf))

            if audio_data is not None and sample_rate is not None:
                audio_conf = self.analyze_audio_features(audio_data, sample_rate)
                pause_dur = self.detect_pauses(audio_data, sample_rate)
                results["audio_confidence"] = audio_conf
                results["pause_duration"] = pause_dur
                if pause_dur > 3:
                    results["flags"].append("Long pauses detected")
                    results["tone_indicators"].append("hesitant")
                combined_conf = (text_conf + audio_conf) / 2
            else:
                combined_conf = text_conf

            results["confidence"]["score"] = float(combined_conf)
            if combined_conf > 0.7:
                results["confidence"]["level"] = "high"
                results["tone_indicators"].append("confident")
            elif combined_conf < 0.4:
                results["confidence"]["level"] = "low"
                results["tone_indicators"].append("uncertain")

            if not results["flags"] and combined_conf > 0.6:
                results["overall_assessment"] = "Strong, confident response"
            elif len(results["flags"]) > 2 or combined_conf < 0.3:
                results["overall_assessment"] = "Response needs improvement"
            else:
                results["overall_assessment"] = "Good response with room for improvement"

        except Exception as e:
            print(f"Analysis error: {e}")
            results["flags"].append("Analysis error occurred")

        return results


def decode_audio(audio_base64):
    try:
        audio_bytes = base64.b64decode(audio_base64)
        with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
            sr = wav_file.getframerate()
            audio_data = np.frombuffer(
                wav_file.readframes(wav_file.getnframes()), dtype=np.int16
            ).astype(np.float32)
        return audio_data, sr
    except Exception as e:
        print(f"Audio decode error: {e}")
        raise


voice_analyzer = VoiceAnalyzer()

def get_feedback_from_gemini(prompt):
    try:
        response = gemini_model.generate_content(prompt)
        if hasattr(response, "text"):
            return response.text
        elif hasattr(response, "result"):
            return response.result
        return str(response)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "AI feedback generation failed."


def to_python_type(val):
    if isinstance(val, np.generic):
        return val.item()
    if isinstance(val, np.ndarray):
        return val.tolist()
    return val

# --- Routes ---
@feedback_bp.route("/", methods=["POST"])
@cross_origin()
def feedback():
    try:
        data = request.get_json()
        question = data.get("question", "")
        answer = data.get("answer", "")
        audio_data = data.get("audio_data")

        audio_np, sr = None, None
        if audio_data:
            try:
                audio_np, sr = decode_audio(audio_data)
            except Exception as e:
                print(f"Audio decode error: {e}")

        analysis = voice_analyzer.analyze_speech_comprehensive(answer, audio_np, sr)
        prompt = f"""
    try:
        data = request.get_json()
        question = data.get("question", "")
        answer = data.get("answer", "")
        audio_data = data.get("audio_data")

        audio_np, sr = None, None
        if audio_data:
            try:
                audio_np, sr = decode_audio(audio_data)
            except Exception as e:
                print(f"Audio decode error: {e}")

        analysis = voice_analyzer.analyze_speech_comprehensive(answer, audio_np, sr)
        prompt = f"""
        You are an interviewer.
        Interview Question: {question}
        Candidate's Answer: {answer}

        Give opinion in ONE sentence.
        Be specific and constructive.
        """
        feedback_text = get_feedback_from_gemini(prompt)

        return jsonify({"feedback": feedback_text, "analysis": analysis})
    except Exception as e:
        print("API error:", e)
        return jsonify({"error": str(e)}), 500


@feedback_bp.route("/session-summary", methods=["POST"])
@cross_origin()
def session_summary():
    session_data = session.get("interview_session", [])
    if not session_data:
        return jsonify({"error": "No session data found"}), 400

    answers = "\n\n".join(
        f"Q{i+1}: {d['question']}\nA: {d['answer']}\nFeedback: {d['feedback']}\n"
        f"Conf: {d['analysis']['confidence']['score']:.2f}, Pauses: {d['analysis'].get('pause_duration', 0):.2f}s"
        for i, d in enumerate(session_data)
    )

    prompt = f"""
You are an expert technical interviewer.
Here is a transcript and analysis of a candidate's mock interview session:

{answers}

Please:
1. Give an overall interview score out of 100 (integer only, no decimals)
2. Justify the score briefly (2-3 sentences)
3. List 3 areas for improvement
4. List 2 strengths

Format your answer clearly.
"""
    summary = get_feedback_from_gemini(prompt)
    session["interview_session"] = []
    session.modified = True
    return jsonify({"summary": summary})


@feedback_bp.route("/health", methods=["GET"])
@cross_origin()
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": {
            "sentiment": sentiment_analyzer is not None,
            "emotion": emotion_analyzer is not None,
        },
    })


@feedback_bp.route("/gemini-test", methods=["GET"])
@cross_origin()
def gemini_test():
    try:
        resp = gemini_model.generate_content("Say hello world")
        return resp.text
    except Exception as e:
        print("Gemini test error:", e)
        return str(e), 500