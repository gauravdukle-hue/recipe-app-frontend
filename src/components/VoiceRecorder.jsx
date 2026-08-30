import { useState } from 'react';

export default function VoiceRecorder({ onTranscript }) {
  const [transcript, setTranscript] = useState('');
  const [photos, setPhotos] = useState([]);

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos([...photos, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

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

      {photos.length > 0 && (
        <div style={styles.photosGrid}>
          {photos.map((photo, idx) => (
            <div key={idx} style={styles.photoWrapper}>
              <img src={photo} alt={`preview-${idx}`} style={styles.photoThumb} />
              <button
                onClick={() => handleRemovePhoto(idx)}
                style={styles.removePhotoBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.toolsBar}>
        <label style={styles.photoButton}>
          📷
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoAdd}
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          onClick={handleSubmit} 
          disabled={!transcript.trim()} 
          style={{
            ...styles.submitButton,
            opacity: transcript.trim() ? 1 : 0.5,
            cursor: transcript.trim() ? 'pointer' : 'not-allowed'
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
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.8rem',
    padding: '1rem 2rem',
    backgroundColor: '#fafafa'
  },
  photoWrapper: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  photoThumb: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  toolsBar: {
    display: 'flex',
    gap: '0.8rem',
    padding: '1rem 2rem',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  photoButton: {
    width: '44px',
    height: '44px',
    backgroundColor: '#e5e5e5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  submitButton: { 
    flex: 1,
    padding: '12px', 
    backgroundColor: '#007AFF', 
    color: 'white', 
    fontSize: '15px', 
    fontWeight: '600', 
    border: 'none', 
    borderRadius: '8px', 
    transition: 'all 0.2s',
    cursor: 'pointer'
  }
};
