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
    <div style={styles.fullPageContainer}>
      <svg style={styles.ruledPattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ruledLines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
            <line x1="50" y1="31" x2="100%" y2="31" stroke="#d0d0d0" strokeWidth="1" />
          </pattern>
          <pattern id="marginLine" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
            <line x1="50" y1="0" x2="50" y2="100%" stroke="#e8e8e8" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="white" />
        <rect width="100%" height="100%" fill="url(#ruledLines)" />
        <rect width="100%" height="100%" fill="url(#marginLine)" />
      </svg>

      <div style={styles.pageWrapper}>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Describe your recipe here..."
          style={styles.textarea}
        />
      </div>

      <div style={styles.bottomPanel}>
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
            📷 Add Photo
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
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullPageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa'
  },
  ruledPattern: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '320px',
    pointerEvents: 'none'
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '40px 60px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1
  },
  textarea: { 
    width: '100%', 
    height: '100%',
    padding: '0',
    fontSize: '16px', 
    border: 'none',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
    lineHeight: '32px',
    resize: 'none',
    backgroundColor: 'transparent',
    color: '#1d1d1d'
  },
  bottomPanel: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e5e5',
    padding: '20px',
    maxHeight: '300px',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 2
  },
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  photoWrapper: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  photoThumb: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '1px solid #e5e5e5'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  toolsBar: {
    display: 'flex',
    gap: '1rem'
  },
  photoButton: {
    padding: '10px 16px',
    backgroundColor: '#e5e5e5',
    color: '#1d1d1d',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  submitButton: { 
    flex: 1,
    padding: '10px 16px', 
    backgroundColor: '#007AFF', 
    color: 'white', 
    fontSize: '15px', 
    fontWeight: '600', 
    border: 'none', 
    borderRadius: '10px', 
    transition: 'all 0.2s',
    cursor: 'pointer'
  }
};
