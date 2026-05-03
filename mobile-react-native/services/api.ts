import axios from 'axios';
import { Platform } from 'react-native';

// Se estiver no Android Emulator, use 10.0.2.2. Se estiver no iOS ou Web, localhost.
const baseURL = Platform.OS === 'android' ? 'http://192.168.0.7:3000' : 'http://localhost:3000';

export const api = axios.create({
  baseURL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
