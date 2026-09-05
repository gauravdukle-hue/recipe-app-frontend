import { useEffect, useState } from 'react';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Shown once, straight after signing in, then it gets out of the way.
 * Dismisses itself after a couple of seconds, or on a tap for anyone who
 * doesn't want to wait.
 */
export default function Welcome({ name, onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 1900);
    const finish = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(hold);
      clearTimeout(finish);
    };
  }, [onDone]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onDone, 400);
  };

  return (
    <div
      onClick={dismiss}
      style={{ ...styles.screen, opacity: leaving ? 0 : 1 }}
    >
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.inner}>
        <div style={{ ...styles.mark, animationDelay: '0ms' }}>🍽️</div>
        <h1 style={{ ...styles.greeting, animationDelay: '120ms' }}>
          {greetingFor(new Date().getHours())}
          {name ? `,` : ''}
        </h1>
        {name && (
          <h1 style={{ ...styles.name, animationDelay: '240ms' }}>
            {name.split(' ')[0]}
          </h1>
        )}
        <p style={{ ...styles.sub, animationDelay: '420ms' }}>Family Recipes</p>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    transition: 'opacity 500ms ease',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  },
  inner: { textAlign: 'center', padding: '0 2rem' },
  mark: {
    fontSize: '44px',
    marginBottom: '1.5rem',
    animation: 'riseIn 600ms ease both'
  },
  greeting: {
    fontSize: '34px',
    fontWeight: '400',
    color: '#8a8a8e',
    margin: 0,
    letterSpacing: '-0.02em',
    animation: 'riseIn 600ms ease both'
  },
  name: {
    fontSize: '46px',
    fontWeight: '700',
    color: '#1d1d1d',
    margin: '0.15rem 0 0 0',
    letterSpacing: '-0.03em',
    animation: 'riseIn 600ms ease both'
  },
  sub: {
    fontSize: '14px',
    color: '#b0b0b5',
    marginTop: '1.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    animation: 'riseIn 600ms ease both'
  }
};
