import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import RecommendedCertificates from '../components/RecommendedCertificates';
import { commonStyles, storage } from '../utils/common';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = storage.get('user');
    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = () => {
    storage.remove('accessToken');
    storage.remove('user');
    setUser(null);
    router.replace('/');
  };

  return (
    <div style={commonStyles.container}>
      <Header user={user} onLogout={logout} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
            AI가 만드는 맞춤형 자격증 학습 플랜
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            분산된 자격증 정보를 한곳에서 확인하고, AI가 생성하는 개인 맞춤형 커리큘럼으로 효율적으로 학습하세요.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          <div
            onClick={() => router.replace('/certificates')}
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ marginBottom: '15px', color: '#007bff' }}>자격증 검색</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              다양한 자격증 정보를 한곳에서 검색하고 비교해보세요. 카테고리별 필터링과 상세 정보를 제공합니다.
            </p>
          </div>

          <div
            onClick={() => user ? router.replace('/curriculums') : router.replace('/login')}
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤖</div>
            <h3 style={{ marginBottom: '15px', color: '#6f42c1' }}>AI 커리큘럼</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              AI가 분석한 맞춤형 학습 계획을 받아보세요. 개인의 수준과 목표에 맞는 주차별 학습 로드맵을 제공합니다.
            </p>
          </div>
        </div>

        {user && <RecommendedCertificates />}

        {!user && (
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '60px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>지금 시작하세요!</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
              무료로 회원가입하고 AI 맞춤형 학습 계획을 받아보세요.
            </p>
            <button
              onClick={() => router.replace('/register')}
              style={{
                padding: '15px 40px',
                fontSize: '1.1rem',
                backgroundColor: 'white',
                color: '#007bff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              무료 회원가입 →
            </button>
          </div>
        )}
      </div>

      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '40px 0',
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <p>&copy; 2025 Y-NOT?. AWS 해커톤 프로젝트.</p>
        </div>
      </footer>
    </div>
  );
}
