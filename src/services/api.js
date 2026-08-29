import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    sessionStorage.setItem('auth_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    sessionStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => sessionStorage.getItem('auth_token');

export const signup = (email, password, name) =>
  api.post('/auth/signup', { email, password, name });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const createRecipe = (title, description, cuisine_tag) =>
  api.post('/recipes', { title, description, cuisine_tag });

export const getRecipes = (view = 'mine') =>
  api.get(`/recipes?view=${view}`);

export const getRecipe = (id) =>
  api.get(`/recipes/${id}`);

export default api;
