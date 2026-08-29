import { useState, useEffect } from 'react';
import { getRecipe } from '../services/api';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';

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

      <h1 style={styles.title}>{recipe.title}</h1>
      {recipe.cuisine_tag && <p style={styles.cuisine}>🏷️ {recipe.cuisine_tag}</p>}

      <h2>📸 Photos</h2>
      <PhotoGallery recipe_id={recipe_id} key={refreshPhotos} />

      {recipe.can_edit && (
        <PhotoUpload
          recipe_id={recipe_id}
          onPhotoAdded={() => setRefreshPhotos(refreshPhotos + 1)}
        />
      )}

      <h2>📦 Ingredients ({recipe.ingredients?.length || 0})</h2>
      <ul>
        {recipe.ingredients?.map((ing, i) => (
          <li key={i}>
            {ing.amount} {ing.unit} {ing.name}
          </li>
        ))}
      </ul>

      <h2>👣 Steps ({recipe.steps?.length || 0})</h2>
      <ol>
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
    margin: '0 auto'
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
