import { useState, useEffect } from 'react';
import { getAuthToken, setAuthToken } from './services/api';
import Login from './components/Login';
import RecipeForm from './components/RecipeForm';
import RecipeLibrary from './components/RecipeLibrary';
import RecipeDetail from './components/RecipeDetail';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('library');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setUser({ token });
    }
  }, []);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleHome = () => {
    setScreen('library');
    setSelectedRecipeId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <button onClick={handleHome} style={styles.homeButton}>
          🍽️ Family Recipes
        </button>
        <button
          onClick={() => {
            setAuthToken(null);
            setUser(null);
          }}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      {screen === 'library' && (
        <RecipeLibrary
          onBack={() => setScreen('create')}
          onSelectRecipe={(id) => {
            setSelectedRecipeId(id);
            setScreen('detail');
          }}
        />
      )}

      {screen === 'create' && (
        <RecipeForm
          onRecipeCreated={(id) => {
            setSelectedRecipeId(id);
            setScreen('detail');
          }}
          onCancel={() => setScreen('library')}
        />
      )}

      {screen === 'detail' && (
        <RecipeDetail
          recipe_id={selectedRecipeId}
          onBack={() => setScreen('library')}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  navbar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  homeButton: {
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};
