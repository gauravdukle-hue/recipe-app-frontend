import { useState, useEffect } from 'react';
import { getRecipes } from '../services/api';

export default function RecipeLibrary({ onBack, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [view, setView] = useState('mine');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [view]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await getRecipes(view);
      setRecipes(res.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Error loading recipes');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🍽️ Recipe Library</h1>
        <button onClick={onBack} style={styles.backButton}>
          + Add Recipe
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setView('mine')}
          style={{
            ...styles.tab,
            backgroundColor: view === 'mine' ? '#3498db' : '#95a5a6'
          }}
        >
          📝 My Recipes
        </button>
        <button
          onClick={() => setView('shared')}
          style={{
            ...styles.tab,
            backgroundColor: view === 'shared' ? '#3498db' : '#95a5a6'
          }}
        >
          👥 Shared with Me
        </button>
        <button
          onClick={() => setView('all')}
          style={{
            ...styles.tab,
            backgroundColor: view === 'all' ? '#3498db' : '#95a5a6'
          }}
        >
          🌍 All Recipes
        </button>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p style={styles.empty}>No recipes yet. Create one to get started!</p>
      ) : (
        <div style={styles.recipeList}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              style={styles.recipeCard}
              onClick={() => onSelectRecipe(recipe.id)}
            >
              <h3 style={styles.recipeName}>{recipe.title}</h3>
              {recipe.cuisine_tag && (
                <p style={styles.cuisine}>🏷️ {recipe.cuisine_tag}</p>
              )}
              <p style={styles.owner}>by {recipe.owner_name}</p>
              <p style={styles.ingredients}>
                📦 {recipe.ingredient_count} ingredients
              </p>
              <p style={styles.steps}>
                👣 {recipe.step_count} steps
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    margin: 0
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  },
  tab: {
    flex: 1,
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#7f8c8d'
  },
  empty: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#7f8c8d',
    padding: '2rem'
  },
  recipeList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  recipeCard: {
    backgroundColor: '#ecf0f1',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  recipeName: {
    fontSize: '18px',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    margin: 0
  },
  cuisine: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '0.5rem',
    margin: 0
  },
  owner: {
    fontSize: '12px',
    color: '#95a5a6',
    marginBottom: '1rem',
    fontStyle: 'italic',
    margin: 0
  },
  ingredients: {
    fontSize: '14px',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    margin: 0
  },
  steps: {
    fontSize: '14px',
    color: '#2c3e50',
    margin: 0
  }
};
