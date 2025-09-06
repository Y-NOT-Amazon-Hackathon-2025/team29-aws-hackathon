import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { setTokens, isAuthenticated } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });
      
      const response = await api.post('/login', {
        email,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.accessToken) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 로그인 상태 유지 옵션 처리
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        console.log('Login successful, redirecting...');
        router.push('/');
      } else {
        throw new Error('토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || '로그인에 실패했습니다');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
          Y-NOT?
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/certificates" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>About Qualification</a>
          <a href="/curriculums" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>My Qualiculum</a>
          <a href="/my" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>My page</a>
        </nav>
      </header>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '3rem',
          width: '100%',
          maxWidth: '450px'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: '#2c3e50',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            로그인
          </h1>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                아이디
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ color: '#495057', fontSize: '14px' }}>
                  로그인 상태 유지
                </span>
              </label>
            </div>

            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginBottom: '1.5rem',
                padding: '12px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ color: '#6c757d', fontSize: '14px' }}>아직 계정이 없으신가요? </span>
            <a href="/register" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              회원가입
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="#" style={{ 
              color: '#6c757d', 
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              아이디 · 비밀번호 찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
