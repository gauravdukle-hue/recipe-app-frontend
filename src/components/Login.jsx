import { useState } from 'react';
import { login, signup, setAuthToken } from '../services/api';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isSignup) {
        response = await signup(email, password, name);
      } else {
        response = await login(email, password);
      }
      
      // The backend returns the JWT as `auth_token`. Reading `token` here
      // yielded undefined, which localStorage stored as the 9-character
      // string "undefined" and sent as `Bearer undefined` on every request.
      const token = response.data.auth_token || response.data.token;

      if (!token) {
        setError('Login succeeded but no token was returned. Try again.');
        return;
      }

      setAuthToken(token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🍽️</h1>
          <h2 style={styles.heading}>Family Recipes</h2>
          <p style={styles.subtitle}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignup && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={styles.toggle}>
          <p style={styles.toggleText}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignup(!isSignup)}
              style={styles.toggleButton}
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '2rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '3rem 2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '48px',
    margin: '0 0 1rem 0'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1d1d1d',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#999',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.5rem'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '1rem',
    border: '1px solid #ffcdd2'
  },
  toggle: {
    textAlign: 'center'
  },
  toggleText: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#007AFF',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '0.5rem',
    fontSize: '14px',
    transition: 'opacity 0.2s'
  }
};
