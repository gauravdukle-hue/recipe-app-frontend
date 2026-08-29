import { useState } from 'react';
import api from '../services/api';

export default function PhotoUpload({ recipe_id, onPhotoAdded }) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const photo_data = event.target.result;
        await api.post(`/recipes/${recipe_id}/photos`, { photo_data, caption });
        setCaption('');
        e.target.value = '';
        if (onPhotoAdded) onPhotoAdded();
      } catch (error) {
        alert('Error uploading photo: ' + error.message);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <h3>📸 Add Photo</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={styles.fileInput}
      />
      <input
        type="text"
        placeholder="Photo caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={styles.captionInput}
      />
      <button disabled={uploading} style={styles.uploadButton}>
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  fileInput: {
    display: 'block',
    marginBottom: '1rem'
  },
  captionInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '1rem',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
