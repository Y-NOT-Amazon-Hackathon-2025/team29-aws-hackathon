import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/auth';

interface RecommendedCert {
  id?: { S: string };
  name?: { S: string };
  fullName?: { S: string };
  organization?: { S: string };
  difficulty?: { S: string };
  studyPeriod?: { S: string };
  examFee?: { S: string };
}

export default function RecommendedCertificates() {
  const [recommendedCerts, setRecommendedCerts] = useState<RecommendedCert[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendedCerts = async () => {
      try {
        const response = await api.get('/certificates/recommended');
        const data = Array.isArray(response.data) ? response.data : [];
        setRecommendedCerts(data.slice(0, 4)); // 최대 4개만 표시
      } catch (error) {
        console.error('Failed to fetch recommended certificates:', error);
        // 오류 시 기본 추천 자격증 사용
        setRecommendedCerts([
          {
            id: { S: 'adsp' },
            name: { S: 'ADsP' },
            fullName: { S: '데이터분석 준전문가' },
            organization: { S: '한국데이터산업진흥원' },
            difficulty: { S: '중급' },
            studyPeriod: { S: '2-3개월' },
            examFee: { S: '60,000원' }
          },
          {
            id: { S: 'aws-saa' },
            name: { S: 'AWS SAA' },
            fullName: { S: 'AWS Solutions Architect Associate' },
            organization: { S: 'Amazon Web Services' },
            difficulty: { S: '중급' },
            studyPeriod: { S: '3-4개월' },
            examFee: { S: '$150' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCerts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        추천 자격증을 불러오는 중...
      </div>
    );
  }

  if (recommendedCerts.length === 0) {
    return (
      <section style={{ marginBottom: '50px', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '30px', 
          color: '#e74c3c'
        }}>
          🎯 추천 자격증
        </h2>
        <p style={{ color: '#7f8c8d' }}>
          추천 자격증을 불러오는 중입니다...
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: '50px' }}>
      <h2 style={{ 
        fontSize: '2rem', 
        marginBottom: '30px', 
        color: '#e74c3c',
        textAlign: 'center'
      }}>
        🎯 당신의 관심사에 맞는 추천 자격증
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {recommendedCerts.map((cert, index) => (
          <div 
            key={cert.id?.S || index} 
            style={{
              border: '2px solid #e74c3c',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#fff5f5',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.1)'
            }}
            onClick={() => router.push(`/certificates/${cert.id?.S || ''}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.1)';
            }}
          >
            {/* 추천 배지 */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              ✨ 추천
            </div>

            <h3 style={{ 
              marginBottom: '15px', 
              color: '#2c3e50',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              paddingRight: '60px' // 배지 공간 확보
            }}>
              {cert.name?.S || cert.fullName?.S || '자격증 이름 없음'}
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <span style={{ 
                color: '#7f8c8d', 
                fontSize: '14px',
                backgroundColor: '#ecf0f1',
                padding: '4px 8px',
                borderRadius: '4px',
                marginRight: '8px'
              }}>
                {cert.organization?.S || '기관 정보 없음'}
              </span>
              <span style={{ 
                color: '#e67e22', 
                fontSize: '14px',
                backgroundColor: '#fef9e7',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>
                {cert.difficulty?.S || '난이도 정보 없음'}
              </span>
            </div>

            <div style={{ 
              color: '#27ae60', 
              fontWeight: 'bold',
              fontSize: '15px',
              marginTop: '15px'
            }}>
              📚 학습기간: {cert.studyPeriod?.S || '기간 정보 없음'}
            </div>

            {cert.examFee?.S && (
              <div style={{ 
                color: '#8e44ad', 
                fontSize: '14px',
                marginTop: '8px'
              }}>
                💰 응시료: {cert.examFee?.S}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => router.push('/certificates')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#c0392b'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#e74c3c'}
        >
          더 많은 자격증 보기 →
        </button>
      </div>
    </section>
  );
}
