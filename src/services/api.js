import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (email, password, name) => api.post('/auth/signup', { email, password, name });
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const googleLogin = (credential) => api.post('/auth/google', { credential });
export const signupUser = (email, password, name) => api.post('/auth/signup', { email, password, name });
export const createRecipe = (title, description, cuisine_tag) => api.post('/recipes', { title, description, cuisine_tag });
export const getRecipes = (view = 'all') => api.get('/recipes', { params: { view } });
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);
export const getShares = (id) => api.get(`/recipes/${id}/shares`);
export const shareRecipe = (id, email) => api.post(`/recipes/${id}/shares`, { email });
export const unshareRecipe = (id, userId) => api.delete(`/recipes/${id}/shares/${userId}`);
export const getRecipeDetail = (id) => api.get(`/recipes/${id}`);
export const uploadPhoto = (recipe_id, photo_data, caption) => api.post(`/recipes/${recipe_id}/photos`, { photo_data, caption });

// --- Audio ----------------------------------------------------------------

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the recording.'));
    reader.readAsDataURL(blob);
  });

export const uploadAudio = async (recipe_id, blob, duration_seconds, language) => {
  const audio_data = await blobToBase64(blob);
  return api.post(`/audio/${recipe_id}`, {
    audio_data,
    duration_seconds,
    sample_rate: 16000,
    language: language || 'kok'
  });
};

export const getReactions = (recipe_id) => api.get(`/recipes/${recipe_id}/reactions`);
export const toggleReaction = (recipe_id, reaction) =>
  api.post(`/recipes/${recipe_id}/reactions`, { reaction });

export const getRecipeAudio = (recipe_id) => api.get(`/audio/${recipe_id}`);
export const getAudioFile = (audio_id) => api.get(`/audio/file/${audio_id}`);

export default api;
