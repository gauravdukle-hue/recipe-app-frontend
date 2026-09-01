import { useState, useEffect } from 'react';
import api, { getRecipe } from '../services/api';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';

// Recipe names get typed in a hurry on a tablet, so capitalise for display
// rather than correcting what was saved. Harmless for Devanagari, which has
// no case.
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const CUISINES = ['Indian', 'Goan', 'Italian', 'Mexican', 'Asian', 'Other'];

export default function RecipeDetail({ recipe_id, onBack }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);
  const [refreshPhotos, setRefreshPhotos] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', cuisine_tag: '', description: '' });

  useEffect(() => {
    fetchRecipe();
  }, [recipe_id]);

  const fetchRecipe = async () => {
    try {
      const res = await getRecipe(recipe_id);
      setRecipe(res.data);
    } catch {
      setError('Could not load this recipe.');
    }
    setLoading(false);
  };

  const startEdit = () => {
    setForm({
      title: recipe.title || '',
      cuisine_tag: recipe.cuisine_tag || '',
      description: recipe.description || ''
    });
    setError('');
    setEditing(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError('A recipe needs a name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/recipes/${recipe_id}`, form);
      await fetchRecipe();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    }
    setSaving(false);
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading recipe...</p>;
  if (!recipe) return <p style={{ padding: '2rem' }}>{error || 'Recipe not found'}</p>;

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back</button>

      {editing ? (
        <div style={styles.editBox}>
          <label style={styles.label}>Name</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Cuisine</label>
          <select
            value={form.cuisine_tag}
            onChange={(e) => setForm({ ...form, cuisine_tag: e.target.value })}
            style={styles.input}
          >
            <option value="">Select cuisine</option>
            {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={styles.label}>Recipe</label>
          <p style={styles.hint}>
            Correcting the text here re-reads the ingredients and steps below.
          </p>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={styles.textarea}
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonRow}>
            <button onClick={() => setEditing(false)} style={styles.secondaryButton}>
              Cancel
            </button>
            <button onClick={save} disabled={saving} style={styles.primaryButton}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>{titleCase(recipe.title)}</h1>
          {recipe.cuisine_tag && <p style={styles.cuisine}>{recipe.cuisine_tag}</p>}

          <h2 style={styles.heading}>Ingredients ({recipe.ingredients?.length || 0})</h2>
          <ul style={styles.list}>
            {recipe.ingredients?.map((ing, i) => (
              <li key={i}>
                {[ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')}
              </li>
            ))}
          </ul>

          <h2 style={styles.heading}>Steps ({recipe.steps?.length || 0})</h2>
          <ol style={styles.list}>
            {recipe.steps?.map((step, i) => (
              <li key={i}>{step.instruction}</li>
            ))}
          </ol>

          {/* The heading only appears once a photo exists. An empty gallery
              with a "No photos yet" placeholder was noise on most recipes.
              The gallery itself stays mounted so it can report the count. */}
          {photoCount > 0 && <h2 style={styles.heading}>Photos</h2>}
          <div style={photoCount > 0 ? undefined : styles.hidden}>
            <PhotoGallery
              recipe_id={recipe_id}
              key={refreshPhotos}
              onCount={setPhotoCount}
            />
          </div>

          <div style={styles.actions}>
            {showUpload ? (
              <PhotoUpload
                recipe_id={recipe_id}
                onPhotoAdded={() => {
                  setRefreshPhotos(refreshPhotos + 1);
                  setShowUpload(false);
                }}
              />
            ) : (
              <button onClick={() => setShowUpload(true)} style={styles.secondaryButton}>
                Add photo
              </button>
            )}

            <button onClick={startEdit} style={styles.secondaryButton}>
              Edit recipe
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    // A parent stylesheet centres everything, which left headings floating
    // above left-aligned lists. Anchor the whole view left.
    textAlign: 'left'
  },
  hidden: { display: 'none' },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e5e5',
    color: '#1d1d1d',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    fontSize: '15px'
  },
  title: { fontSize: '28px', color: '#2c3e50', marginBottom: '0.25rem' },
  cuisine: { fontSize: '14px', color: '#7f8c8d', marginBottom: '2rem' },
  heading: {
    fontSize: '20px',
    color: '#2c3e50',
    marginTop: '2rem',
    marginBottom: '0.75rem'
  },
  list: { paddingLeft: '1.5rem', lineHeight: '1.9', fontSize: '17px', margin: 0 },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '2.5rem',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  editBox: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '0.35rem',
    marginTop: '1rem'
  },
  hint: { fontSize: '13px', color: '#888', margin: '0 0 0.5rem 0' },
  input: {
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '17px',
    fontFamily: 'inherit',
    lineHeight: '1.8',
    minHeight: '260px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '1rem'
  },
  buttonRow: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' },
  primaryButton: {
    padding: '12px 20px',
    backgroundColor: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '12px 20px',
    backgroundColor: '#e5e5e5',
    color: '#1d1d1d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
