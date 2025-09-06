import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { isAuthenticated } from '../utils/auth';
import Header from '../components/Header';

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
  nameKo: string;
  category: string;
  type: string;
  difficulty: string;
  description: string;
  organization: string;
  applicationPeriod: string;
  examPeriod: string;
  examFee: string;
  eligibility: string;
  resultDate: string;
  passingCriteria: string;
  examMethod: string;
  applicationUrl: string;
}

interface MyCertificate {
  id: string;
  name: string;
  obtainedDate: string;
  expiryDate: string;
  score: string;
}

export default function Curriculums() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'mycerts'>('curriculum');
  const [curriculumTab, setCurriculumTab] = useState<'saved' | 'inprogress' | 'completed'>('saved');
  
  // 커리큘럼 관련 상태
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);

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
  const [savedCertificates, setSavedCertificates] = useState<Certificate[]>([]);
  const [inProgressCertificates, setInProgressCertificates] = useState<Certificate[]>([]);
  const [completedCertificates, setCompletedCertificates] = useState<Certificate[]>([]);
  
  // 나의 자격증 관련 상태
  const [myCertificates, setMyCertificates] = useState<MyCertificate[]>([]);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<MyCertificate | null>(null);
  const [newCert, setNewCert] = useState({
    name: '',
    obtainedDate: '',
    expiryDate: '',
    score: ''
  });
  
  // 기타 상태
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiCert, setAiCert] = useState<Certificate | null>(null);

  // 데이터 로딩 함수들
  const loadSavedCertificates = () => {
    // 자격증 검색에서 담은 자격증들을 로드
    const savedIds = JSON.parse(localStorage.getItem('savedCertificates') || '[]');
    
    // 임시 데이터 (실제로는 API에서 가져와야 함)
    const mockCertificates: Certificate[] = [
      {
        id: 'aws-saa',
        name: 'AWS Solutions Architect Associate',
        nameKo: 'AWS 솔루션스 아키텍트 어소시에이트',
        category: '클라우드',
        type: '국제',
        difficulty: 'intermediate',
        description: 'AWS 클라우드 환경에서 확장 가능하고 안전한 애플리케이션을 설계하고 배포하는 능력을 검증하는 자격증입니다.',
        organization: 'Amazon Web Services',
        applicationPeriod: '상시 접수',
        examPeriod: '상시 시험',
        examFee: '150 USD',
        eligibility: '제한 없음',
        resultDate: '시험 완료 즉시',
        passingCriteria: '720점 이상 (1000점 만점)',
        examMethod: 'CBT (Computer Based Test)',
        applicationUrl: 'https://aws.amazon.com/certification/'
      },
      {
        id: 'sqld',
        name: 'SQL Developer',
        nameKo: 'SQL 개발자',
        category: '데이터베이스',
        type: '민간',
        difficulty: 'beginner',
        description: 'SQL을 이용한 데이터베이스 개발 및 관리 능력을 검증하는 국내 대표 데이터베이스 자격증입니다.',
        organization: '한국데이터산업진흥원',
        applicationPeriod: '연 4회 (3월, 6월, 9월, 12월)',
        examPeriod: '연 4회',
        examFee: '50,000원',
        eligibility: '제한 없음',
        resultDate: '시험일로부터 약 1개월 후',
        passingCriteria: '60점 이상 (100점 만점)',
        examMethod: 'CBT (Computer Based Test)',
        applicationUrl: 'https://www.dataq.or.kr/'
      }
    ];

    const saved = mockCertificates.filter(cert => savedIds.includes(cert.id));
    setSavedCertificates(saved);
  };

  const loadMyCertificates = () => {
    const stored = localStorage.getItem('myCertificates');
    if (stored) {
      setMyCertificates(JSON.parse(stored));
    }
  };

  const saveMyCertificates = (certs: MyCertificate[]) => {
    localStorage.setItem('myCertificates', JSON.stringify(certs));
    setMyCertificates(certs);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadSavedCertificates();
    loadMyCertificates();
    setLoading(false);
  }, []);

  // 자격증 검색에서 담기 버튼을 눌렀을 때 호출되는 함수
  useEffect(() => {
    const handleStorageChange = () => {
      loadSavedCertificates();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header user={user} onLogout={logout} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#2c3e50', marginBottom: '2rem' }}>
          📚 My Qualiculum
        </h1>

        {/* 메인 탭 메뉴 */}
        <div style={{ 
          display: 'flex', 
          gap: '0', 
          marginBottom: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('curriculum')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'curriculum' ? '#007bff' : 'transparent',
              color: activeTab === 'curriculum' ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📖 커리큘럼
          </button>
          <button
            onClick={() => setActiveTab('mycerts')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'mycerts' ? '#007bff' : 'transparent',
              color: activeTab === 'mycerts' ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🏆 나의 자격증
          </button>
        </div>

        {/* 커리큘럼 탭 내용 */}
        {activeTab === 'curriculum' && (
          <div>
            {/* 커리큘럼 서브 탭 */}
            <div style={{ 
              display: 'flex', 
              gap: '0', 
              marginBottom: '2rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => setCurriculumTab('saved')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: curriculumTab === 'saved' ? '#28a745' : 'transparent',
                  color: curriculumTab === 'saved' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                💾 담은 자격증
              </button>
              <button
                onClick={() => setCurriculumTab('inprogress')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: curriculumTab === 'inprogress' ? '#ffc107' : 'transparent',
                  color: curriculumTab === 'inprogress' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔄 진행중
              </button>
              <button
                onClick={() => setCurriculumTab('completed')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: curriculumTab === 'completed' ? '#6f42c1' : 'transparent',
                  color: curriculumTab === 'completed' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ✅ 진행완료
              </button>
            </div>

            {/* 담은 자격증 */}
            {curriculumTab === 'saved' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>담은 자격증</h3>
                {savedCertificates.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                    <h3>담은 자격증이 없습니다</h3>
                    <p>자격증 검색에서 관심있는 자격증을 담아보세요!</p>
                    <button
                      onClick={() => router.push('/certificates')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      자격증 검색하러 가기
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
                    {savedCertificates.map((cert) => (
                      <div key={cert.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', marginBottom: '12px' }}>
                          {cert.nameKo}
                        </h3>
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            backgroundColor: '#e3f2fd', 
                            color: '#1976d2',
                            padding: '6px 12px', 
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {cert.category}
                          </span>
                          <span style={{ 
                            backgroundColor: cert.type === '국제' ? '#f3e5f5' : 
                                           cert.type === '국가공인' ? '#e8f5e8' : '#fff3e0',
                            color: cert.type === '국제' ? '#7b1fa2' : 
                                   cert.type === '국가공인' ? '#388e3c' : '#f57c00',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {cert.type}
                          </span>
                        </div>
                        <p style={{ 
                          marginBottom: '20px', 
                          fontSize: '14px', 
                          lineHeight: '1.5',
                          color: '#666',
                          height: '60px',
                          overflow: 'hidden'
                        }}>
                          {cert.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setAiCert(cert);
                              setShowAIModal(true);
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            🤖 AI 커리큘럼 생성
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCert(cert);
                              setShowDetailModal(true);
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            📋 상세보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 진행중 */}
            {curriculumTab === 'inprogress' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>진행중인 커리큘럼</h3>
                {inProgressCertificates.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
                    <h3>진행중인 커리큘럼이 없습니다</h3>
                    <p>담은 자격증에서 AI 커리큘럼을 생성해보세요!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {/* 진행중 커리큘럼 카드들 */}
                  </div>
                )}
              </div>
            )}

            {/* 진행완료 */}
            {curriculumTab === 'completed' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>완료된 커리큘럼</h3>
                {completedCertificates.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                    <h3>완료된 커리큘럼이 없습니다</h3>
                    <p>커리큘럼을 완료하면 여기에 표시됩니다!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {/* 완료된 커리큘럼 카드들 */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 나의 자격증 탭 내용 */}
        {activeTab === 'mycerts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>나의 자격증</h3>
              <button
                onClick={() => {
                  setNewCert({ name: '', obtainedDate: '', expiryDate: '', score: '' });
                  setEditingCert(null);
                  setShowAddCertModal(true);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                + 추가하기
              </button>
            </div>

            {myCertificates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
                <h3>등록된 자격증이 없습니다</h3>
                <p>취득한 자격증을 등록해보세요!</p>
                <button
                  onClick={() => {
                    setNewCert({ name: '', obtainedDate: '', expiryDate: '', score: '' });
                    setEditingCert(null);
                    setShowAddCertModal(true);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  첫 자격증 등록하기
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {myCertificates.map((cert) => (
                  <div key={cert.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', marginBottom: '16px' }}>
                      {cert.name}
                    </h3>
                    <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>취득일:</strong> {cert.obtainedDate}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>유효기간:</strong> {cert.expiryDate}
                      </div>
                      <div>
                        <strong>성적:</strong> {cert.score}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingCert(cert);
                          setNewCert({
                            name: cert.name,
                            obtainedDate: cert.obtainedDate,
                            expiryDate: cert.expiryDate,
                            score: cert.score
                          });
                          setShowAddCertModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ 편집
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            const updatedCerts = myCertificates.filter(c => c.id !== cert.id);
                            saveMyCertificates(updatedCerts);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 자격증 상세보기 모달 */}
        {showDetailModal && selectedCert && (
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
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#2c3e50' }}>
                  {selectedCert.nameKo}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ 
                  backgroundColor: '#e3f2fd', 
                  color: '#1976d2',
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  marginRight: '12px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {selectedCert.category}
                </span>
                <span style={{ 
                  backgroundColor: selectedCert.type === '국제' ? '#f3e5f5' : 
                                 selectedCert.type === '국가공인' ? '#e8f5e8' : '#fff3e0',
                  color: selectedCert.type === '국제' ? '#7b1fa2' : 
                         selectedCert.type === '국가공인' ? '#388e3c' : '#f57c00',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {selectedCert.type}
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '12px' }}>
                  📋 자격증 설명
                </h3>
                <p style={{ lineHeight: '1.6', color: '#555' }}>
                  {selectedCert.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    🏢 기관
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.organization}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    📅 접수기간
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.applicationPeriod}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    📝 응시기간
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.examPeriod}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    💰 응시료
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.examFee}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI 커리큘럼 생성 모달 */}
        {showAIModal && aiCert && (
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
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '20px' }}>🤖 AI 커리큘럼 생성</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                <strong>{aiCert.nameKo}</strong>에 대한 맞춤형 학습 계획을 생성합니다.
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>학습 기간 (주)</label>
                <input
                  type="number"
                  defaultValue={12}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>하루 학습시간 (시간)</label>
                <input
                  type="number"
                  defaultValue={2}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAIModal(false)}
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
                  onClick={() => {
                    // AI 커리큘럼 생성 로직
                    alert('AI 커리큘럼이 생성되었습니다! 진행중 탭에서 확인하세요.');
                    setShowAIModal(false);
                    setCurriculumTab('inprogress');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🤖 생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 나의 자격증 추가/편집 모달 */}
        {showAddCertModal && (
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
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '20px' }}>
                {editingCert ? '✏️ 자격증 편집' : '+ 자격증 추가'}
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>자격증명</label>
                <input
                  type="text"
                  value={newCert.name}
                  onChange={(e) => setNewCert({...newCert, name: e.target.value})}
                  placeholder="예: AWS Solutions Architect Associate"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>취득일</label>
                <input
                  type="date"
                  value={newCert.obtainedDate}
                  onChange={(e) => setNewCert({...newCert, obtainedDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>유효기간</label>
                <input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({...newCert, expiryDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>성적</label>
                <input
                  type="text"
                  value={newCert.score}
                  onChange={(e) => setNewCert({...newCert, score: e.target.value})}
                  placeholder="예: 850/1000, Pass, A등급"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddCertModal(false)}
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
                  onClick={() => {
                    if (!newCert.name) {
                      alert('자격증명을 입력해주세요.');
                      return;
                    }
                    
                    if (editingCert) {
                      // 편집
                      const updatedCerts = myCertificates.map(cert => 
                        cert.id === editingCert.id 
                          ? { ...cert, ...newCert }
                          : cert
                      );
                      saveMyCertificates(updatedCerts);
                    } else {
                      // 추가
                      const newId = Date.now().toString();
                      const updatedCerts = [...myCertificates, { id: newId, ...newCert }];
                      saveMyCertificates(updatedCerts);
                    }
                    
                    setShowAddCertModal(false);
                    setEditingCert(null);
                    setNewCert({ name: '', obtainedDate: '', expiryDate: '', score: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingCert ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
