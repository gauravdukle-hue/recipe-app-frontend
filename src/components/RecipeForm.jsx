import { useState } from 'react';
import { createRecipe, uploadAudio } from '../services/api';
import VoiceRecorder from './VoiceRecorder';
import PhotoUpload from './PhotoUpload';

export default function RecipeForm({ onBack }) {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [recipeId, setRecipeId] = useState(null);

  const handleTranscript = ({ text, audioBlob: blob, audioDuration: dur }) => {
    setDescription(text || '');
    setAudioBlob(blob || null);
    setAudioDuration(dur || 0);
    setStep(2);
  };

  const handleParse = async () => {
    if (!title || !cuisine) {
      setError('Please enter title and cuisine');
      return;
    }
    if (!description.trim() && !audioBlob) {
      setError('Type the recipe or record it before continuing');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    // A recording with no typed text still needs a description for Claude to
    // parse. Send a placeholder so the recipe row is created and the audio has
    // something to attach to; transcription fills it in later.
    const body = description.trim() || '[Recorded audio — transcription pending]';

    try {
      const response = await createRecipe(title, body, cuisine);
      const newId = response.data.recipe_id;
      setRecipeId(newId);

      if (audioBlob) {
        try {
          await uploadAudio(newId, audioBlob, audioDuration);
        } catch {
          // The recipe itself saved. Losing the audio shouldn't lose the recipe.
          setNotice('Recipe saved, but the recording did not upload.');
        }
      }

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

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
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

          {audioBlob && (
            <div style={styles.audioNote}>
              Recording attached — {fmt(audioDuration)}
            </div>
          )}

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
            <option value="Goan">Goan</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Asian">Asian</option>
            <option value="Other">Other</option>
          </select>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button onClick={() => setStep(1)} style={styles.secondaryButton}>Back</button>
            <button onClick={handleParse} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Saving...' : 'Parse Recipe'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && recipeId && (
        <div style={styles.card}>
          <h2 style={styles.stepTitle}>Add Photos</h2>
          {notice && <div style={styles.notice}>{notice}</div>}
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
  audioNote: { backgroundColor: '#e8f4ea', color: '#1d5a2a', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '1rem' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '1rem' },
  notice: { backgroundColor: '#fff4e5', color: '#8a5200', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '1rem' },
  buttonGroup: { display: 'flex', gap: '1rem', marginTop: '2rem' },
  primaryButton: { flex: 1, padding: '12px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  secondaryButton: { flex: 1, padding: '12px', backgroundColor: '#e5e5e5', color: '#1d1d1d', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
};
