import { useState } from 'react';
import { login, signup, setAuthToken } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isSignup) {
        res = await signup(email, password, name);
      } else {
        res = await login(email, password);
      }

      setAuthToken(res.data.auth_token);
      onLoginSuccess(res.data);
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      
      let errorMsg = 'Unknown error occurred';
      
      if (error.response?.data?.details) {
        errorMsg = error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert('Error: ' + errorMsg);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍽️ Family Recipe App</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>
            {isSignup ? 'Create Account' : 'Login'}
          </h2>

          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
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

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={styles.toggleButton}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#ecf0f1'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formTitle: {
    marginBottom: '1rem',
    color: '#2c3e50'
  },
  input: {
    padding: '12px',
    marginBottom: '1rem',
    fontSize: '16px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px'
  },
  submitButton: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  toggle: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '14px'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    marginLeft: '0.5rem',
    textDecoration: 'underline'
  }
};
