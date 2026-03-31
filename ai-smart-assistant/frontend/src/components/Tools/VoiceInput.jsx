import React, { useRef, useState } from "react";

export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleVoice = () => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript && onTranscript) onTranscript(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <button
      type="button"
      className={`tool-btn ${isListening ? "tool-btn-active" : ""}`}
      onClick={handleVoice}
      disabled={disabled}
      title={isListening ? "Stop voice input" : "Start voice input"}
      aria-label="Voice input"
    >
      {isListening ? "..." : "mic"}
    </button>
  );
}
