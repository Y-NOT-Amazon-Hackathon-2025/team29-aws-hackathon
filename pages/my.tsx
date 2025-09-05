import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SavedCertificate {
  certId: string;
  certName: string;
  category: string;
  difficulty: string;
  description: string;
  examDate: string;
  cost: number;
  createdAt: string;
}

export default function MyPage() {
  const [savedCertificates, setSavedCertificates] = useState<SavedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSavedCertificates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // 즐겨찾기한 자격증 목록 조회
      const savedResponse = await axios.get(`${API_URL}/certificates/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 각 자격증의 상세 정보 조회
      const savedData = [];
      for (const item of savedResponse.data) {
        try {
          const certId = item.certId?.S || item.certId;
          const certResponse = await axios.get(`${API_URL}/certificates/${certId}`);
          
          const certData = certResponse.data;
          savedData.push({
            certId,
            certName: certData.name?.S || certData.name || certId,
            category: certData.category?.S || certData.category || '',
            difficulty: certData.difficulty?.S || certData.difficulty || '',
            description: certData.description?.S || certData.description || '',
            examDate: certData.examDate?.S || certData.examDate || '',
            cost: parseInt(certData.cost?.N || certData.cost || '0'),
            createdAt: item.createdAt?.S || item.createdAt || ''
          });
        } catch (error) {
          console.error(`Error fetching certificate ${item.certId}:`, error);
        }
      }

      setSavedCertificates(savedData);
    } catch (error) {
      console.error('즐겨찾기 조회 실패:', error);
    }
    setLoading(false);
  };

  const removeSavedCertificate = async (certId: string) => {
    if (!confirm('즐겨찾기에서 제거하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/certificates/${certId}/save`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchSavedCertificates();
      alert('즐겨찾기에서 제거되었습니다.');
    } catch (error) {
      alert('제거에 실패했습니다.');
    }
  };

  const createCurriculumForCert = (certId: string, certName: string) => {
    router.push(`/curriculums?cert=${certId}&name=${encodeURIComponent(certName)}`);
  };

  useEffect(() => {
    fetchSavedCertificates();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>👤 마이페이지</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>⭐ 즐겨찾기한 자격증</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          관심 있는 자격증들을 관리하고 커리큘럼을 생성하세요
        </p>

        {savedCertificates.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
            <h3>즐겨찾기한 자격증이 없습니다</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              자격증 검색 페이지에서 관심 있는 자격증을 즐겨찾기에 추가해보세요!
            </p>
            <button
              onClick={() => router.push('/certificates')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              자격증 검색하기
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {savedCertificates.map((cert) => (
              <div
                key={cert.certId}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>{cert.certName}</h3>
                  <span style={{
                    backgroundColor: '#ffc107',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    ⭐ 즐겨찾기
                  </span>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ 
                    backgroundColor: '#e9ecef', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}>
                    {cert.category}
                  </span>
                  <span style={{ 
                    backgroundColor: cert.difficulty === 'Advanced' ? '#dc3545' : 
                                 cert.difficulty === 'Intermediate' ? '#ffc107' : '#28a745',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {cert.difficulty}
                  </span>
                </div>

                <p style={{ 
                  marginBottom: '15px', 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: '#666'
                }}>
                  {cert.description}
                </p>

                <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                  <div>📅 시험일: {cert.examDate}</div>
                  <div>💰 비용: ${cert.cost}</div>
                  <div>📌 추가일: {new Date(cert.createdAt).toLocaleDateString()}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => createCurriculumForCert(cert.certId, cert.certName)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📚 커리큘럼 생성
                  </button>
                  <button
                    onClick={() => removeSavedCertificate(cert.certId)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
