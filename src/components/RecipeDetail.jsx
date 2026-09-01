import { useState, useEffect } from 'react';
import { getRecipe } from '../services/api';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';

// Recipe names are typed in a hurry on a tablet, so capitalise for display
// rather than correcting what was saved. Harmless for Devanagari, which has
// no case.
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function RecipeDetail({ recipe_id, onBack }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshPhotos, setRefreshPhotos] = useState(0);

  useEffect(() => {
    fetchRecipe();
  }, [recipe_id]);

  const fetchRecipe = async () => {
    try {
      const res = await getRecipe(recipe_id);
      setRecipe(res.data);
    } catch (error) {
      alert('Error loading recipe');
    }
    setLoading(false);
  };

  if (loading) return <p>Loading recipe...</p>;
  if (!recipe) return <p>Recipe not found</p>;

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back
      </button>

      <h1 style={styles.title}>{titleCase(recipe.title)}</h1>
      {recipe.cuisine_tag && <p style={styles.cuisine}>🏷️ {recipe.cuisine_tag}</p>}

      <h2 style={styles.heading}>📸 Photos</h2>
      <PhotoGallery recipe_id={recipe_id} key={refreshPhotos} />

      {recipe.can_edit && (
        <PhotoUpload
          recipe_id={recipe_id}
          onPhotoAdded={() => setRefreshPhotos(refreshPhotos + 1)}
        />
      )}

      <h2 style={styles.heading}>🥣 Ingredients ({recipe.ingredients?.length || 0})</h2>
      <ul style={styles.list}>
        {recipe.ingredients?.map((ing, i) => (
          <li key={i}>
            {ing.amount} {ing.unit} {ing.name}
          </li>
        ))}
      </ul>

      <h2 style={styles.heading}>🥄 Steps ({recipe.steps?.length || 0})</h2>
      <ol style={styles.list}>
        {recipe.steps?.map((step, i) => (
          <li key={i}>{step.instruction}</li>
        ))}
      </ol>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    // A parent stylesheet centres everything; the lists were left-aligned
    // inside centred blocks, which read as ragged. Anchor the whole view left.
    textAlign: 'left'
  },
  heading: {
    fontSize: '20px',
    color: '#2c3e50',
    marginTop: '2rem',
    marginBottom: '0.75rem'
  },
  list: {
    paddingLeft: '1.5rem',
    lineHeight: '1.9',
    fontSize: '17px',
    margin: 0
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  cuisine: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '2rem'
  }
};
