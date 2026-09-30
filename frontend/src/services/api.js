import axios from 'axios';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically refresh expired token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and if we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');

      // If no refresh token or the request was to the refresh/login endpoint itself, fail immediately
      if (
        !refreshToken ||
        originalRequest.url.includes('/app/token/refresh/') ||
        originalRequest.url.includes('/app/login/')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/app/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state on failed refresh
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('ispremiumuser');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth services
export const loginUser = (credentials) =>
  apiClient.post('/app/login/', credentials);

export const registerUser = (userData) =>
  apiClient.post('/app/register/', userData);

// Prediction service
export const fetchPrediction = (predictionData) =>
  apiClient.post('/app/predict/', predictionData);

// Payment services
export const createPaymentOrder = (amount) =>
  apiClient.post('/app/create-order/', { amount });

export const verifyPayment = (paymentData) =>
  apiClient.post('/app/verify-payment/', paymentData);

// User details services
export const saveUserDetails = (data) =>
  apiClient.post('/app/user_details/', data);

export const fetchUserDetails = () =>
  apiClient.post('/app/fetch_user_details/', {});

export default apiClient;
