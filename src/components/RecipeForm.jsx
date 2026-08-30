import { useState } from 'react';
import { createRecipe } from '../services/api';
import VoiceRecorder from './VoiceRecorder';
import PhotoUpload from './PhotoUpload';

export default function RecipeForm({ onBack }) {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipeId, setRecipeId] = useState(null);

  const handleTranscript = (text) => {
    setDescription(text);
    setStep(2);
  };

  const handleParse = async () => {
    if (!title || !cuisine) {
      setError('Please enter title and cuisine');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createRecipe(title, description, cuisine);
      setRecipeId(response.data.recipe_id);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onBack();
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back</button>

      {step === 1 && (
        <VoiceRecorder onTranscript={handleTranscript} />
      )}

      {step === 2 && (
        <div style={styles.card}>
          <h2 style={styles.stepTitle}>Recipe Details</h2>
          
          <input
            type="text"
            placeholder="Recipe name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            style={styles.input}
          >
            <option value="">Select cuisine</option>
            <option value="Indian">Indian</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Asian">Asian</option>
            <option value="Other">Other</option>
          </select>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button onClick={() => setStep(1)} style={styles.secondaryButton}>Back</button>
            <button onClick={handleParse} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Parsing...' : 'Parse Recipe'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && recipeId && (
        <div style={styles.card}>
          <h2 style={styles.stepTitle}>Add Photos</h2>
          <PhotoUpload recipeId={recipeId} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  backButton: { padding: '8px 12px', backgroundColor: '#e5e5e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', marginBottom: '2rem' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  stepTitle: { fontSize: '24px', fontWeight: '700', color: '#1d1d1d', margin: '0 0 0.5rem 0' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '1rem' },
  buttonGroup: { display: 'flex', gap: '1rem', marginTop: '2rem' },
  primaryButton: { flex: 1, padding: '12px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  secondaryButton: { flex: 1, padding: '12px', backgroundColor: '#e5e5e5', color: '#1d1d1d', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
};
