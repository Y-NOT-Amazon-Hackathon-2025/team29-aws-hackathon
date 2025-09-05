import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway-url';

export default function Home() {
  const [certifications, setCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState('');
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/certifications`);
      setCertifications(response.data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    }
  };

  const generateCurriculum = async () => {
    if (!selectedCert) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/curriculum`, {
        certificationId: selectedCert,
        difficulty: 'intermediate',
        timeframe: 12
      });
      setCurriculum(JSON.parse(response.data.curriculum));
    } catch (error) {
      console.error('Error generating curriculum:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>자격증 통합 플랫폼</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>자격증 선택</h2>
        <select 
          value={selectedCert} 
          onChange={(e) => setSelectedCert(e.target.value)}
          style={{ padding: '10px', width: '300px' }}
        >
          <option value="">자격증을 선택하세요</option>
          {certifications.map((cert: any) => (
            <option key={cert.id?.S} value={cert.id?.S}>
              {cert.name?.S}
            </option>
          ))}
        </select>
        
        <button 
          onClick={generateCurriculum}
          disabled={!selectedCert || loading}
          style={{ 
            marginLeft: '10px', 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loading ? '생성 중...' : 'AI 커리큘럼 생성'}
        </button>
      </div>

      {curriculum && (
        <div>
          <h2>맞춤형 학습 커리큘럼</h2>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            {curriculum.weeks?.map((week: any, index: number) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <h3>Week {week.week}: {week.topic}</h3>
                <ul>
                  {week.resources?.map((resource: string, i: number) => (
                    <li key={i}>{resource}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
