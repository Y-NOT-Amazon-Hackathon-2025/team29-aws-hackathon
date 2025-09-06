import { useState, useEffect } from 'react';

// 공통 스타일 정의
export const commonStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  
  button: {
    primary: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    
    secondary: {
      padding: '12px 24px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    
    success: {
      padding: '12px 24px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    }
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box' as const
  },
  
  modal: {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    
    content: {
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '16px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto' as const
    }
  },
  
  badge: {
    category: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    }
  }
};

// 공통 유틸리티 함수들
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

export const getDaysUntilDate = (targetDate: string): number => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (daysUntil: number): string => {
  if (daysUntil < 0) return '#6c757d'; // 지난 날짜
  if (daysUntil <= 7) return '#dc3545'; // 임박
  if (daysUntil <= 30) return '#ffc107'; // 한 달 이내
  return '#28a745'; // 여유
};

export const getCertTypeStyle = (type: string) => {
  const styles = {
    '국제': { backgroundColor: '#f3e5f5', color: '#7b1fa2' },
    '국가공인': { backgroundColor: '#e8f5e8', color: '#388e3c' },
    '민간': { backgroundColor: '#fff3e0', color: '#f57c00' }
  };
  
  return styles[type as keyof typeof styles] || styles['민간'];
};

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
};

// 사용자 인증 관련 공통 함수
export const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userData = storage.get('user');
    if (userData) {
      setUser(userData);
    }
  }, []);
  
  const logout = (router: any) => {
    storage.remove('accessToken');
    storage.remove('user');
    setUser(null);
    router.replace('/');
  };
  
  return { user, setUser, logout };
};