import { useState, useEffect } from 'react';
import { getAuthToken, setAuthToken } from './services/api';
import Login from './components/Login';
import RecipeForm from './components/RecipeForm';
import RecipeLibrary from './components/RecipeLibrary';
import RecipeDetail from './components/RecipeDetail';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('library');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setScreen('library');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setIsLoggedIn(false);
    setScreen('library');
  };

  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setScreen('detail');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={styles.app}>
      <nav style={styles.navbar}>
        <h1 onClick={() => setScreen('library')} style={styles.logo}>
          🍽️ Family Recipes
        </h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>

      <div style={styles.content}>
        {screen === 'library' && (
          <RecipeLibrary 
            onCreateClick={() => setScreen('create')}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {screen === 'create' && (
          <RecipeForm onBack={() => setScreen('library')} />
        )}

        {screen === 'detail' && selectedRecipeId && (
          <RecipeDetail 
            recipe_id={selectedRecipeId}
            onBack={() => setScreen('library')}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  app: { 
    minHeight: '100vh', 
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  navbar: { 
    backgroundColor: '#ffffff',
    color: '#1d1d1d',
    padding: '1rem 2rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  logo: { 
    fontSize: '24px', 
    cursor: 'pointer', 
    margin: 0,
    fontWeight: '600',
    transition: 'opacity 0.2s'
  },
  logoutButton: { 
    padding: '8px 16px', 
    backgroundColor: '#ff3b30', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  content: { 
    padding: '2rem'
  }
};
