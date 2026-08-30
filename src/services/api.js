import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem('auth_token', token);
  } else {
    sessionStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return sessionStorage.getItem('auth_token');
};

export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (email, password, name) => api.post('/auth/signup', { email, password, name });
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const signupUser = (email, password, name) => api.post('/auth/signup', { email, password, name });
export const createRecipe = (title, description, cuisine_tag) => api.post('/recipes', { title, description, cuisine_tag });
export const getRecipes = (view = 'all') => api.get('/recipes', { params: { view } });
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const getRecipeDetail = (id) => api.get(`/recipes/${id}`);
export const uploadPhoto = (recipe_id, photo_data, caption) => api.post(`/recipes/${recipe_id}/photos`, { photo_data, caption });

export default api;
