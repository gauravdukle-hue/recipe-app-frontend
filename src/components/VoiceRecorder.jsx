import { useState, useRef } from 'react';

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [useText, setUseText] = useState(false);
  const [language, setLanguage] = useState('en-US');
  
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const isRecordingRef = useRef(false);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recording not supported on this browser');
      return;
    }

    transcriptRef.current = '';
    isRecordingRef.current = true;
    setTranscript('');
    setIsRecording(true);
    setIsListening(true);

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        transcriptRef.current += final;
      }

      setTranscript(transcriptRef.current + interim);
    };

    rec.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'network') {
        console.error('Error:', event.error);
      }
    };

    rec.onend = () => {
      if (isRecordingRef.current) {
        setTimeout(() => rec.start(), 100);
      }
    };

    rec.start();
    recognitionRef.current = rec;
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  const handleClear = () => {
    setTranscript('');
    transcriptRef.current = '';
  };

  if (useText) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>✍️ Type Your Recipe</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Describe your recipe:</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g., Clean the fish and score it. Make a paste with chilies and coconut..."
            style={styles.textarea}
            rows={8}
          />
        </div>

        <button onClick={handleSubmit} disabled={!transcript.trim()} style={styles.submitButton}>
          Parse Recipe with AI
        </button>

        <button onClick={() => setUseText(false)} style={styles.backButton}>
          ← Back to Voice
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎤 Describe Your Recipe</h2>

      <div style={styles.languageSelector}>
        <label style={styles.label}>Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording}
          style={styles.selectInput}
        >
          <option value="en-US">English</option>
          <option value="kok">Konkani</option>
          <option value="hi-IN">Hindi</option>
          <option value="mr-IN">Marathi</option>
          <option value="pt-BR">Portuguese</option>
        </select>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          ...styles.recordButton,
          backgroundColor: isRecording ? '#e74c3c' : '#3498db'
        }}
      >
        {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
      </button>

      <button onClick={() => setUseText(true)} style={styles.typeButton}>
        ✍️ Or Type Instead
      </button>

      {isListening && <p style={styles.listening}>🔴 Recording... (pause is OK)</p>}

      {transcript && (
        <div style={styles.transcriptBox}>
          <h3>Your Recipe:</h3>
          <p style={styles.transcript}>{transcript}</p>
          <button onClick={handleClear} style={styles.clearButton}>
            Clear
          </button>
        </div>
      )}

      {transcript && (
        <button onClick={handleSubmit} style={styles.submitButton}>
          Parse Recipe with AI
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: {
    fontSize: '24px',
    marginBottom: '1.5rem',
    color: '#2c3e50'
  },
  languageSelector: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  selectInput: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  recordButton: {
    width: '100%',
    padding: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  typeButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  listening: {
    textAlign: 'center',
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  transcriptBox: {
    backgroundColor: '#ecf0f1',
    padding: '1.5rem',
    borderRadius: '8px',
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  transcript: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#2c3e50',
    marginBottom: '1rem'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#27ae60',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};
