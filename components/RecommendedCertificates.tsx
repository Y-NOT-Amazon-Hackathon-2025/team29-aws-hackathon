import { useState, useEffect } from 'react';

interface Certificate {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  type: string;
  description: string;
}

export default function RecommendedCertificates() {
  const [recommendedCerts, setRecommendedCerts] = useState<Certificate[]>([]);

  useEffect(() => {
    const mockRecommended = [
      {
        id: 'aws-saa',
        name: 'AWS Solutions Architect Associate',
        nameKo: 'AWS 솔루션스 아키텍트 어소시에이트',
        category: '클라우드',
        type: '국제',
        description: 'AWS 클라우드 환경에서 확장 가능하고 안전한 애플리케이션을 설계하고 배포하는 능력을 검증'
      },
      {
        id: 'sqld',
        name: 'SQL Developer',
        nameKo: 'SQL 개발자',
        category: '데이터베이스',
        type: '국가공인',
        description: 'SQL을 활용한 데이터베이스 설계 및 개발 능력을 검증하는 자격증'
      },
      {
        id: 'adsp',
        name: 'Advanced Data Analytics Semi-Professional',
        nameKo: '데이터분석 준전문가',
        category: '데이터분석',
        type: '국가공인',
        description: '데이터 이해와 처리기술, 분석기법, 시각화 등 데이터 분석 전반에 대한 능력을 검증'
      }
    ];
    setRecommendedCerts(mockRecommended);
  }, []);

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '1.5rem' }}>추천 자격증</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {recommendedCerts.map((cert) => (
          <div
            key={cert.id}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#007bff', fontSize: '1.1rem' }}>{cert.nameKo}</h4>
              <span style={{
                backgroundColor: cert.type === '국제' ? '#28a745' : cert.type === '국가공인' ? '#007bff' : '#6c757d',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                {cert.type}
              </span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: '8px 0', lineHeight: '1.4' }}>
              {cert.description}
            </p>
            <div style={{ color: '#007bff', fontSize: '0.8rem', fontWeight: '500' }}>
              {cert.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
