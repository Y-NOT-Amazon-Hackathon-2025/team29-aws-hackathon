import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/auth';

interface AIRecommendation {
  id?: string;
  certId?: string;
  name: string;
  organization: string;
  difficulty: string;
  priority: number;
  aiReason?: string;
  studyPeriod: string;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiGenerated, setAiGenerated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        const response = await api.get('/ai/recommendations');
        setRecommendations(response.data.recommendations || []);
        setSummary(response.data.summary || '');
        setUserInterests(response.data.userInterests || []);
        setAiGenerated(response.data.aiGenerated || false);
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIRecommendations();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px 0'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
        <div>AI가 당신만을 위한 추천을 분석 중...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section style={{ marginBottom: '50px' }}>
      {/* 헤더 */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          🤖 AI 맞춤 추천
          {aiGenerated && (
            <span style={{ 
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              AI 분석
            </span>
          )}
        </h2>
        
        <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '10px' }}>
          관심사: {userInterests.join(' • ')}
        </div>
        
        {summary && (
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.8,
            fontStyle: 'italic',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {summary}
          </div>
        )}
      </div>

      {/* 추천 자격증 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '20px'
      }}>
        {recommendations.map((cert, index) => (
          <div 
            key={cert.id || cert.certId || index} 
            style={{
              border: '2px solid #667eea',
              borderRadius: '16px',
              padding: '24px',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
            }}
            onClick={() => router.push(`/certificates/${cert.id || cert.certId || ''}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
            }}
          >
            {/* 우선순위 배지 */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              backgroundColor: cert.priority === 1 ? '#e74c3c' : cert.priority === 2 ? '#f39c12' : '#27ae60',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              #{cert.priority || 1} 추천
            </div>

            <h3 style={{ 
              marginBottom: '15px', 
              color: '#2c3e50',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              paddingRight: '80px'
            }}>
              {cert.name}
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <span style={{ 
                color: '#7f8c8d', 
                fontSize: '14px',
                backgroundColor: '#ecf0f1',
                padding: '4px 10px',
                borderRadius: '6px',
                marginRight: '8px'
              }}>
                {cert.organization}
              </span>
              <span style={{ 
                color: '#e67e22', 
                fontSize: '14px',
                backgroundColor: '#fef9e7',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}>
                {cert.difficulty}
              </span>
            </div>

            {/* AI 추천 이유 */}
            {cert.aiReason && (
              <div style={{
                backgroundColor: '#f8f9ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #e6e8ff'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  🤖 AI 추천 이유
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  lineHeight: '1.4'
                }}>
                  {cert.aiReason}
                </div>
              </div>
            )}

            <div style={{ 
              color: '#27ae60', 
              fontWeight: 'bold',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              📚 학습기간: {cert.studyPeriod}
            </div>
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => router.push('/curriculums')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a67d8'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#667eea'}
        >
          🚀 AI 커리큘럼 생성하기
        </button>
      </div>
    </section>
  );
}
