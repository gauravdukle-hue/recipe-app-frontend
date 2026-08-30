import { useState, useRef } from 'react';

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [useText, setUseText] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      alert('Microphone access denied: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Audio = e.target.result;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/speech/transcribe`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioContent: base64Audio,
              languageCode: language
            })
          }
        );

        const data = await response.json();
        if (data.transcript) {
          setTranscript(data.transcript);
        } else {
          alert('No speech detected. Try again.');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      alert('Transcription error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  if (useText) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>✍️ Type Your Recipe</h2>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Describe your recipe..."
          style={styles.textarea}
        />
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
        <label style={styles.labelText}>Language:</label>
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
        </select>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={loading}
        style={{
          ...styles.recordButton,
          backgroundColor: isRecording ? '#e74c3c' : '#3498db',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '⏳ Transcribing...' : isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
      </button>

      <button onClick={() => setUseText(true)} style={styles.typeButton}>
        ✍️ Or Type Instead
      </button>

      {isRecording && <p style={styles.listening}>🔴 Recording...</p>}

      {transcript && (
        <div style={styles.transcriptBox}>
          <h3 style={styles.transcriptTitle}>Your Recipe:</h3>
          <p style={styles.transcript}>{transcript}</p>
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
  container: { padding: '3rem 2rem', maxWidth: '100%', margin: '0 auto', minHeight: '100vh' },
  title: { fontSize: '36px', marginBottom: '3rem', color: '#2c3e50', fontWeight: 'bold' },
  languageSelector: { marginBottom: '2.5rem' },
  labelText: { fontSize: '24px', display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: '#2c3e50' },
  selectInput: { width: '100%', padding: '20px', borderRadius: '12px', border: '3px solid #bdc3c7', fontSize: '22px', boxSizing: 'border-box' },
  recordButton: { width: '100%', padding: '30px', fontSize: '26px', fontWeight: 'bold', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', marginBottom: '1.5rem', minHeight: '90px' },
  typeButton: { width: '100%', padding: '24px', fontSize: '22px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', marginBottom: '2rem', fontWeight: 'bold' },
  listening: { textAlign: 'center', color: '#e74c3c', fontWeight: 'bold', marginBottom: '2rem', fontSize: '24px' },
  transcriptBox: { backgroundColor: '#ecf0f1', padding: '3rem', borderRadius: '16px', marginTop: '2rem', marginBottom: '2rem' },
  transcriptTitle: { fontSize: '28px', color: '#2c3e50', marginBottom: '1.5rem', fontWeight: 'bold' },
  transcript: { fontSize: '22px', lineHeight: '2', color: '#2c3e50', marginBottom: '1rem' },
  submitButton: { width: '100%', padding: '24px', backgroundColor: '#27ae60', color: 'white', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', cursor: 'pointer', minHeight: '80px' },
  backButton: { width: '100%', padding: '20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', marginTop: '1.5rem', fontSize: '22px', fontWeight: 'bold' },
  textarea: { width: '100%', padding: '24px', fontSize: '24px', border: '3px solid #bdc3c7', borderRadius: '12px', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '2', minHeight: '600px', marginBottom: '2rem', resize: 'vertical' }
};
