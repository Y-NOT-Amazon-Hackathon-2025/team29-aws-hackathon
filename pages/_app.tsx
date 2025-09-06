import { AppProps } from 'next/app';
import { useTokenMonitor } from '../hooks/useTokenMonitor';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function TokenMonitor() {
  const { isLoggedIn, timeLeft, sessionElapsedHours } = useTokenMonitor();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // 23시간 경과 시 24시간 만료 경고 표시
    if (isLoggedIn && sessionElapsedHours >= 23) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isLoggedIn, sessionElapsedHours]);

  if (!isLoggedIn || !showWarning) return null;

  const hoursLeft = Math.max(0, 24 - sessionElapsedHours);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: hoursLeft < 0.5 ? '#f44336' : '#ff9800',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: 'bold'
    }}>
      ⚠️ 세션이 {hoursLeft.toFixed(1)}시간 후 만료됩니다. (토큰은 자동 갱신됩니다)
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login' || router.pathname === '/register';

  return (
    <>
      {!isLoginPage && <TokenMonitor />}
      <Component {...pageProps} />
    </>
  );
}
