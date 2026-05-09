import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Experts
export const fetchExperts = (params) =>
  api.get('/experts', { params }).then((r) => r.data);

export const fetchExpert = (id) =>
  api.get(`/experts/${id}`).then((r) => r.data);

export const fetchCategories = () =>
  api.get('/experts/categories').then((r) => r.data);

// Bookings
export const createBooking = (data) =>
  api.post('/bookings', data).then((r) => r.data);

export const fetchBookingsByEmail = (email) =>
  api.get('/bookings', { params: { email } }).then((r) => r.data);

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data);

export default api;
