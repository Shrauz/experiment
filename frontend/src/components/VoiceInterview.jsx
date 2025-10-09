import React, { useState, useRef, useEffect } from "react";

const VoiceInterview = ({ question }) => {
  // Always use a string for the displayed question
  const displayedQuestion =
    typeof question === "object" && question.question_text
      ? question.question_text
      : typeof question === "string"
      ? question
      : "Tell me about yourself.";

  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Not Recording");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null);
  const recognitionRef = useRef(null);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  // Speak the question with selected voice
  const speakQuestion = () => {
    if (!selectedVoice) return;
    const utterance = new SpeechSynthesisUtterance(displayedQuestion);
    utterance.voice = selectedVoice;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Real-time analysis during speech
  const performRealTimeAnalysis = async (text) => {
    if (!text.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: "Live analysis", answer: text }),
      });

      const data = await response.json();
      setRealTimeAnalysis(data.analysis);
    } catch (error) {
      console.error("Real-time analysis error:", error);
    }
  };

  // Start listening
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;

    recognitionRef.current.onstart = () => {
      setListening(true);
      setStatus("🎤 Recording...");
      setRealTimeAnalysis(null);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
      setStatus("⏹ Recording Stopped");
    };

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript) {
        setAnswer(transcript);
        // Perform real-time analysis
        performRealTimeAnalysis(transcript);
        // Get final feedback when recording stops
        if (!listening) {
          getFeedback(transcript);
        }
      }
    };

    recognitionRef.current.start();
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setStatus("⏹ Recording Stopped");
      // Get feedback for the final answer
      if (answer) {
        getFeedback(answer);
      }
    }
  };

  // Send answer to backend for comprehensive analysis
  const getFeedback = async (userAnswer) => {
    try {
      setLoading(true);
      setFeedback("");
      setAnalysis(null);

      const response = await fetch("http://localhost:5000/api/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: displayedQuestion, answer: userAnswer }),
      });

      const data = await response.json();
      setFeedback(data.feedback);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback("⚠ Could not fetch feedback.");
    } finally {
      setLoading(false);
    }
  };

  // Get confidence level color
  const getConfidenceColor = (level) => {
    switch (level) {
      case "high":
        return "#22c55e";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Get emotion emoji
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      joy: "😊",
      sadness: "😔",
      anger: "😠",
      fear: "😰",
      surprise: "😲",
      neutral: "😐",
      disgust: "🤢",
    };
    return emojiMap[emotion] || "😐";
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>AI-Powered Mock Interview</h2>

      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ color: "#475569", marginBottom: "10px" }}>
          Interview Question:
        </h3>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "500",
            color: "#1e293b",
          }}
        >
          {displayedQuestion}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="voice"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          Choose Interview Voice:
        </label>
        <select
          id="voice"
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
          value={selectedVoice ? selectedVoice.name : ""}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          {voices.map((v, i) => (
            <option key={i} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={speakQuestion}
          style={{
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          🔊 Hear Question
        </button>
        <button
          onClick={startListening}
          disabled={listening}
          style={{
            padding: "12px 20px",
            backgroundColor: listening ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: listening ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          🎤 Start Answering
        </button>
        <button
          onClick={stopListening}
          disabled={!listening}
          style={{
            padding: "12px 20px",
            backgroundColor: !listening ? "#9ca3af" : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: !listening ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          ⏹ Stop
        </button>
      </div>

      <p
        style={{
          fontWeight: "bold",
          color: listening ? "#10b981" : "#ef4444",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      >
        Status: {status}
      </p>

      {/* Real-time Analysis */}
      {realTimeAnalysis && listening && (
        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #f59e0b",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#92400e" }}>
            🔍 Live Analysis
          </h4>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <span
              style={{
                color: getConfidenceColor(realTimeAnalysis.confidence.level),
                fontWeight: "bold",
              }}
            >
              Confidence: {realTimeAnalysis.confidence.level}
            </span>
            <span>
              {getEmotionEmoji(realTimeAnalysis.emotion.label)} Tone:{" "}
              {realTimeAnalysis.emotion.label}
            </span>
            {realTimeAnalysis.flags.length > 0 && (
              <span style={{ color: "#ef4444" }}>
                ⚠ {realTimeAnalysis.flags.join(", ")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* User's Answer */}
      {answer && (
        <div
          style={{
            backgroundColor: "#f1f5f9",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #cbd5e1",
          }}
        >
          <h3 style={{ marginTop: "0", color: "#475569" }}>Your Answer:</h3>
          <p style={{ lineHeight: "1.6", color: "#1e293b" }}>{answer}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontStyle: "italic",
            color: "#6b7280",
          }}
        >
          ⏳ Analyzing your response...
        </div>
      )}

      {/* Detailed Analysis Results */}
      {analysis && !loading && (
        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #0284c7",
          }}
        >
          <h3 style={{ marginTop: "0", color: "#0369a1" }}>
            📊 Speech Analysis
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <strong>Confidence Level:</strong>
              <div
                style={{
                  color: getConfidenceColor(analysis.confidence.level),
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {analysis.confidence.level.toUpperCase()}
                <span style={{ fontSize: "14px", marginLeft: "8px" }}>
                  ({(analysis.confidence.score * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div>
              <strong>Emotional Tone:</strong>
              <div style={{ fontSize: "16px" }}>
                {getEmotionEmoji(analysis.emotion.label)}{" "}
                {analysis.emotion.label}
              </div>
            </div>

            <div>
              <strong>Overall Sentiment:</strong>
              <div
                style={{
                  fontSize: "16px",
                  color:
                    analysis.sentiment.label === "POSITIVE"
                      ? "#059669"
                      : analysis.sentiment.label === "NEGATIVE"
                      ? "#dc2626"
                      : "#6b7280",
                }}
              >
                {analysis.sentiment.label === "POSITIVE"
                  ? "👍"
                  : analysis.sentiment.label === "NEGATIVE"
                  ? "👎"
                  : "😐"}{" "}
                {analysis.sentiment.label}
              </div>
            </div>

            {analysis.pause_duration > 0 && (
              <div>
                <strong>Max Pause:</strong>
                <div style={{ fontSize: "16px" }}>
                  {analysis.pause_duration.toFixed(1)}s
                </div>
              </div>
            )}
          </div>

          {analysis.tone_indicators.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Tone Indicators: </strong>
              {analysis.tone_indicators.map((indicator, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "#dbeafe",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    fontSize: "14px",
                  }}
                >
                  {indicator}
                </span>
              ))}
            </div>
          )}

          {analysis.flags.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#dc2626" }}>
                ⚠ Areas for Attention:
              </strong>
              <ul
                style={{
                  margin: "8px 0",
                  paddingLeft: "20px",
                }}
              >
                {analysis.flags.map((flag, i) => (
                  <li
                    key={i}
                    style={{
                      color: "#dc2626",
                      marginBottom: "4px",
                    }}
                  >
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              backgroundColor: "#e0f2fe",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #0284c7",
            }}
          >
            <strong>Assessment: </strong>
            <span style={{ fontStyle: "italic" }}>
              {analysis.overall_assessment}
            </span>
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && !loading && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #16a34a",
          }}
        >
          <h3 style={{ marginTop: "0", color: "#15803d" }}>
            💡 AI Interviewer Feedback
          </h3>
          <p
            style={{
              lineHeight: "1.6",
              color: "#166534",
              margin: "0",
            }}
          >
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterview;