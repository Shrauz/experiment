# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import ollama
# import speech_recognition as sr
# from transformers import pipeline
# import numpy as np
# import librosa
# import io
# import base64
# import wave
# import tempfile
# import os
# import time
# import threading
# from collections import deque


# app = Flask(__name__)
# CORS(app)

# # Initialize analyzers (load once at startup)
# print("Loading AI models...")
# try:
#     sentiment_analyzer = pipeline("sentiment-analysis")
#     emotion_analyzer = pipeline("text-classification", 
#                               model="j-hartmann/emotion-english-distilroberta-base", 
#                               top_k=1)
#     confidence_analyzer = pipeline("text-classification", 
#                                  model="cardiffnlp/twitter-roberta-base-emotion", 
#                                  top_k=None)
#     print("✅ AI models loaded successfully!")
# except Exception as e:
#     print(f"❌ Error loading models: {e}")
#     sentiment_analyzer = None
#     emotion_analyzer = None
#     confidence_analyzer = None

# class VoiceAnalyzer:
#     def __init__(self):
#         self.pause_threshold = 2.0  # seconds
#         self.analysis_results = []
        
#     def analyze_audio_features(self, audio_data, sample_rate):
#         """Analyze audio features for confidence detection"""
#         try:
#             # Extract audio features
#             mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
#             spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)
#             zero_crossing_rate = librosa.feature.zero_crossing_rate(audio_data)
            
#             # Calculate confidence indicators
#             pitch_variance = np.var(spectral_centroid)
#             energy_variance = np.var(mfccs[0])  # Energy from first MFCC
#             speaking_rate = len(audio_data) / (len(audio_data) / sample_rate)
            
#             # Simple confidence scoring based on audio features
#             confidence_score = 0.5  # baseline
            
#             # Higher pitch variance often indicates nervousness
#             if pitch_variance > 1000:
#                 confidence_score -= 0.2
#             elif pitch_variance > 500:
#                 confidence_score -= 0.1
                
#             # Consistent energy indicates confidence
#             if energy_variance < 5:
#                 confidence_score += 0.2
#             elif energy_variance > 15:
#                 confidence_score -= 0.1
                
#             return max(0.1, min(1.0, confidence_score))
            
#         except Exception as e:
#             print(f"Audio feature analysis error: {e}")
#             return 0.5  # neutral confidence
    
#     def detect_pauses(self, audio_data, sample_rate):
#         """Detect long pauses in speech"""
#         try:
#             # Simple silence detection
#             frame_length = int(0.1 * sample_rate)  # 100ms frames
#             frames = []
            
#             for i in range(0, len(audio_data), frame_length):
#                 frame = audio_data[i:i+frame_length]
#                 energy = np.sum(frame ** 2)
#                 frames.append(energy)
            
#             # Detect silent frames
#             threshold = np.mean(frames) * 0.1
#             silent_frames = [energy < threshold for energy in frames]
            
#             # Count consecutive silent frames
#             max_silence = 0
#             current_silence = 0
            
#             for is_silent in silent_frames:
#                 if is_silent:
#                     current_silence += 1
#                 else:
#                     max_silence = max(max_silence, current_silence)
#                     current_silence = 0
            
#             max_silence_duration = (max_silence * frame_length) / sample_rate
#             return max_silence_duration
            
#         except Exception as e:
#             print(f"Pause detection error: {e}")
#             return 0
    
#     def analyze_speech_comprehensive(self, text, audio_data=None, sample_rate=None):
#         """Comprehensive speech analysis"""
#         results = {
#             'sentiment': {'label': 'NEUTRAL', 'score': 0.5},
#             'emotion': {'label': 'neutral', 'score': 0.5},
#             'confidence': {'score': 0.5, 'level': 'medium'},
#             'tone_indicators': [],
#             'flags': [],
#             'audio_confidence': 0.5,
#             'pause_duration': 0,
#             'overall_assessment': 'Average response'
#         }
        
#         if not text.strip():
#             results['flags'].append('Empty or unclear response')
#             return results
        
#         try:
#             # Sentiment Analysis
#             if sentiment_analyzer:
#                 sentiment = sentiment_analyzer(text)[0]
#                 results['sentiment'] = sentiment
                
#                 if sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.7:
#                     results['flags'].append('Negative tone detected')
#                     results['tone_indicators'].append('frustrated')
            
#             # Emotion Analysis
#             if emotion_analyzer:
#                 emotion = emotion_analyzer(text)[0]
#                 results['emotion'] = emotion
                
#                 if emotion['label'] in ['anger', 'fear', 'sadness']:
#                     results['flags'].append(f'Emotional distress detected: {emotion["label"]}')
#                     results['tone_indicators'].append(emotion['label'])
#                 elif emotion['label'] in ['joy', 'surprise']:
#                     results['tone_indicators'].append('positive')
            
#             # Confidence Analysis based on text patterns
#             confidence_keywords = {
#                 'high': ['definitely', 'absolutely', 'certainly', 'confident', 'sure', 'exactly'],
#                 'low': ['maybe', 'perhaps', 'i think', 'probably', 'not sure', 'um', 'uh', 'like'],
#                 'filler': ['um', 'uh', 'er', 'ah', 'you know', 'like', 'basically', 'actually']
#             }
            
#             text_lower = text.lower()
#             high_confidence_count = sum(1 for word in confidence_keywords['high'] if word in text_lower)
#             low_confidence_count = sum(1 for word in confidence_keywords['low'] if word in text_lower)
#             filler_count = sum(1 for word in confidence_keywords['filler'] if word in text_lower)
            
#             # Calculate text-based confidence
#             text_confidence = 0.5
#             text_confidence += high_confidence_count * 0.1
#             text_confidence -= low_confidence_count * 0.1
#             text_confidence -= filler_count * 0.05
#             text_confidence = max(0.1, min(1.0, text_confidence))
            
#             # Audio-based confidence analysis
#             if audio_data is not None and sample_rate is not None:
#                 audio_confidence = self.analyze_audio_features(audio_data, sample_rate)
#                 pause_duration = self.detect_pauses(audio_data, sample_rate)
                
#                 results['audio_confidence'] = audio_confidence
#                 results['pause_duration'] = pause_duration
                
#                 if pause_duration > 3:
#                     results['flags'].append('Long pauses detected')
#                     results['tone_indicators'].append('hesitant')
                
#                 # Combine text and audio confidence
#                 combined_confidence = (text_confidence + audio_confidence) / 2
#             else:
#                 combined_confidence = text_confidence
            
#             # Set confidence level and score
#             results['confidence']['score'] = combined_confidence
#             if combined_confidence > 0.7:
#                 results['confidence']['level'] = 'high'
#                 results['tone_indicators'].append('confident')
#             elif combined_confidence < 0.4:
#                 results['confidence']['level'] = 'low'
#                 results['tone_indicators'].append('uncertain')
#             else:
#                 results['confidence']['level'] = 'medium'
            
#             # Overall assessment
#             if len(results['flags']) == 0 and combined_confidence > 0.6:
#                 results['overall_assessment'] = 'Strong, confident response'
#             elif len(results['flags']) > 2 or combined_confidence < 0.3:
#                 results['overall_assessment'] = 'Response needs improvement'
#             else:
#                 results['overall_assessment'] = 'Good response with room for improvement'
                
#         except Exception as e:
#             print(f"Analysis error: {e}")
#             results['flags'].append('Analysis error occurred')
        
#         return results

# # Initialize voice analyzer
# voice_analyzer = VoiceAnalyzer()

# @app.route("/api/feedback", methods=["POST"])
# def feedback():
#     data = request.get_json()
#     question = data.get("question", "")
#     answer = data.get("answer", "")
#     audio_data = data.get("audio_data")  # Base64 encoded audio (optional)
    
#     # Perform lexical analysis
#     analysis_results = voice_analyzer.analyze_speech_comprehensive(answer)
    
#     # Generate AI feedback using Ollama
#     prompt = f"""
#     You are an experienced technical interviewer providing feedback.
    
#     Interview Question: {question}
#     Candidate's Answer: {answer}
    
#     Speech Analysis Results:
#     - Confidence Level: {analysis_results['confidence']['level']} (Score: {analysis_results['confidence']['score']:.2f})
#     - Emotional Tone: {analysis_results['emotion']['label']}
#     - Sentiment: {analysis_results['sentiment']['label']}
#     - Tone Indicators: {', '.join(analysis_results['tone_indicators']) if analysis_results['tone_indicators'] else 'neutral'}
#     - Flags: {', '.join(analysis_results['flags']) if analysis_results['flags'] else 'none'}
    
#     Provide constructive feedback covering:
#     1. Content quality of the answer
#     2. Communication confidence and tone
#     3. Areas for improvement
#     4. Positive aspects to maintain
    
#     Keep feedback concise but actionable (3-4 sentences max).
#     """
    
#     try:
#         response = ollama.chat(
#             model="tinyllama",
#             messages=[{"role": "user", "content": prompt}],
#         )
        
#         feedback_text = response["message"]["content"]
        
#         return jsonify({
#             "feedback": feedback_text,
#             "analysis": {
#                 "confidence": analysis_results['confidence'],
#                 "emotion": analysis_results['emotion']['label'],
#                 "sentiment": analysis_results['sentiment']['label'],
#                 "tone_indicators": analysis_results['tone_indicators'],
#                 "flags": analysis_results['flags'],
#                 "overall_assessment": analysis_results['overall_assessment'],
#                 "pause_duration": analysis_results.get('pause_duration', 0)
#             }
#         })
        
#     except Exception as e:
#         import traceback
#         print("Error in /api/feedback:", traceback.format_exc())
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/analyze-audio", methods=["POST"])
# def analyze_audio():
#     """Endpoint for real-time audio analysis"""
#     try:
#         data = request.get_json()
#         text = data.get("text", "")
#         audio_base64 = data.get("audio_data")
        
#         analysis = voice_analyzer.analyze_speech_comprehensive(text)
        
#         return jsonify({
#             "analysis": analysis,
#             "timestamp": time.time()
#         })
        
#     except Exception as e:
#         print(f"Audio analysis error: {e}")
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/health", methods=["GET"])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         "status": "healthy",
#         "models_loaded": {
#             "sentiment": sentiment_analyzer is not None,
#             "emotion": emotion_analyzer is not None,
#             "confidence": confidence_analyzer is not None
#         }
#     })

# if __name__ == "__main__":
#     print("🚀 Starting Voice Interview Platform...")
#     app.run(port=5000, debug=True)






# import os
# from flask import Flask, request, jsonify, session
# from flask_cors import CORS
# import base64
# import numpy as np
# import io
# import wave
# import time

# # Gemini
# import google.generativeai as genai

# # HuggingFace Transformers and librosa for audio/text analysis
# from transformers import pipeline
# import librosa

# app = Flask(__name__)
# CORS(app)
# app.secret_key = os.environ.get("SECRET_KEY", "dev")  # Needed for Flask sessions

# # Configure Gemini API
# genai.configure(api_key=os.environ.get("AIzaSyCAN__m_YzXOzlkESPIhShUlanuTBceGvI", "YOUR_GEMINI_API_KEY"))
# gemini_model = genai.GenerativeModel('gemini-pro')

# # Load HuggingFace models
# sentiment_analyzer = pipeline("sentiment-analysis")
# emotion_analyzer = pipeline("text-classification", 
#                             model="j-hartmann/emotion-english-distilroberta-base", 
#                             top_k=1)

# class VoiceAnalyzer:
#     def analyze_audio_features(self, audio_data, sample_rate):
#         try:
#             mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
#             spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)
#             pitch_variance = np.var(spectral_centroid)
#             energy_variance = np.var(mfccs[0])
#             confidence_score = 0.5
#             if pitch_variance > 1000: confidence_score -= 0.2
#             elif pitch_variance > 500: confidence_score -= 0.1
#             if energy_variance < 5: confidence_score += 0.2
#             elif energy_variance > 15: confidence_score -= 0.1
#             return max(0.1, min(1.0, confidence_score))
#         except Exception as e:
#             print(f"Audio analysis error: {e}")
#             return 0.5

#     def detect_pauses(self, audio_data, sample_rate):
#         try:
#             frame_length = int(0.1 * sample_rate)
#             frames = [np.sum(audio_data[i:i+frame_length] ** 2) for i in range(0, len(audio_data), frame_length)]
#             threshold = np.mean(frames) * 0.1
#             silent_frames = [energy < threshold for energy in frames]
#             max_silence, current = 0, 0
#             for s in silent_frames:
#                 if s: current += 1
#                 else:
#                     max_silence = max(max_silence, current)
#                     current = 0
#             return (max_silence * frame_length) / sample_rate
#         except Exception as e:
#             print(f"Pause detection error: {e}")
#             return 0

#     def analyze_speech_comprehensive(self, text, audio_data=None, sample_rate=None):
#         results = {
#             'sentiment': {'label': 'NEUTRAL', 'score': 0.5},
#             'emotion': {'label': 'neutral', 'score': 0.5},
#             'confidence': {'score': 0.5, 'level': 'medium'},
#             'tone_indicators': [],
#             'flags': [],
#             'audio_confidence': 0.5,
#             'pause_duration': 0,
#             'overall_assessment': 'Average response'
#         }
#         if not text.strip():
#             results['flags'].append('Empty or unclear response')
#             return results
#         try:
#             if sentiment_analyzer:
#                 sentiment = sentiment_analyzer(text)[0]
#                 results['sentiment'] = sentiment
#                 if sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.7:
#                     results['flags'].append('Negative tone detected')
#                     results['tone_indicators'].append('frustrated')
#             if emotion_analyzer:
#                 emotion = emotion_analyzer(text)[0]
#                 results['emotion'] = emotion
#                 if emotion['label'] in ['anger', 'fear', 'sadness']:
#                     results['flags'].append(f'Emotional distress detected: {emotion["label"]}')
#                     results['tone_indicators'].append(emotion['label'])
#                 elif emotion['label'] in ['joy', 'surprise']:
#                     results['tone_indicators'].append('positive')
#             confidence_keywords = {
#                 'high': ['definitely', 'absolutely', 'certainly', 'confident', 'sure', 'exactly'],
#                 'low': ['maybe', 'perhaps', 'i think', 'probably', 'not sure', 'um', 'uh', 'like'],
#                 'filler': ['um', 'uh', 'er', 'ah', 'you know', 'like', 'basically', 'actually']
#             }
#             text_lower = text.lower()
#             high_confidence_count = sum(1 for word in confidence_keywords['high'] if word in text_lower)
#             low_confidence_count = sum(1 for word in confidence_keywords['low'] if word in text_lower)
#             filler_count = sum(1 for word in confidence_keywords['filler'] if word in text_lower)
#             text_confidence = 0.5 + high_confidence_count * 0.1 - low_confidence_count * 0.1 - filler_count * 0.05
#             text_confidence = max(0.1, min(1.0, text_confidence))
#             if audio_data is not None and sample_rate is not None:
#                 audio_confidence = self.analyze_audio_features(audio_data, sample_rate)
#                 pause_duration = self.detect_pauses(audio_data, sample_rate)
#                 results['audio_confidence'] = audio_confidence
#                 results['pause_duration'] = pause_duration
#                 if pause_duration > 3:
#                     results['flags'].append('Long pauses detected')
#                     results['tone_indicators'].append('hesitant')
#                 combined_confidence = (text_confidence + audio_confidence) / 2
#             else:
#                 combined_confidence = text_confidence
#             results['confidence']['score'] = combined_confidence
#             if combined_confidence > 0.7:
#                 results['confidence']['level'] = 'high'
#                 results['tone_indicators'].append('confident')
#             elif combined_confidence < 0.4:
#                 results['confidence']['level'] = 'low'
#                 results['tone_indicators'].append('uncertain')
#             else:
#                 results['confidence']['level'] = 'medium'
#             if len(results['flags']) == 0 and combined_confidence > 0.6:
#                 results['overall_assessment'] = 'Strong, confident response'
#             elif len(results['flags']) > 2 or combined_confidence < 0.3:
#                 results['overall_assessment'] = 'Response needs improvement'
#             else:
#                 results['overall_assessment'] = 'Good response with room for improvement'
#         except Exception as e:
#             print(f"Analysis error: {e}")
#             results['flags'].append('Analysis error occurred')
#         return results

# def decode_audio(audio_base64):
#     audio_bytes = base64.b64decode(audio_base64)
#     with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_file:
#         sample_rate = wav_file.getframerate()
#         audio_data = np.frombuffer(wav_file.readframes(wav_file.getnframes()), dtype=np.int16).astype(np.float32)
#     return audio_data, sample_rate

# voice_analyzer = VoiceAnalyzer()

# def get_feedback_from_gemini(prompt):
#     response = gemini_model.generate_content(prompt)
#     return response.text

# @app.route("/api/feedback", methods=["POST"])
# def feedback():
#     data = request.get_json()
#     question = data.get("question", "")
#     answer = data.get("answer", "")
#     audio_data = data.get("audio_data")  # Base64 encoded audio (optional)
#     audio_np, sample_rate = None, None
#     if audio_data:
#         try:
#             audio_np, sample_rate = decode_audio(audio_data)
#         except Exception as e:
#             print(f"Audio decode error: {e}")
#     analysis_results = voice_analyzer.analyze_speech_comprehensive(answer, audio_np, sample_rate)
#     prompt = f"""
# You are an experienced technical interviewer.
# Interview Question: {question}
# Candidate's Answer: {answer}

# Speech Metrics:
# - Confidence Level: {analysis_results['confidence']['level']} ({analysis_results['confidence']['score']:.2f})
# - Emotional Tone: {analysis_results['emotion']['label']}
# - Sentiment: {analysis_results['sentiment']['label']}
# - Tone Indicators: {', '.join(analysis_results['tone_indicators']) or 'neutral'}
# - Flags: {', '.join(analysis_results['flags']) or 'none'}
# - Pause Duration: {analysis_results.get('pause_duration', 0):.2f} seconds

# Provide concise, actionable feedback for this answer (max 3 sentences):
# 1. Content quality
# 2. Communication (confidence/tone/pauses)
# 3. Area to improve
# """
#     feedback_text = get_feedback_from_gemini(prompt)
#     # -- SESSION LOGIC: Store each question/answer/analysis/feedback for summary --
#     if "interview_session" not in session:
#         session["interview_session"] = []
#     # Save one answer's record
#     session["interview_session"].append({
#         "question": question,
#         "answer": answer,
#         "analysis": analysis_results,
#         "feedback": feedback_text,
#         "timestamp": time.time()
#     })
#     session.modified = True  # Mark session as changed
#     return jsonify({"feedback": feedback_text, "analysis": analysis_results})

# @app.route("/api/session-summary", methods=["POST"])
# def session_summary():
#     session_data = session.get("interview_session", [])
#     if not session_data:
#         return jsonify({"error": "No session data found"}), 400
#     answers = "\n\n".join(
#         f"Q{i+1}: {d['question']}\nA: {d['answer']}\nFeedback: {d['feedback']}\n"
#         f"Conf: {d['analysis']['confidence']['score']:.2f}, Pauses: {d['analysis'].get('pause_duration', 0):.2f}s"
#         for i, d in enumerate(session_data)
#     )
#     prompt = f"""
# You are an expert technical interviewer.
# Here is a transcript and analysis of a candidate's mock interview session:

# {answers}

# Please:
# 1. Give an overall interview score out of 100 (integer only, no decimals)
# 2. Justify the score briefly (2-3 sentences)
# 3. List 3 key areas for improvement for the candidate
# 4. List 2 strengths to maintain

# Format your answer clearly.
# """
#     summary_feedback = get_feedback_from_gemini(prompt)
#     # Reset session for next interview
#     session["interview_session"] = []
#     session.modified = True
#     return jsonify({"summary": summary_feedback})

# @app.route("/api/health", methods=["GET"])
# def health_check():
#     return jsonify({
#         "status": "healthy",
#         "models_loaded": {
#             "sentiment": sentiment_analyzer is not None,
#             "emotion": emotion_analyzer is not None,
#         }
#     })

# if __name__ == "__main__":
#     print("🚀 Starting ML-Driven Virtual Interview Engine (Gemini)...")
#     app.run(port=5000, debug=True)

import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import base64
import numpy as np
import io
import wave
import time

# Gemini
import google.generativeai as genai

# HuggingFace Transformers and librosa for audio/text analysis
from transformers import pipeline
import librosa

app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get("SECRET_KEY", "dev")  # Needed for Flask sessions

# Configure Gemini API
genai.configure(api_key=os.environ.get("AIzaSyCAN__m_YzXOzlkESPIhShUlanuTBceGvI", "YOUR_GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-pro')

# Load HuggingFace models
sentiment_analyzer = pipeline("sentiment-analysis")
emotion_analyzer = pipeline("text-classification", 
                            model="j-hartmann/emotion-english-distilroberta-base", 
                            top_k=1)

class VoiceAnalyzer:
    def analyze_audio_features(self, audio_data, sample_rate):
        try:
            mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)
            pitch_variance = np.var(spectral_centroid)
            energy_variance = np.var(mfccs[0])
            confidence_score = 0.5
            if pitch_variance > 1000: confidence_score -= 0.2
            elif pitch_variance > 500: confidence_score -= 0.1
            if energy_variance < 5: confidence_score += 0.2
            elif energy_variance > 15: confidence_score -= 0.1
            return max(0.1, min(1.0, confidence_score))
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return 0.5

    def detect_pauses(self, audio_data, sample_rate):
        try:
            frame_length = int(0.1 * sample_rate)
            frames = [np.sum(audio_data[i:i+frame_length] ** 2) for i in range(0, len(audio_data), frame_length)]
            threshold = np.mean(frames) * 0.1
            silent_frames = [energy < threshold for energy in frames]
            max_silence, current = 0, 0
            for s in silent_frames:
                if s: current += 1
                else:
                    max_silence = max(max_silence, current)
                    current = 0
            return (max_silence * frame_length) / sample_rate
        except Exception as e:
            print(f"Pause detection error: {e}")
            return 0

    def analyze_speech_comprehensive(self, text, audio_data=None, sample_rate=None):
        results = {
            'sentiment': {'label': 'NEUTRAL', 'score': 0.5},
            'emotion': {'label': 'neutral', 'score': 0.5},
            'confidence': {'score': 0.5, 'level': 'medium'},
            'tone_indicators': [],
            'flags': [],
            'audio_confidence': 0.5,
            'pause_duration': 0,
            'overall_assessment': 'Average response'
        }
        if not text.strip():
            results['flags'].append('Empty or unclear response')
            return results
        try:
            if sentiment_analyzer:
                sentiment = sentiment_analyzer(text)[0]
                results['sentiment'] = sentiment
                if sentiment['label'].upper() == 'NEGATIVE' and sentiment['score'] > 0.7:
                    results['flags'].append('Negative tone detected')
                    results['tone_indicators'].append('frustrated')
            if emotion_analyzer:
                emotion = emotion_analyzer(text)[0]
                results['emotion'] = emotion
                if emotion['label'] in ['anger', 'fear', 'sadness']:
                    results['flags'].append(f'Emotional distress detected: {emotion["label"]}')
                    results['tone_indicators'].append(emotion['label'])
                elif emotion['label'] in ['joy', 'surprise']:
                    results['tone_indicators'].append('positive')
            confidence_keywords = {
                'high': ['definitely', 'absolutely', 'certainly', 'confident', 'sure', 'exactly'],
                'low': ['maybe', 'perhaps', 'i think', 'probably', 'not sure', 'um', 'uh', 'like'],
                'filler': ['um', 'uh', 'er', 'ah', 'you know', 'like', 'basically', 'actually']
            }
            text_lower = text.lower()
            high_confidence_count = sum(1 for word in confidence_keywords['high'] if word in text_lower)
            low_confidence_count = sum(1 for word in confidence_keywords['low'] if word in text_lower)
            filler_count = sum(1 for word in confidence_keywords['filler'] if word in text_lower)
            text_confidence = 0.5 + high_confidence_count * 0.1 - low_confidence_count * 0.1 - filler_count * 0.05
            text_confidence = max(0.1, min(1.0, text_confidence))
            if audio_data is not None and sample_rate is not None:
                audio_confidence = self.analyze_audio_features(audio_data, sample_rate)
                pause_duration = self.detect_pauses(audio_data, sample_rate)
                results['audio_confidence'] = audio_confidence
                results['pause_duration'] = pause_duration
                if pause_duration > 3:
                    results['flags'].append('Long pauses detected')
                    results['tone_indicators'].append('hesitant')
                combined_confidence = (text_confidence + audio_confidence) / 2
            else:
                combined_confidence = text_confidence
            results['confidence']['score'] = float(combined_confidence)
            if combined_confidence > 0.7:
                results['confidence']['level'] = 'high'
                results['tone_indicators'].append('confident')
            elif combined_confidence < 0.4:
                results['confidence']['level'] = 'low'
                results['tone_indicators'].append('uncertain')
            else:
                results['confidence']['level'] = 'medium'
            if len(results['flags']) == 0 and combined_confidence > 0.6:
                results['overall_assessment'] = 'Strong, confident response'
            elif len(results['flags']) > 2 or combined_confidence < 0.3:
                results['overall_assessment'] = 'Response needs improvement'
            else:
                results['overall_assessment'] = 'Good response with room for improvement'
        except Exception as e:
            print(f"Analysis error: {e}")
            results['flags'].append('Analysis error occurred')
        return results

def decode_audio(audio_base64):
    try:
        audio_bytes = base64.b64decode(audio_base64)
        with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_file:
            sample_rate = wav_file.getframerate()
            audio_data = np.frombuffer(wav_file.readframes(wav_file.getnframes()), dtype=np.int16).astype(np.float32)
        return audio_data, sample_rate
    except Exception as e:
        print(f"Audio decode error: {e}")
        raise

voice_analyzer = VoiceAnalyzer()

def get_feedback_from_gemini(prompt):
    try:
        response = gemini_model.generate_content(prompt)
        print("Gemini raw response:", response)
        if hasattr(response, "text"):
            return response.text
        elif hasattr(response, "result"):
            return response.result
        return str(response)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "AI feedback generation failed."

def to_python_type(val):
    # Convert numpy types to native Python types for session serialization
    if isinstance(val, np.generic):
        return val.item()
    if isinstance(val, np.ndarray):
        return val.tolist()
    return val

# @app.route("/api/feedback", methods=["POST"])
# def feedback():
#     data = request.get_json()
#     question = data.get("question", "")
#     answer = data.get("answer", "")
#     audio_data = data.get("audio_data")  # Base64 encoded audio (optional)
#     audio_np, sample_rate = None, None
#     if audio_data:
#         try:
#             audio_np, sample_rate = decode_audio(audio_data)
#         except Exception as e:
#             print(f"Audio decode error: {e}")
#     analysis_results = voice_analyzer.analyze_speech_comprehensive(answer, audio_np, sample_rate)
#     prompt = f"""
# You are an experienced technical interviewer.
# Interview Question: {question}
# Candidate's Answer: {answer}

# Speech Metrics:
# - Confidence Level: {analysis_results['confidence']['level']} ({analysis_results['confidence']['score']:.2f})
# - Emotional Tone: {analysis_results['emotion']['label']}
# - Sentiment: {analysis_results['sentiment']['label']}
# - Tone Indicators: {', '.join(analysis_results['tone_indicators']) or 'neutral'}
# - Flags: {', '.join(analysis_results['flags']) or 'none'}
# - Pause Duration: {analysis_results.get('pause_duration', 0):.2f} seconds

# Provide concise, actionable feedback for this answer (max 3 sentences):
# 1. Content quality
# 2. Communication (confidence/tone/pauses)
# 3. Area to improve
# """
#     feedback_text = get_feedback_from_gemini(prompt)
#     # -- SESSION LOGIC: Store each question/answer/analysis/feedback for summary --
#     if "interview_session" not in session:
#         session["interview_session"] = []
#     # Save one answer's record, ensuring all values are serializable
#     session["interview_session"].append({
#         "question": question,
#         "answer": answer,
#         "analysis": {k: to_python_type(v) for k, v in analysis_results.items()},
#         "feedback": feedback_text,
#         "timestamp": float(time.time())
#     })
#     session.modified = True  # Mark session as changed
#     return jsonify({"feedback": feedback_text, "analysis": analysis_results})

@app.route("/api/feedback", methods=["POST"])
def feedback():
    try:
        data = request.get_json()
        question = data.get("question", "")
        answer = data.get("answer", "")
        audio_data = data.get("audio_data")  # None in your case

        audio_np, sample_rate = None, None
        if audio_data:
            try:
                audio_np, sample_rate = decode_audio(audio_data)
            except Exception as e:
                print(f"Audio decode error: {e}")

        analysis_results = voice_analyzer.analyze_speech_comprehensive(answer, audio_np, sample_rate)
        prompt = f"""
        You are an interviewer.
        Interview Question: {question}
        Candidate's Answer: {answer}

        Give opinion in ONE sentence.
        Be specific and constructive.
        """
        print("=== PROMPT DEBUG ===")
        print(prompt)
        print("====================")

        try:
            feedback_text = get_feedback_from_gemini(prompt)
        except Exception as e:
            print("Gemini Call Error:", e)
            feedback_text = "AI feedback generation failed."

        # session logic removed for brevity
        return jsonify({"feedback": feedback_text, "analysis": analysis_results})

    except Exception as e:
        print("API error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/session-summary", methods=["POST"])
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
3. List 3 key areas for improvement for the candidate
4. List 2 strengths to maintain

Format your answer clearly.
"""
    summary_feedback = get_feedback_from_gemini(prompt)
    # Reset session for next interview
    session["interview_session"] = []
    session.modified = True
    return jsonify({"summary": summary_feedback})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": {
            "sentiment": sentiment_analyzer is not None,
            "emotion": emotion_analyzer is not None,
        }
    })

@app.route("/api/gemini-test", methods=["GET"])
def gemini_test():
    try:
        resp = gemini_model.generate_content("Say hello world")
        return resp.text
    except Exception as e:
        print("Gemini test error:", e)
        return str(e), 500



if __name__ == "__main__":
    print("🚀 Starting ML-Driven Virtual Interview Engine (Gemini)...")
    app.run(port=5000, debug=True)