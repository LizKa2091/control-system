
import axios from 'axios';
import { useAuth } from '../context/useAuth';

export const useApi = () => {
   const { token, logout } = useAuth();

   const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      withCredentials: true,
   });

   instance.interceptors.request.use((config) => {
      if (token) {
         config.headers = config.headers ?? {};
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   });

   instance.interceptors.response.use(
      (response) => response,
      (error) => {
         if (error?.response?.status === 401) logout();
         return Promise.reject(error);
      }
   );

   return instance;
};