import { useState } from 'react';

export default function VoiceRecorder({ onTranscript }) {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  return (
    <div style={styles.container}>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Describe your recipe here..."
        style={styles.textarea}
      />
      <button 
        onClick={handleSubmit} 
        disabled={!transcript.trim()} 
        style={styles.submitButton}
      >
        Continue
      </button>
    </div>
  );
}

const styles = {
  container: { width: '100%' },
  textarea: { 
    width: '100%', 
    padding: '16px', 
    fontSize: '16px', 
    border: '1px solid #e5e5e5', 
    borderRadius: '12px', 
    boxSizing: 'border-box', 
    fontFamily: 'inherit', 
    lineHeight: '1.6', 
    minHeight: '200px',
    marginBottom: '1rem',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s'
  },
  submitButton: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#007AFF', 
    color: 'white', 
    fontSize: '15px', 
    fontWeight: '600', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: 1
  }
};
