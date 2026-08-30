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
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Describe your recipe here... Include ingredients, steps, cooking time, etc."
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
          📷 Add Photo
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoAdd}
            style={{ display: 'none' }}
          />
        </label>
      </div>

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
  );
}

const styles = {
  container: { 
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto'
  },
  pageWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '40px 50px',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        #f0f0f0 0px,
        #f0f0f0 1px,
        transparent 1px,
        transparent 28px
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 49px,
        #e8e8e8 49px,
        #e8e8e8 50px
      )
    `,
    backgroundSize: '100% 28px, 50px 100%',
    backgroundPosition: '0 0, 0 0',
    minHeight: '600px'
  },
  textarea: { 
    width: '100%', 
    height: '550px',
    padding: '0',
    fontSize: '16px', 
    border: 'none',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
    lineHeight: '28px',
    resize: 'none',
    backgroundColor: 'transparent',
    color: '#1d1d1d'
  },
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
    marginBottom: '1.5rem'
  },
  photoWrapper: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  photoThumb: {
    width: '100%',
    height: '120px',
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
    gap: '1rem',
    marginTop: '2rem',
    marginBottom: '1.5rem'
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
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#007AFF', 
    color: 'white', 
    fontSize: '16px', 
    fontWeight: '600', 
    border: 'none', 
    borderRadius: '12px', 
    transition: 'all 0.2s',
    cursor: 'pointer'
  }
};
