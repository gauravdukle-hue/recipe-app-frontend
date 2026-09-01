import { useState } from 'react';
import { useWavRecorder } from '../hooks/useWavRecorder';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../languages';

export default function VoiceRecorder({ onTranscript }) {
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const { status, start, stop, reset, blob, url, duration, level, error } = useWavRecorder();

  const handleSubmit = () => {
    const text = transcript.trim();
    if (!text && !blob) return;
    onTranscript({ text, audioBlob: blob, audioDuration: duration, language });
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const canSave = transcript.trim().length > 0 || blob !== null;

  return (
    <div style={styles.container}>
      <div style={styles.pageWrapper}>
        <svg style={styles.ruledPattern} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="blankLines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
              <line x1="60" y1="31" x2="100%" y2="31" stroke="transparent" strokeWidth="1" />
            </pattern>
            <pattern id="ruledLines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
              <line x1="60" y1="31" x2="100%" y2="31" stroke="#d0d0d0" strokeWidth="1" />
            </pattern>
            <pattern id="marginLine" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              <line x1="50" y1="0" x2="50" y2="100%" stroke="#ff9999" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="160" fill="url(#blankLines)" />
          <line x1="60" y1="191" x2="100%" y2="191" stroke="#007AFF" strokeWidth="3" />
          <rect y="192" width="100%" height="1000" fill="url(#ruledLines)" />
          <rect width="100%" height="100%" fill="url(#marginLine)" />
        </svg>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder=""
          style={styles.textarea}
        />
      </div>

      {status === 'recording' && (
        <div style={styles.recordingBar}>
          <span style={styles.recDot} />
          <span style={styles.recLabel}>Recording</span>
          <div style={styles.meter}>
            <div style={{ ...styles.meterFill, width: `${Math.round(level * 100)}%` }} />
          </div>
        </div>
      )}

      {status === 'ready' && url && (
        <div style={styles.playbackBar}>
          <audio src={url} controls playsInline style={styles.audio} />
          <div style={styles.playbackMeta}>
            <span>{fmt(duration)} recorded</span>
            <button onClick={reset} style={styles.discardBtn}>Discard</button>
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.toolsBar}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={status === 'recording'}
          aria-label="Language being spoken"
          style={styles.langSelect}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <button
          onClick={status === 'recording' ? stop : start}
          style={{
            ...styles.recordButton,
            backgroundColor: status === 'recording' ? '#c62828' : '#e5e5e5',
            color: status === 'recording' ? 'white' : '#1d1d1d'
          }}
        >
          {status === 'recording' ? 'Stop' : status === 'ready' ? 'Record again' : 'Record'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSave}
          style={{
            ...styles.submitButton,
            opacity: canSave ? 1 : 0.5,
            cursor: canSave ? 'pointer' : 'not-allowed'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  },
  pageWrapper: {
    backgroundColor: '#ffffff',
    padding: '40px 60px',
    height: '70vh',
    position: 'relative',
    overflow: 'hidden'
  },
  ruledPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  textarea: {
    width: '100%',
    height: '100%',
    padding: '160px 0 0 0',
    fontSize: '20px',
    border: 'none',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineHeight: '32px',
    resize: 'none',
    backgroundColor: 'transparent',
    color: '#1d1d1d',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    WebkitTextSizeAdjust: '100%'
  },
  recordingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem 2rem',
    backgroundColor: '#fafafa'
  },
  recDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#c62828',
    flexShrink: 0
  },
  recLabel: { fontSize: '15px', color: '#1d1d1d', flexShrink: 0 },
  meter: {
    flex: 1,
    height: '10px',
    backgroundColor: '#e5e5e5',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#2a8a3a',
    transition: 'width 60ms linear'
  },
  playbackBar: { padding: '1rem 2rem', backgroundColor: '#fafafa' },
  audio: { width: '100%', marginBottom: '0.5rem' },
  playbackMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666'
  },
  discardBtn: {
    padding: '8px 14px',
    backgroundColor: '#e5e5e5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#1d1d1d'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px 2rem',
    fontSize: '14px'
  },
  toolsBar: {
    display: 'flex',
    gap: '0.8rem',
    padding: '1rem 2rem',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  langSelect: {
    padding: '16px 12px',
    minHeight: '52px',
    fontSize: '16px',
    fontFamily: 'inherit',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#1d1d1d'
  },
  recordButton: {
    minWidth: '140px',
    padding: '16px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    WebkitTapHighlightColor: 'transparent'
  },
  submitButton: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px'
  }
};
