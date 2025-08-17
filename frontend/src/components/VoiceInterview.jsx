import React, { useState, useRef, useEffect } from "react";

const VoiceInterview = () => {
  const [question] = useState("Tell me about yourself.");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Not Recording");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [feedback, setFeedback] = useState(""); // LLM feedback
  const [loading, setLoading] = useState(false); // <-- loader state
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
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.voice = selectedVoice;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
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
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setListening(true);
      setStatus("🎤 Recording...");
    };

    recognitionRef.current.onend = () => {
      setListening(false);
      setStatus("⏹ Recording Stopped");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
      getFeedback(transcript); // <-- Call feedback when answer recorded
    };

    recognitionRef.current.start();
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setStatus("⏹ Recording Stopped");
    }
  };

  // Send answer to backend LLM API (Ollama)
  const getFeedback = async (userAnswer) => {
    try {
      setLoading(true); // <-- start loader
      setFeedback(""); // clear previous feedback
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer: userAnswer }),
      });

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback("⚠️ Could not fetch feedback.");
    } finally {
      setLoading(false); // <-- stop loader
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Mock Interview</h2>
      <p className="question">{question}</p>

      <div className="voice-selector">
        <label htmlFor="voice">Choose Voice:</label>
        <select
          id="voice"
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
        >
          {voices.map((v, i) => (
            <option key={i} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      <div className="form-buttons">
        <button className="btn primary" onClick={speakQuestion}>
          🔊 Hear Question
        </button>
        <button
          className="btn secondary"
          onClick={startListening}
          disabled={listening}
        >
          🎤 Start Answering
        </button>
        <button
          className="btn danger"
          onClick={stopListening}
          disabled={!listening}
        >
          ⏹ Stop
        </button>
      </div>

      {/* Status Indicator */}
      <p
        style={{
          marginTop: "10px",
          fontWeight: "bold",
          color: listening ? "green" : "red",
        }}
      >
        {status}
      </p>

      {answer && (
        <div className="feedback">
          <strong>You said:</strong> {answer}
        </div>
      )}

      {/* Loader while fetching */}
      {loading && (
        <div className="loader" style={{ marginTop: "15px", fontStyle: "italic" }}>
          ⏳ Fetching feedback...
        </div>
      )}

      {/* AI Feedback */}
      {feedback && !loading && (
        <div className="ai-feedback">
          <h3>💡 AI Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterview;
