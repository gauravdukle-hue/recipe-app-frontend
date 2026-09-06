import { useState, useEffect } from 'react';
import api, { getAuthToken, setAuthToken } from './services/api';
import Login from './components/Login';
import Welcome from './components/Welcome';
import RecipeForm from './components/RecipeForm';
import RecipeLibrary from './components/RecipeLibrary';
import RecipeDetail from './components/RecipeDetail';
import './App.css';

export default function App() {
  // The app had no routing, so refreshing a recipe threw you back to the
  // library — exactly when you reload most, waiting on a transcription.
  // The hash keeps your place and makes the browser Back button work.
  const readHash = () => {
    const h = window.location.hash || '';
    const m = h.match(/^#\/recipe\/(\d+)/);
    if (m) return { screen: 'detail', id: Number(m[1]), view: 'mine' };
    if (h.startsWith('#/new')) return { screen: 'create', id: null, view: 'mine' };
    // The tab lives in the URL too, so a refresh keeps you on Everyone rather
    // than bouncing back to Mine.
    const tab = h.replace('#/', '');
    const view = ['mine', 'shared', 'all'].includes(tab) ? tab : 'mine';
    return { screen: 'library', id: null, view };
  };

  const initial = readHash();
  const [screen, setScreen] = useState(initial.screen);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initial.id);
  const [view, setView] = useState(initial.view);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [createMode, setCreateMode] = useState('record');

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
    setShowWelcome(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    window.location.hash = '';
    setIsLoggedIn(false);
    setScreen('library');
  };

  // Google supplies the name at sign-in, so this is filled in without anyone
  // typing it. Failure is silent — a missing greeting is not worth an error.
  useEffect(() => {
    if (!isLoggedIn) {
      setUserName('');
      return;
    }
    api.get('/auth/me')
      .then((res) => setUserName(res.data.name || ''))
      .catch(() => setUserName(''));
  }, [isLoggedIn]);

  useEffect(() => {
    const onHash = () => {
      const next = readHash();
      setScreen(next.screen);
      setSelectedRecipeId(next.id);
      if (next.screen === 'library') setView(next.view);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goLibrary = () => {
    window.location.hash = view === 'mine' ? '' : `#/${view}`;
    setSelectedRecipeId(null);
    setScreen('library');
  };

  const changeView = (next) => {
    window.location.hash = next === 'mine' ? '' : `#/${next}`;
    setView(next);
  };

  const handleSelectRecipe = (recipeId) => {
    window.location.hash = `#/recipe/${recipeId}`;
    setSelectedRecipeId(recipeId);
    setScreen('detail');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Shown once on sign-in only — not on every visit with a stored token, which
  // would make it an obstacle rather than a welcome.
  if (showWelcome) {
    return <Welcome name={userName} onDone={() => setShowWelcome(false)} />;
  }

  return (
    <div style={styles.app}>
      <nav style={styles.navbar}>
        <h1 onClick={() => setScreen('library')} style={styles.logo}>
          Family Recipes
        </h1>
        <div style={styles.navRight}>
          {userName && <span style={styles.greeting}>Hi, {userName.split(' ')[0]}</span>}
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {screen === 'library' && (
          <RecipeLibrary 
            view={view}
            onViewChange={changeView}
            onCreateClick={(mode) => { setCreateMode(mode); window.location.hash = '#/new'; setScreen('create'); }}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {screen === 'create' && (
          <RecipeForm mode={createMode} onBack={goLibrary} />
        )}

        {screen === 'detail' && selectedRecipeId && (
          <RecipeDetail 
            recipe_id={selectedRecipeId}
            onBack={goLibrary}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  greeting: {
    fontSize: '14px',
    color: '#7A756C',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  app: { 
    minHeight: '100vh',
    backgroundColor: '#FBFAF7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  navbar: {
    backgroundColor: '#FBFAF7',
    color: '#1B2A4A',
    padding: '1.1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Hairline instead of a shadow — the header sits on the page rather than
    // floating above it.
    borderBottom: '1px solid #E4DFD6'
  },
  logo: {
    fontFamily: "ui-serif, 'New York', 'Iowan Old Style', Georgia, serif",
    fontSize: '21px',
    cursor: 'pointer',
    margin: 0,
    fontWeight: '600',
    color: '#1B2A4A',
    letterSpacing: '-0.01em'
  },
  logoutButton: {
    // Logging out is not a destructive action, so it stops shouting in red.
    padding: '8px 4px',
    backgroundColor: 'transparent',
    color: '#7A756C',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  content: {
    padding: 0
  }
};
