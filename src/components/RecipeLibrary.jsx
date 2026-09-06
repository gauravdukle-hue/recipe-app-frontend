import { useState, useEffect } from 'react';
import { getRecipes } from '../services/api';

// Names are typed in a hurry on a tablet, so capitalise for display rather
// than correcting what was saved. Harmless for Devanagari, which has no case.
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const TABS = [
  { key: 'mine', label: 'Mine' },
  { key: 'shared', label: 'Shared with me' },
  { key: 'all', label: 'Everyone' }
];

const HEADINGS = {
  mine: 'My recipes',
  shared: 'Shared with me',
  all: 'Every recipe'
};

const EMPTY = {
  mine: 'Nothing here yet. Record your first recipe and it will appear.',
  shared: 'Nobody has shared a recipe with you yet.',
  all: 'No recipes in the collection yet.'
};

const MicIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" />
  </svg>
);

const PenIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.8"
          strokeLinejoin="round" />
    <path d="M14.5 5.5 18.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function RecipeLibrary({ onCreateClick, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [view, setView] = useState('mine');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, [view]);

  // While something is transcribing, refresh quietly so the badge clears
  // itself. Nobody should have to reload to find out it finished.
  useEffect(() => {
    const waiting = recipes.some((r) => Number(r.audio_pending) > 0);
    if (!waiting) return undefined;
    const timer = setInterval(fetchRecipes, 15000);
    return () => clearInterval(timer);
  }, [recipes, view]);

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
    <div style={styles.page}>
      <header style={styles.head}>
        <div>
          <h2 style={styles.heading}>{HEADINGS[view]}</h2>
          <p style={styles.count}>
            {loading ? ' ' : `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`}
          </p>
        </div>
        <div style={styles.headActions}>
          <button onClick={() => onCreateClick('record')} style={styles.newButton}>
            <MicIcon />
            Record a recipe
          </button>
          <button onClick={() => onCreateClick('type')} style={styles.typeButton}>
            <PenIcon />
            Type a recipe
          </button>
        </div>
      </header>

      <nav style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{ ...styles.tab, ...(view === t.key ? styles.tabOn : {}) }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <p style={styles.quiet}>Loading…</p>
      ) : recipes.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>{EMPTY[view]}</p>
          {view === 'mine' && (
            <div style={styles.emptyActions}>
              <button onClick={() => onCreateClick('record')} style={styles.emptyButton}>
                <MicIcon />
                Record a recipe
              </button>
              <button onClick={() => onCreateClick('type')} style={styles.typeButton}>
                <PenIcon />
                Type a recipe
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul style={styles.grid}>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <button onClick={() => onSelectRecipe(recipe.id)} style={styles.card}>
                <span style={styles.cardTitle}>{titleCase(recipe.title)}</span>
                {/* The rule sits under the name the way it does on a written
                    recipe card, rather than decorating the tile. */}
                <span style={styles.rule} />
                <span style={styles.cardMeta}>{recipe.cuisine_tag || 'Recipe'}</span>
                {Number(recipe.audio_pending) > 0 ? (
                  <span style={{ ...styles.badge, ...styles.badgeWait }}>Transcribing…</span>
                ) : Number(recipe.audio_failed) > 0 ? (
                  <span style={{ ...styles.badge, ...styles.badgeBad }}>Needs attention</span>
                ) : null}
                {view !== 'mine' && recipe.owner_name && (
                  <span style={styles.cardBy}>{recipe.owner_name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const INK = '#1B2A4A';
const PAPER = '#FBFAF7';
const KOKUM = '#8E2B34';
const HAIRLINE = '#E4DFD6';
const MUTED = '#7A756C';

const serif = "ui-serif, 'New York', 'Iowan Old Style', Georgia, serif";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const styles = {
  page: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2rem 1.25rem 4rem',
    textAlign: 'left',
    backgroundColor: PAPER,
    minHeight: '100vh'
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.75rem'
  },
  heading: {
    fontFamily: serif,
    fontSize: '32px',
    fontWeight: '600',
    color: INK,
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  count: {
    fontFamily: sans,
    fontSize: '14px',
    color: MUTED,
    margin: '0.3rem 0 0 0',
    minHeight: '1em'
  },
  headActions: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  emptyActions: {
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  typeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: sans,
    fontSize: '15px',
    fontWeight: '600',
    color: INK,
    backgroundColor: 'transparent',
    border: `1px solid ${INK}`,
    borderRadius: '4px',
    padding: '13px 18px',
    minHeight: '46px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  },
  newButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: sans,
    fontSize: '15px',
    fontWeight: '600',
    color: PAPER,
    backgroundColor: INK,
    border: 'none',
    borderRadius: '4px',
    padding: '13px 20px',
    minHeight: '46px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  },
  tabs: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: `1px solid ${HAIRLINE}`,
    marginBottom: '1.75rem',
    overflowX: 'auto'
  },
  tab: {
    fontFamily: sans,
    fontSize: '15px',
    color: MUTED,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0 0 12px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent'
  },
  tabOn: {
    color: INK,
    borderBottomColor: KOKUM,
    fontWeight: '600'
  },
  grid: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    // Collapses to one column on a phone without needing a media query.
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    minHeight: '132px',
    textAlign: 'left',
    // Hairline and no shadow: cards in a recipe box, not floating tiles.
    backgroundColor: '#FFFFFF',
    border: `1px solid ${HAIRLINE}`,
    borderRadius: '3px',
    padding: '18px 18px 16px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  },
  cardTitle: {
    fontFamily: serif,
    fontSize: '21px',
    fontWeight: '600',
    color: INK,
    lineHeight: 1.25,
    letterSpacing: '-0.01em'
  },
  rule: {
    display: 'block',
    width: '34px',
    height: '2px',
    backgroundColor: KOKUM,
    margin: '12px 0 10px'
  },
  cardMeta: { fontFamily: sans, fontSize: '13px', color: MUTED },
  cardBy: { fontFamily: sans, fontSize: '13px', color: MUTED, marginTop: '2px' },
  badge: {
    fontFamily: sans,
    fontSize: '12px',
    marginTop: '8px',
    padding: '3px 8px',
    borderRadius: '3px'
  },
  badgeWait: { backgroundColor: '#EEF2F8', color: '#42557A' },
  badgeBad: { backgroundColor: '#F6EAE6', color: KOKUM },
  quiet: { fontFamily: sans, fontSize: '15px', color: MUTED },
  empty: {
    border: `1px dashed ${HAIRLINE}`,
    borderRadius: '3px',
    padding: '3rem 1.5rem',
    textAlign: 'center'
  },
  emptyText: {
    fontFamily: serif,
    fontSize: '18px',
    color: MUTED,
    margin: '0 0 1.25rem 0',
    lineHeight: 1.5
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: sans,
    fontSize: '15px',
    fontWeight: '600',
    color: PAPER,
    backgroundColor: KOKUM,
    border: 'none',
    borderRadius: '4px',
    padding: '13px 22px',
    cursor: 'pointer'
  }
};
