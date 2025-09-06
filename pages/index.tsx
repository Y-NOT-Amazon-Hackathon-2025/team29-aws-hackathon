import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#007bff' }}>🎓 자격증 통합 플랫폼</h1>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => router.push('/my')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                마이페이지
              </button>
              <span>안녕하세요, {user.name}님!</span>
              <button
                onClick={logout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                로그인
              </button>
              <button
                onClick={() => router.push('/register')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* 메인 소개 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
            AI가 만드는 맞춤형 자격증 학습 플랜
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            분산된 자격증 정보를 한곳에서 확인하고, AI가 생성하는 개인 맞춤형 커리큘럼으로 효율적으로 학습하세요.
          </p>
        </div>

        {/* 주요 기능 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          <div
            onClick={() => router.push('/certificates')}
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
            onClick={() => user ? router.push('/curriculums') : router.push('/login')}
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

          <div
            onClick={() => user ? router.push('/calendar') : router.push('/login')}
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
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
            <h3 style={{ marginBottom: '15px', color: '#28a745' }}>시험 일정</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              시험 일정을 한눈에 확인하고 자동 알림을 설정하세요. D-7, D-1 알림으로 시험을 놓치지 마세요.
            </p>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '60px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>플랫폼 현황</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>50+</div>
              <div style={{ color: '#666' }}>등록된 자격증</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>1,000+</div>
              <div style={{ color: '#666' }}>생성된 커리큘럼</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107', marginBottom: '10px' }}>95%</div>
              <div style={{ color: '#666' }}>사용자 만족도</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f42c1', marginBottom: '10px' }}>24/7</div>
              <div style={{ color: '#666' }}>AI 지원</div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
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
              onClick={() => router.push('/register')}
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

      {/* 푸터 */}
      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '40px 0',
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <p>&copy; 2024 자격증 통합 플랫폼. AWS 해커톤 프로젝트.</p>
        </div>
      </footer>
    </div>
  );
}
