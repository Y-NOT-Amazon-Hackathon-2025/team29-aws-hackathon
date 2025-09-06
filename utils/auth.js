// JWT 토큰 디코딩 함수
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // 밀리초로 변환
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

// 토큰 관리 유틸리티
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
    
    // 토큰 만료 시간 저장
    const expiryTime = decodeToken(token);
    if (expiryTime) {
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
  }
};

export const setTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // 토큰 만료 시간 저장
    const expiryTime = decodeToken(accessToken);
    if (expiryTime) {
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  }
};

// 토큰 만료 여부 확인
export const isTokenExpired = () => {
  if (typeof window !== 'undefined') {
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (!expiryTime) return true;
    
    return Date.now() >= parseInt(expiryTime);
  }
  return true;
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token && !isTokenExpired();
};

// Axios 설정
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 기본 axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // 토큰 만료 사전 체크
    if (token && isTokenExpired()) {
      console.log('Token expired, removing and redirecting to login');
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Token expired'));
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
