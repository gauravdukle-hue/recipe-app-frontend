import { useState } from 'react';
import { createRecipe } from '../services/api';
import VoiceRecorder from './VoiceRecorder';

export default function RecipeForm({ onRecipeCreated, onCancel }) {
  const [step, setStep] = useState('voice');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine_tag, setCuisine] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [photos, setPhotos] = useState([]);

  const handleTranscript = async (transcript) => {
    setDescription(transcript);
    setStep('title');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Title and description required');
      return;
    }

    setLoading(true);
    try {
      const res = await createRecipe(title, description, cuisine_tag);
      setResult(res.data);
      setStep('review');
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          data: event.target.result,
          caption: '',
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCaptionChange = (index, caption) => {
    const newPhotos = [...photos];
    newPhotos[index].caption = caption;
    setPhotos(newPhotos);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Upload photos
      for (const photo of photos) {
        await fetch(`https://recipe-app-backend-production-030e.up.railway.app/recipes/${result.recipe_id}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            photo_data: photo.data,
            caption: photo.caption
          })
        });
      }
      
      onRecipeCreated(result.recipe_id);
    } catch (error) {
      alert('Error uploading photos: ' + error.message);
    }
    setLoading(false);
  };

  // Step 1: Voice/Type input
  if (step === 'voice') {
    return (
      <div>
        <VoiceRecorder onTranscript={handleTranscript} />
        <div style={styles.buttonGroup}>
          <button onClick={onCancel} style={styles.cancelButton}>
            ← Back to Library
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Title entry
  if (step === 'title') {
    return (
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Recipe Details</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Recipe Name *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Goa Fish Curry"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Cuisine Type (optional)</label>
          <input
            type="text"
            value={cuisine_tag}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g., Portuguese, Indian"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Your Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            rows={6}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Parsing with AI...' : 'Parse Recipe with AI'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            ← Cancel
          </button>
        </div>
      </form>
    );
  }

  // Step 3: Review parsed recipe
  if (step === 'review' && result) {
    return (
      <div style={styles.resultContainer}>
        <h2 style={styles.title}>✅ Claude Parsed Your Recipe</h2>
        <p style={styles.subtitle}>Review the ingredients and steps below</p>

        <div style={styles.resultBox}>
          <h3>{result.title}</h3>

          <h4>📦 Ingredients:</h4>
          <ul>
            {result.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.amount} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>

          <h4>👣 Steps:</h4>
          <ol>
            {result.steps.map((step, i) => (
              <li key={i}>{step.instruction}</li>
            ))}
          </ol>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => setStep('photos')}
            style={styles.submitButton}
          >
            ➜ Next: Add Photos
          </button>
          <button
            onClick={() => setStep('title')}
            style={styles.cancelButton}
          >
            ← Modify Recipe
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Photo upload
  if (step === 'photos' && result) {
    return (
      <div style={styles.resultContainer}>
        <h2 style={styles.title}>📸 Add Photos (Optional)</h2>
        <p style={styles.subtitle}>Upload family recipe photos</p>

        <div style={styles.photoUploadBox}>
          <label style={styles.uploadLabel}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoSelect}
              style={styles.fileInput}
            />
            <span style={styles.uploadButton}>+ Choose Photos</span>
          </label>
        </div>

        {photos.length > 0 && (
          <div style={styles.photoPreviewContainer}>
            <h4>Added Photos ({photos.length}):</h4>
            <div style={styles.photoGrid}>
              {photos.map((photo, i) => (
                <div key={i} style={styles.photoPreview}>
                  <img src={photo.data} alt={`photo ${i}`} style={styles.previewImg} />
                  <input
                    type="text"
                    placeholder="Photo caption (optional)"
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(i, e.target.value)}
                    style={styles.captionInput}
                  />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    style={styles.removeButton}
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            onClick={handleFinalSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Uploading...' : '✓ Save Recipe'}
          </button>
          <button
            onClick={() => setStep('review')}
            style={styles.cancelButton}
          >
            ← Back to Review
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  form: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#27ae60',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '1rem'
  },
  cancelButton: {
    padding: '15px',
    backgroundColor: '#95a5a6',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem'
  },
  title: {
    fontSize: '24px',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '2rem'
  },
  resultContainer: {
    padding: '2rem',
    maxWidth: '700px',
    margin: '0 auto'
  },
  resultBox: {
    backgroundColor: '#ecf0f1',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem'
  },
  photoUploadBox: {
    border: '2px dashed #3498db',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  fileInput: {
    display: 'none'
  },
  uploadLabel: {
    cursor: 'pointer'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  photoPreviewContainer: {
    marginBottom: '2rem'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  photoPreview: {
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center'
  },
  previewImg: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '0.5rem'
  },
  captionInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '0.5rem',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '12px'
  },
  removeButton: {
    width: '100%',
    padding: '6px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};
