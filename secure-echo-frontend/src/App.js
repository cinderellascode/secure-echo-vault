import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [status, setStatus] = useState("Locked 🔒");
  const [isListening, setIsListening] = useState(false);
  const [step, setStep] = useState(1); // 1=Voice, 2=OTP, 3=Unlocked
  const [serverOtp, setServerOtp] = useState(null);
  const [userOtpInput, setUserOtpInput] = useState("");

  // --- AUDIO HELPER ---
  const speak = (text) => {
    // 1. STOP MICROPHONE IMMEDIATELY
    if (window.recognition) {
        window.recognition.abort();
    }
    
    // 2. STOP PREVIOUS SPEECH
    window.speechSynthesis.cancel(); 

    // 3. SPEAK NEW TEXT
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // --- STEP 1: VOICE RECOGNITION ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Use Google Chrome"); return;
    }

    // Assign to window so we can kill it globally if needed
    window.recognition = new window.webkitSpeechRecognition();
    window.recognition.lang = 'en-US';
    window.recognition.continuous = false; // Stop after one sentence
    window.recognition.interimResults = false;

    setStatus("Listening...");
    setIsListening(true);

    window.recognition.onstart = () => {
      setIsListening(true);
    };

    window.recognition.onresult = (event) => {
      // CRITICAL FIX: Kill mic immediately upon hearing sound
      window.recognition.stop(); 
      setIsListening(false);

      const transcript = event.results[0][0].transcript;
      setStatus(`Analyzed: "${transcript}"`);
      verifyVoice(transcript);
    };

    window.recognition.onerror = (event) => {
      console.error("Speech Error", event.error);
      setIsListening(false);
      setStatus("Microphone Error. Try Again.");
    };
    
    // Cleanup when speaking ends
    window.recognition.onend = () => {
      setIsListening(false);
    };

    window.recognition.start();
  };

  const verifyVoice = async (transcript) => {
    // Avoid sending empty requests
    if (!transcript) return;

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/handshake/', {
        voice_input: transcript
      });

      if (res.data.access === "STEP_1_PASSED") {
        setServerOtp(res.data.audio_otp); 
        setStep(2); 
        setStatus("Voice Verified. Playing Audio OTP...");
        
        // Speak the OTP slowly
        const otpString = res.data.audio_otp.split('').join(' '); 
        speak(`Identity Confirmed. Your secure code is ${otpString}`);
        
      } else {
        setStatus("Access Denied");
        speak("Access Denied. Try again.");
      }
    } catch (err) { 
        console.error(err);
        setStatus("Server Connection Failed");
    }
  };

  // --- STEP 2: OTP VERIFICATION ---
  const handleOtpSubmit = () => {
    if (userOtpInput === serverOtp) {
      setStep(3); 
      setStatus("ACCESS GRANTED 🔓");
      speak("Code Correct. Welcome to the Vault.");
    } else {
      setStatus("Incorrect Code ❌");
      speak("Incorrect Code.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
        if (window.recognition) window.recognition.abort();
    };
  }, []);

  return (
    <div className="card">
      <h1>Audio-2FA Vault</h1>
      
      {/* STEP 1: VOICE */}
      {step === 1 && (
        <>
          <p className="subtitle">Say "Hello World" to begin</p>
          <div style={{fontSize: '3rem', margin: '20px'}}>
            {isListening ? '🔴' : '🔒'}
          </div>
          <button className="primary-btn" onClick={startListening} disabled={isListening}>
            {isListening ? "Listening..." : "Tap to Speak"}
          </button>
        </>
      )}

      {/* STEP 2: BLIND OTP */}
      {step === 2 && (
        <>
          <p className="subtitle">Listen to the audio code & type it below.</p>
          <div style={{fontSize: '3rem', margin: '20px'}}>🎧</div>
          
          <input 
            type="text" 
            placeholder="Enter Audio PIN"
            value={userOtpInput}
            onChange={(e) => setUserOtpInput(e.target.value)}
            style={{
                padding: '10px', 
                fontSize: '1.2rem', 
                textAlign: 'center', 
                width: '80%', 
                marginBottom: '1rem',
                borderRadius: '5px',
                border: '1px solid #ccc'
            }}
          />
          
          <button className="primary-btn" onClick={handleOtpSubmit}>
            Verify Code
          </button>
          
          <button 
             style={{marginTop:'15px', background:'transparent', border:'none', color:'#2563eb', cursor:'pointer', textDecoration: 'underline'}}
             onClick={() => speak(serverOtp.split('').join(' '))}
          >
            Replay Audio Code
          </button>
        </>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="secret-content">
          <h2 style={{color: '#00ff9d'}}>Vault Open!</h2>
          <p>Secret Data: The launch codes are 88-22-11.</p>
          <button 
            className="primary-btn" 
            onClick={() => {
                setStep(1); 
                setUserOtpInput(""); 
                setStatus("Locked");
                window.speechSynthesis.cancel();
            }}
            style={{marginTop: '20px', backgroundColor: '#333'}}
          >
            Lock System
          </button>
        </div>
      )}

      <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', minHeight: '20px' }}>{status}</p>
    </div>
  );
}

export default App;
/*

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");

  const initiateHandshake = async () => {
    setLoading(true);
    setStatus("Establishing Secure Connection...");

    try {
      // 1. Call the Django API
      const response = await axios.get('http://127.0.0.1:8000/api/handshake/');
      
      // 2. Update the UI with the "Audit Log" data
      setLog(response.data);
      setStatus("Transmission Complete");

      // 3. THE TONETAG TWIST: Audio Output
      // We read the payload aloud to mimic sound-based communication
      if (response.data.meta.audio_trigger) {
        speakData(response.data.transaction.payload);
      }

    } catch (error) {
      console.error("Connection Error:", error);
      setStatus("Connection Failed");
      alert("Ensure Django server is running on port 8000!");
    } finally {
      setLoading(false);
    }
  };

  // Helper function for Text-to-Speech
  const speakData = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="card">
      <h1>Secure Echo</h1>
      <p className="subtitle">Audit-Logged Transmission System</p>

      <button 
        className="primary-btn" 
        onClick={initiateHandshake}
        disabled={loading}
      >
        {loading ? "Transmitting..." : "Initiate Handshake"}
      </button>

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
        Status: {status}
      </p>

      {log && (
        <div className="log-box">
          <div className="latency-badge">
            {log.meta.latency_ms}ms
          </div>
          <p><strong>ID:</strong> #{log.transaction.id}</p>
          <p><strong>PAYLOAD:</strong> "{log.transaction.payload}"</p>
          <p><strong>TIME:</strong> {log.transaction.formatted_time}</p>
          <p><strong>SERVER:</strong> {log.meta.server_message}</p>
          <p><strong>AUDIO:</strong> Generated ✓</p>
        </div>
      )}
    </div>
  );
}

export default App;


*/