import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Sesuaikan dengan URL backend Laravel Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;