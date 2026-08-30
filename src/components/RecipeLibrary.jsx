import { useState, useEffect } from 'react';
import { getRecipes } from '../services/api';

export default function RecipeLibrary({ onCreateClick, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [view, setView] = useState('mine');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, [view]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipes(view);
      setRecipes(response.data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Recipes</h2>
          <p style={styles.subtitle}>{recipes.length} recipes</p>
        </div>
        <button onClick={onCreateClick} style={styles.createButton}>
          ➕ New Recipe
        </button>
      </div>

      <div style={styles.tabs}>
        {['mine', 'shared', 'all'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              ...styles.tab,
              ...(view === v ? styles.tabActive : styles.tabInactive)
            }}
          >
            {v === 'mine' ? 'My Recipes' : v === 'shared' ? 'Shared' : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : recipes.length === 0 ? (
        <p style={styles.empty}>No recipes yet</p>
      ) : (
        <div style={styles.grid}>
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              style={styles.card}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {recipe.photo_url && (
                <img src={recipe.photo_url} alt={recipe.title} style={styles.photo} />
              )}
              <div style={styles.cardContent}>
                <h3 style={styles.recipeTitle}>{recipe.title}</h3>
                <p style={styles.cuisine}>{recipe.cuisine_tag || 'Recipe'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1d1d1d', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '14px', color: '#999', margin: 0 },
  createButton: { padding: '10px 20px', backgroundColor: '#007AFF', color: 'white', fontSize: '15px', fontWeight: '600', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem' },
  tab: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { backgroundColor: '#1d1d1d', color: 'white' },
  tabInactive: { backgroundColor: '#e5e5e5', color: '#666' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' },
  photo: { width: '100%', height: '160px', objectFit: 'cover' },
  cardContent: { padding: '1.25rem' },
  recipeTitle: { fontSize: '16px', fontWeight: '600', color: '#1d1d1d', margin: '0 0 0.5rem 0' },
  cuisine: { fontSize: '13px', color: '#999', margin: 0 },
  loading: { textAlign: 'center', color: '#999', fontSize: '15px' },
  empty: { textAlign: 'center', color: '#999', fontSize: '15px' }
};
