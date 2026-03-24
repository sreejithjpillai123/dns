import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// ─── Menus ───────────────────────────────────────────────────────────────────

export const getMenuTree = () => api.get('/menus').then(r => r.data);

export const getMenu = (id) => api.get(`/menus/${id}`).then(r => r.data);

export const createMenu = (data) => api.post('/menus', data).then(r => r.data);

export const updateMenu = (id, data) => api.put(`/menus/${id}`, data).then(r => r.data);

export const deleteMenu = (id) => api.delete(`/menus/${id}`).then(r => r.data);

// ─── Items ────────────────────────────────────────────────────────────────────

export const createItem = (menuId, data) =>
  api.post(`/menus/${menuId}/items`, data).then(r => r.data);

export const updateItem = (menuId, itemId, data) =>
  api.put(`/menus/${menuId}/items/${itemId}`, data).then(r => r.data);

export const deleteItem = (menuId, itemId) =>
  api.delete(`/menus/${menuId}/items/${itemId}`).then(r => r.data);
