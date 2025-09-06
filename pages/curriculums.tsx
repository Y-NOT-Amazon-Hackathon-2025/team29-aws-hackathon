import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { isAuthenticated } from '../utils/auth';

interface Curriculum {
  id: string;
  title: string;
  certId: string;
  status: string;
  progress: number;
  createdAt: string;
  aiGenerated?: boolean;
  totalHours?: number;
}

interface Certificate {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
}

export default function Curriculums() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [savedCertificates, setSavedCertificates] = useState<Certificate[]>([]);
  const [selectedCertSource, setSelectedCertSource] = useState<'search' | 'saved'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCurriculum, setNewCurriculum] = useState({
    title: '',
    certId: '',
    certName: '',
    timeframe: 12,
    studyHoursPerWeek: 10,
    difficulty: 'intermediate'
  });
  const router = useRouter();

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates');
      const rawData = Array.isArray(response.data) ? response.data : [];
      
      const parsedData = rawData.map((item: any) => ({
        id: item.id?.S || item.id || '',
        name: item.name?.S || item.name || '',
        category: item.category?.S || item.category || '',
        difficulty: item.difficulty?.S || item.difficulty || '',
        description: item.description?.S || item.description || ''
      }));
      
      setCertificates(parsedData);
    } catch (error) {
      console.error('자격증 조회 실패:', error);
    }
  };

  const fetchSavedCertificates = async () => {
    try {
      const response = await api.get('/certificates');
      const allCerts = Array.isArray(response.data) ? response.data : [];
      
      const savedCertIds = JSON.parse(localStorage.getItem('savedCertificates') || '[]');
      
      const savedData = savedCertIds.map(certId => {
        const certData = allCerts.find(cert => (cert.id?.S || cert.id) === certId);
        if (certData) {
          return {
            id: certId,
            name: certData.name?.S || certData.name || certId,
            category: certData.category?.S || certData.category || '',
            difficulty: certData.difficulty?.S || certData.difficulty || '',
            description: certData.description?.S || certData.description || ''
          };
        }
        return null;
      }).filter(Boolean);
      
      setSavedCertificates(savedData);
    } catch (error) {
      console.error('즐겨찾기 자격증 조회 실패:', error);
    }
  };

  const fetchCurriculums = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      console.log('Fetching curriculums...');
      const response = await api.get('/curriculums');
      
      const rawData = Array.isArray(response.data) ? response.data : [];
      
      const parsedData = rawData.map((item: any) => ({
        id: item.id?.S || item.id || '',
        title: item.title?.S || item.title || '',
        certId: item.certId?.S || item.certId || '',
        status: item.status?.S || item.status || 'active',
        progress: 0,
        createdAt: item.createdAt?.S || item.createdAt || '',
        aiGenerated: item.aiGenerated?.BOOL || false,
        totalHours: parseInt(item.totalHours?.N || '0')
      }));

      setCurriculums(parsedData);
    } catch (error) {
      console.error('커리큘럼 조회 실패:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
    setLoading(false);
  };

  const createCurriculum = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const response = await api.post('/curriculums', newCurriculum);
      
      setShowCreateModal(false);
      fetchCurriculums();
      
      setNewCurriculum({
        title: '',
        certId: '',
        certName: '',
        timeframe: 12,
        studyHoursPerWeek: 10,
        difficulty: 'intermediate'
      });
      
      alert('커리큘럼이 생성되었습니다!');
    } catch (error) {
      console.error('커리큘럼 생성 실패:', error);
      alert('커리큘럼 생성에 실패했습니다.');
    }
  };

  const deleteCurriculum = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/curriculums/${id}`);
      
      fetchCurriculums();
      alert('커리큘럼이 삭제되었습니다.');
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCurriculums();
    fetchCertificates();
    fetchSavedCertificates();
    
    const { cert, name } = router.query;
    if (cert && name) {
      setNewCurriculum({
        ...newCurriculum,
        title: `${name} 학습 계획`,
        certId: cert as string,
        certName: name as string
      });
      setShowCreateModal(true);
    }
  }, [router.query]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>📚 나의 커리큘럼</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            AI가 생성한 맞춤형 학습 계획을 관리하세요
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + 새 커리큘럼 만들기
        </button>
      </div>

      {curriculums.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>아직 커리큘럼이 없습니다</h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            AI가 당신만의 맞춤형 학습 계획을 만들어드립니다
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            첫 커리큘럼 만들기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {curriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => router.push(`/curriculum/${curriculum.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{curriculum.title}</h3>
                {curriculum.aiGenerated && (
                  <span style={{
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    🤖 AI
                  </span>
                )}
              </div>
              
              <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '14px' }}>
                자격증: {curriculum.certId}
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>진행률</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>{curriculum.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${curriculum.progress}%`,
                    height: '100%',
                    backgroundColor: '#28a745',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(curriculum.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCurriculum(curriculum.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 커리큘럼 생성 모달 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2>🤖 AI 커리큘럼 생성</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>제목</label>
              <input
                type="text"
                value={newCurriculum.title}
                onChange={(e) => setNewCurriculum({...newCurriculum, title: e.target.value})}
                placeholder="예: AWS SAA 12주 완성"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>자격증 선택</label>
              
              {/* 자격증 소스 선택 */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                  onClick={() => setSelectedCertSource('search')}
                  style={{
                    padding: '8px 16px',
                    border: selectedCertSource === 'search' ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedCertSource === 'search' ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  🔍 검색하여 선택
                </button>
                <button
                  onClick={() => setSelectedCertSource('saved')}
                  style={{
                    padding: '8px 16px',
                    border: selectedCertSource === 'saved' ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedCertSource === 'saved' ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  ⭐ 즐겨찾기에서 선택
                </button>
              </div>

              {/* 검색 모드 */}
              {selectedCertSource === 'search' && (
                <div>
                  <input
                    type="text"
                    placeholder="자격증 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                    {certificates
                      .filter(cert => cert.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(cert => (
                        <div
                          key={cert.id}
                          onClick={() => setNewCurriculum({...newCurriculum, certId: cert.id, certName: cert.name})}
                          style={{
                            padding: '10px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            backgroundColor: newCurriculum.certId === cert.id ? '#e7f3ff' : 'white'
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{cert.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{cert.category} • {cert.difficulty}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 즐겨찾기 모드 */}
              {selectedCertSource === 'saved' && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                  {savedCertificates.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      즐겨찾기한 자격증이 없습니다.
                    </div>
                  ) : (
                    savedCertificates.map(cert => (
                      <div
                        key={cert.id}
                        onClick={() => setNewCurriculum({...newCurriculum, certId: cert.id, certName: cert.name})}
                        style={{
                          padding: '10px',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          backgroundColor: newCurriculum.certId === cert.id ? '#e7f3ff' : 'white'
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{cert.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{cert.category} • {cert.difficulty}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 선택된 자격증 표시 */}
              {newCurriculum.certId && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <strong>선택된 자격증:</strong> {newCurriculum.certName}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>학습 기간 (주)</label>
                <input
                  type="number"
                  value={newCurriculum.timeframe}
                  onChange={(e) => setNewCurriculum({...newCurriculum, timeframe: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>주당 학습시간</label>
                <input
                  type="number"
                  value={newCurriculum.studyHoursPerWeek}
                  onChange={(e) => setNewCurriculum({...newCurriculum, studyHoursPerWeek: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>난이도</label>
              <select
                value={newCurriculum.difficulty}
                onChange={(e) => setNewCurriculum({...newCurriculum, difficulty: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={createCurriculum}
                disabled={!newCurriculum.title || !newCurriculum.certId}
                style={{
                  padding: '10px 20px',
                  backgroundColor: newCurriculum.title && newCurriculum.certId ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: newCurriculum.title && newCurriculum.certId ? 'pointer' : 'not-allowed'
                }}
              >
                🤖 AI로 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
