import { useState, useEffect } from 'react';
import api, { getRecipe, getReactions, toggleReaction, getRecipeAudio, deleteRecipe } from '../services/api';
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
  const [reactions, setReactions] = useState({ like: 0, love: 0, mine: [] });
  const [audio, setAudio] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRecipe();
    fetchReactions();
    fetchAudio();
  }, [recipe_id]);

  const fetchAudio = async () => {
    try {
      const res = await getRecipeAudio(recipe_id);
      setAudio(res.data);
    } catch {
      // Status is a nicety; never let it stop the recipe rendering.
    }
  };

  // A recipe whose text is still the placeholder is waiting on, or has failed,
  // transcription. Say so plainly instead of showing the placeholder itself.
  const pending = /transcription pending/i.test(recipe?.description || '');
  const rec = audio[0];
  const transcriptionNote = !pending || !rec
    ? null
    : rec.transcribe_error
      ? { tone: 'bad', text: rec.transcribe_error }
      : rec.transcribed_at
        ? { tone: 'bad', text: 'Transcription finished but produced no text.' }
        : { tone: 'wait', text: 'Transcribing the recording. This usually takes under a minute.' };

  const fetchReactions = async () => {
    try {
      const res = await getReactions(recipe_id);
      setReactions(res.data);
    } catch {
      // A failed reaction fetch shouldn't stop the recipe rendering.
    }
  };

  const react = async (kind) => {
    // Optimistic: the count updates immediately, then reconciles with the
    // server response. A tap that appears to do nothing feels broken.
    const active = reactions.mine.includes(kind);
    setReactions((r) => ({
      ...r,
      [kind]: Math.max(0, r[kind] + (active ? -1 : 1)),
      mine: active ? r.mine.filter((m) => m !== kind) : [...r.mine, kind]
    }));
    try {
      const res = await toggleReaction(recipe_id, kind);
      setReactions(res.data);
    } catch {
      fetchReactions();
    }
  };

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

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(recipe_id);
      onBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete this recipe.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading recipe...</p>;
  if (!recipe) return <p style={{ padding: '2rem' }}>{error || 'Recipe not found'}</p>;

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back</button>

      {editing && recipe.can_edit ? (
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
          <p style={styles.cuisine}>
            {[recipe.cuisine_tag, recipe.owner_name && `Recorded by ${recipe.owner_name}`]
              .filter(Boolean)
              .join(' \u00B7 ')}
          </p>

          <div style={styles.reactions}>
            {[
              { kind: 'like', icon: '\u{1F44D}', label: 'Like this recipe' },
              { kind: 'love', icon: '\u2764\uFE0F', label: 'Love this recipe' }
            ].map(({ kind, icon, label }) => (
              <button
                key={kind}
                onClick={() => react(kind)}
                aria-label={label}
                title={label}
                style={{
                  ...styles.reactionButton,
                  ...(reactions.mine.includes(kind) ? styles.reactionActive : {})
                }}
              >
                <span style={styles.reactionIcon}>{icon}</span>
                {reactions[kind] > 0 && (
                  <span style={styles.reactionCount}>{reactions[kind]}</span>
                )}
              </button>
            ))}
          </div>

          {transcriptionNote && (
            <div
              style={{
                ...styles.note,
                ...(transcriptionNote.tone === 'bad' ? styles.noteBad : styles.noteWait)
              }}
            >
              {transcriptionNote.text}
            </div>
          )}

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

          {recipe.glossary?.length > 0 && (
            <>
              <h2 style={styles.heading}>What the words mean</h2>
              <dl style={styles.glossary}>
                {recipe.glossary.map((g, i) => (
                  <div key={i} style={styles.glossaryRow}>
                    <dt style={styles.term}>{g.term}</dt>
                    <dd style={styles.meaning}>{g.meaning}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

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

            {/* The backend already refuses an edit from anyone but the owner.
                Hiding the button means people find that out now rather than
                after retyping a whole recipe. */}
            {recipe.can_edit && (
              <button onClick={startEdit} style={styles.secondaryButton}>
                Edit recipe
              </button>
            )}
          </div>

          {/* Kept apart from the other actions and deliberately quiet. Older
              relatives on tablets scroll past these buttons, and a recording
              can be the only one anybody made of a person cooking. */}
          {recipe.can_edit && (
            <div style={styles.dangerZone}>
              {confirmDelete ? (
                <div style={styles.confirmBox}>
                  <p style={styles.confirmText}>
                    Delete <strong>{titleCase(recipe.title)}</strong>? The recording goes with it.
                  </p>
                  <div style={styles.confirmRow}>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={styles.secondaryButton}
                    >
                      Keep it
                    </button>
                    <button onClick={remove} disabled={deleting} style={styles.deleteConfirm}>
                      {deleting ? 'Deleting...' : 'Yes, delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} style={styles.deleteLink}>
                  Delete this recipe
                </button>
              )}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}
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
  cuisine: { fontSize: '14px', color: '#7f8c8d', marginBottom: '1.5rem' },
  heading: {
    fontSize: '20px',
    color: '#2c3e50',
    marginTop: '2rem',
    marginBottom: '0.75rem'
  },
  list: { paddingLeft: '1.5rem', lineHeight: '1.9', fontSize: '17px', margin: 0 },
  note: {
    padding: '14px 16px',
    borderRadius: '10px',
    fontSize: '15px',
    lineHeight: 1.5,
    marginBottom: '0.5rem'
  },
  noteWait: { backgroundColor: '#eef4fb', color: '#20486e' },
  noteBad: { backgroundColor: '#fdf0e6', color: '#8a4b00' },
  glossary: { margin: 0, fontSize: '16px' },
  glossaryRow: {
    display: 'flex',
    gap: '0.75rem',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'baseline'
  },
  term: { fontWeight: '600', minWidth: '140px', color: '#2c3e50' },
  meaning: { margin: 0, color: '#555' },
  reactions: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '-1rem',
    marginBottom: '1.5rem'
  },
  reactionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    // Comfortable target for older hands on a tablet.
    padding: '10px 16px',
    minHeight: '44px',
    backgroundColor: '#f2f2f2',
    border: '1px solid #e5e5e5',
    borderRadius: '22px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  },
  reactionActive: {
    backgroundColor: '#e3f0ff',
    borderColor: '#007AFF'
  },
  reactionIcon: { fontSize: '20px', lineHeight: 1 },
  reactionCount: { fontSize: '15px', fontWeight: '600', color: '#1d1d1d' },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  dangerZone: {
    marginTop: '3rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #f0f0f0'
  },
  deleteLink: {
    background: 'none',
    border: 'none',
    color: '#9a9a9a',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    textDecoration: 'underline'
  },
  confirmBox: {
    backgroundColor: '#fdf0e6',
    borderRadius: '10px',
    padding: '16px'
  },
  confirmText: { margin: '0 0 0.9rem 0', fontSize: '15px', color: '#8a4b00' },
  confirmRow: { display: 'flex', gap: '0.75rem' },
  deleteConfirm: {
    padding: '12px 20px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
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
