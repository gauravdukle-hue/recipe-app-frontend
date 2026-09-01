import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PhotoGallery({ recipe_id, onCount }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [recipe_id]);

  const fetchPhotos = async () => {
    try {
      const res = await api.get(`/recipes/${recipe_id}/photos`);
      setPhotos(res.data);
      // Let the parent decide whether to show a Photos section at all.
      if (onCount) onCount(res.data.length);
    } catch (error) {
      console.error('Error loading photos:', error);
      if (onCount) onCount(0);
    }
    setLoading(false);
  };

  // No "No photos yet" placeholder — the parent hides the whole section
  // when there is nothing to show.
  if (loading || photos.length === 0) return null;

  return (
    <div style={styles.gallery}>
      {photos.map((photo) => (
        <div key={photo.id} style={styles.photoCard}>
          <img src={photo.photo_data} alt={photo.caption || ''} style={styles.img} />
          {photo.caption && <p style={styles.caption}>{photo.caption}</p>}
        </div>
      ))}
    </div>
  );
}

const styles = {
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  photoCard: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  img: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  caption: {
    padding: '0.5rem',
    backgroundColor: '#ecf0f1',
    fontSize: '12px',
    margin: 0
  }
};
