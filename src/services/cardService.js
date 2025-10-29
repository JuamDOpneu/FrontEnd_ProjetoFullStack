import api from './api';

// GET (Todos ou com filtro)
export const getCards = (params) => {
  return api.get('/cards', { params });
};

// GET (Por ID)
export const getCardById = (id) => {
  return api.get(`/cards/${id}`);
};

// POST
export const createCard = (cardData) => {
  return api.post('/cards', cardData);
};

// PUT
export const updateCard = (id, cardData) => {
  return api.put(`/cards/${id}`, cardData);
};

// DELETE
export const deleteCard = (id) => {
  return api.delete(`/cards/${id}`);
};