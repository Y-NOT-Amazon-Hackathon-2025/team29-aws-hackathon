import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, isTokenExpired, removeToken } from '../utils/auth';
import api from '../utils/auth';

export const useTokenMonitor = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const router = useRouter();

  // 토큰 만료까지 남은 시간 계산 (분 단위)
  const getTokenTimeLeft = () => {
    if (typeof window !== 'undefined') {
      const expiryTime = localStorage.getItem('tokenExpiry');
      if (!expiryTime) return 0;

      const timeLeft = parseInt(expiryTime) - Date.now();
      return Math.max(0, Math.floor(timeLeft / (1000 * 60))); // 분 단위
    }
    return 0;
  };

  // 세션 시작 시간부터 경과된 시간 확인 (24시간 체크용)
  const getSessionElapsedHours = () => {
    if (!sessionStartTime) return 0;
    return (Date.now() - sessionStartTime) / (1000 * 60 * 60); // 시간 단위
  };

  // Refresh Token으로 토큰 갱신
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // 24시간 경과 체크
      if (getSessionElapsedHours() >= 24) {
        console.log('24 hours elapsed, forcing logout...');
        throw new Error('Session expired after 24 hours');
      }

      console.log('Attempting to refresh token...');
      const response = await api.post('/refresh', { refreshToken });

      if (response.data.accessToken) {
        const { setTokens } = await import('../utils/auth');
        setTokens(response.data.accessToken, response.data.refreshToken || refreshToken);
        console.log('Token refreshed successfully');
        return true;
      }
      throw new Error('No access token in refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      removeToken();
      // 현재 경로가 이미 /login이 아닐 때만 리다이렉트
      if (router.pathname !== '/login') {
        router.replace('/login');
      }
      return false;
    }
  };

  useEffect(() => {
    // 세션 시작 시간 설정
    if (isAuthenticated() && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const checkTokenStatus = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const minutesLeft = getTokenTimeLeft();
        setTimeLeft(minutesLeft);

        // 24시간 경과 체크
        if (getSessionElapsedHours() >= 24) {
          console.log('24 hours elapsed, logging out...');
          removeToken();
          // 현재 경로가 이미 /login이 아닐 때만 리다이렉트
          if (router.pathname !== '/login') {
            router.replace('/login');
          }
          return;
        }

        // 토큰이 5분 이내에 만료될 예정이면 갱신 시도
        if (minutesLeft <= 5 && minutesLeft > 0) {
          console.log(`Token expires in ${minutesLeft} minutes, attempting refresh...`);
          refreshToken();
        }
        // 토큰이 이미 만료되었으면 갱신 시도
        else if (minutesLeft <= 0 || isTokenExpired()) {
          console.log('Token expired, attempting refresh...');
          refreshToken();
        }
      }
    };

    // 초기 체크
    checkTokenStatus();

    // 30초마다 토큰 상태 확인
    const interval = setInterval(checkTokenStatus, 30000);

    return () => clearInterval(interval);
  }, [router, sessionStartTime]);

  return {
    isLoggedIn,
    timeLeft,
    sessionElapsedHours: getSessionElapsedHours()
  };
};
