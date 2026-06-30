import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mh_token");
      localStorage.removeItem("mh_user");
    }
    return Promise.reject(error);
  }
);

export function uploadUrl(filename) {
  return `${API_BASE_URL}/upload/${filename}`;
}

export default api;
