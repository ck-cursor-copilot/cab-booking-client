import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API Functions
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');
export const verifyToken = () => api.post('/auth/verify');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// User API Functions
export const getUserProfile = (userId) => api.get(`/user/profile/${userId}`);
export const updateUserProfile = (userId, data) => api.put(`/user/profile/${userId}`, data);
export const getRideHistory = (userId) => api.get(`/user/ride-history/${userId}`);

// Booking API Functions
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getUserBookings = () => api.get('/bookings/user').then(response => response.data);
export const getDriverBookings = () => api.get('/bookings/driver').then(response => response.data);
export const acceptBooking = (bookingId) => api.post(`/bookings/${bookingId}/accept`);
export const startTrip = (bookingId) => api.post(`/bookings/${bookingId}/start`);
export const completeTrip = (bookingId) => api.post(`/bookings/${bookingId}/complete`);
export const cancelBooking = (bookingId) => api.post(`/bookings/${bookingId}/cancel`);

// Cab API Functions
export const createCab = (cabData) => api.post('/cabs', cabData);
export const getAvailableCabs = () => api.get('/cabs/available');
export const getCabDetails = (cabId) => api.get(`/cabs/${cabId}`);
export const getDriverCabs = (driverId) => api.get(`/cabs/driver/${driverId}`);
export const updateCabStatus = (cabId, status) => api.put(`/cabs/${cabId}/status`, { status });

// Driver API Functions
export const toggleAvailability = (isAvailable, driverId) => 
  api.put(`/driver/availability/${driverId}`, { isAvailable });
export const getCurrentTrip = (driverId) => api.get(`/driver/current-trip/${driverId}`);
export const getDriverEarnings = (driverId) => api.get(`/driver/earnings/${driverId}`);

// Payment API Functions
export const createPayment = (paymentData) => api.post('/payments', paymentData);
export const getPaymentHistory = () => api.get('/payments');
export const processPayment = (paymentId) => api.post(`/payments/${paymentId}/process`);

// Notification API Functions
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);
export const deleteNotification = (notificationId) => api.delete(`/notifications/${notificationId}`);

export default api; 