import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.163:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động gắn Token vào từng request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi tập trung (ví dụ 401 - hết hạn token)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // logic redirect login ở đây
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },
  register: (userData) => api.post('/auth/register', userData),
};

export const bookingService = {
  getServices: () => api.get('/services'),
  getCategories: () => api.get('/categories'),
  getStaffs: (serviceId) => serviceId ? api.get(`/staffs?serviceId=${serviceId}`) : api.get('/staffs'),
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  getBusySlots: (staffId, date) => api.get(`/bookings/busy-slots?staffId=${staffId}&date=${date}`),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  complete: (id) => api.patch(`/bookings/${id}/complete`),
  refund: (id, reason) => api.patch(`/bookings/${id}/refund`, { reason }),
  // Service management endpoints
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.patch(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
};

export const staffService = {
  getSchedules: (staffId) => api.get(`/staffs/${staffId}/schedules`),
  createSchedule: (staffId, scheduleData) => api.post(`/staffs/${staffId}/schedules`, scheduleData),
  updateSchedule: (staffId, scheduleId, scheduleData) => api.patch(`/staffs/${staffId}/schedules/${scheduleId}`, scheduleData),
  deleteSchedule: (staffId, scheduleId) => api.delete(`/staffs/${staffId}/schedules/${scheduleId}`),
};

export const paymentService = {
  initiate: (bookingId, method, amount) => api.post('/payments/initiate', { bookingId, method, amount }),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAllAsRead: () => api.patch('/notifications/read'),
  deleteAll: () => api.delete('/notifications'),
};

export default api;
