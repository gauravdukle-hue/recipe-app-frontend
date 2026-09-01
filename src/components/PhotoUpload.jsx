import { useState, useRef } from 'react';
import api from '../services/api';

export default function PhotoUpload({ recipe_id, onPhotoAdded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await api.post(`/recipes/${recipe_id}/photos`, {
          photo_data: event.target.result,
          caption: ''
        });
        if (inputRef.current) inputRef.current.value = '';
        if (onPhotoAdded) onPhotoAdded();
      } catch (err) {
        setError(err.response?.data?.error || 'Could not upload that photo.');
      }
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Could not read that file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.wrap}>
      {/* The native file input shows "No file chosen" and the filename next to
          it, which can't be styled away. Hide it and drive it from a button. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={styles.hiddenInput}
      />

      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        disabled={uploading}
        style={styles.button}
      >
        {uploading ? 'Uploading...' : 'Add photo'}
      </button>

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  hiddenInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none'
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#e5e5e5',
    color: '#1d1d1d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px'
  }
};
