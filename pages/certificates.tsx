import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import RecommendedCertificates from '../components/RecommendedCertificates';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Certificate {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  type: string; // 민간/국가공인/국제
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

export default function Certificates() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      // 임시 데이터 (실제로는 API에서 가져옴)
      const mockData = [
        {
          id: 'aws-saa',
          name: 'AWS Solutions Architect Associate',
          nameKo: 'AWS 솔루션스 아키텍트 어소시에이트',
          category: '클라우드',
          type: '국제',
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
          id: 'cissp',
          name: 'Certified Information Systems Security Professional',
          nameKo: '정보시스템보안전문가',
          category: '보안',
          type: '국제',
          description: '정보보안 분야의 최고 수준 자격증으로, 보안 아키텍처 설계 및 관리 능력을 검증합니다.',
          organization: '(ISC)²',
          applicationPeriod: '상시 접수',
          examPeriod: '상시 시험',
          examFee: '749 USD',
          eligibility: '정보보안 분야 5년 이상 경력',
          resultDate: '시험 완료 즉시',
          passingCriteria: '700점 이상 (1000점 만점)',
          examMethod: 'CBT (Computer Based Test)',
          applicationUrl: 'https://www.isc2.org/Certifications/CISSP'
        },
        {
          id: 'pmp',
          name: 'Project Management Professional',
          nameKo: '프로젝트관리전문가',
          category: '관리',
          type: '국제',
          description: '프로젝트 관리 분야의 국제 표준 자격증으로, 프로젝트 관리 전문 지식과 경험을 검증합니다.',
          organization: 'PMI (Project Management Institute)',
          applicationPeriod: '상시 접수',
          examPeriod: '상시 시험',
          examFee: '555 USD',
          eligibility: '학사 + 3년 경력 또는 고졸 + 5년 경력',
          resultDate: '시험 완료 즉시',
          passingCriteria: 'Above Target 등급',
          examMethod: 'CBT (Computer Based Test)',
          applicationUrl: 'https://www.pmi.org/certifications/project-management-pmp'
        },
        {
          id: 'sqld',
          name: 'SQL Developer',
          nameKo: 'SQL 개발자',
          category: '데이터베이스',
          type: '민간',
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
        },
        {
          id: 'adsp',
          name: 'Advanced Data Analytics Semi-Professional',
          nameKo: '데이터분석준전문가',
          category: '데이터분석',
          type: '민간',
          description: '빅데이터 시대에 필요한 데이터 이해 및 처리 기술, 데이터 분석 및 해석 능력을 검증하는 자격증입니다.',
          organization: '한국데이터산업진흥원',
          applicationPeriod: '연 6회',
          examPeriod: '연 6회',
          examFee: '60,000원',
          eligibility: '제한 없음',
          resultDate: '시험일로부터 약 1개월 후',
          passingCriteria: '60점 이상 (100점 만점)',
          examMethod: 'CBT (Computer Based Test)',
          applicationUrl: 'https://www.dataq.or.kr/'
        },
        {
          id: 'opic',
          name: 'OPIc (Oral Proficiency Interview-computer)',
          nameKo: '오픽',
          category: '어학',
          type: '국가공인',
          description: '실제 생활에서 얼마나 효과적이고 적절하게 영어로 의사소통할 수 있는지를 측정하는 말하기 평가입니다.',
          organization: 'ACTFL',
          applicationPeriod: '상시 접수',
          examPeriod: '상시 시험',
          examFee: '81,400원',
          eligibility: '제한 없음',
          resultDate: '시험일로부터 약 3주 후',
          passingCriteria: 'Novice Low ~ Advanced Low 등급',
          examMethod: 'IBT (Internet Based Test)',
          applicationUrl: 'https://www.opic.or.kr/'
        }
      ];
      
      setCertificates(mockData);
      setFilteredCertificates(mockData);
    } catch (error) {
      console.error('자격증 조회 실패:', error);
      setCertificates([]);
      setFilteredCertificates([]);
    }
    setLoading(false);
  };

  const filterCertificates = () => {
    if (!certificates || certificates.length === 0) {
      return;
    }
    
    let filtered = certificates;
    
    if (search) {
      filtered = filtered.filter(cert => 
        cert.nameKo.toLowerCase().includes(search.toLowerCase()) ||
        cert.name.toLowerCase().includes(search.toLowerCase()) ||
        cert.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filtered = filtered.filter(cert => cert.category === category);
    }
    
    setFilteredCertificates(filtered);
  };

  const showDetail = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const addToMyQualiculum = async (certId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      
      // My Qualiculum의 담은 자격증에 추가하는 로직
      const savedCerts = JSON.parse(localStorage.getItem('savedCertificates') || '[]');
      if (!savedCerts.includes(certId)) {
        savedCerts.push(certId);
        localStorage.setItem('savedCertificates', JSON.stringify(savedCerts));
      }
      
      alert('My Qualiculum에 담았습니다!');
      setShowModal(false);
      
      // My Qualiculum 페이지로 이동
      router.push('/curriculums');
    } catch (error) {
      console.error('담기 실패:', error);
      alert('담기에 실패했습니다.');
    }
  };

  const goToApplication = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [search, category, certificates]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header user={user} onLogout={logout} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#2c3e50', marginBottom: '2rem' }}>
          🔍 자격증 검색
        </h1>

        {/* 검색 필터 */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="자격증명 또는 설명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
          >
            <option value="">모든 분야</option>
            <option value="클라우드">클라우드</option>
            <option value="보안">보안</option>
            <option value="관리">관리</option>
            <option value="데이터베이스">데이터베이스</option>
            <option value="데이터분석">데이터분석</option>
            <option value="어학">어학</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setCategory('');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            초기화
          </button>
        </div>

        {/* 자격증 목록 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>검색 중...</div>
        ) : filteredCertificates.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어를 시도해보세요.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
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
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {cert.description}
                </p>
                
                <button
                  onClick={() => showDetail(cert)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  상세보기
                </button>
              </div>
            ))}
          </div>
        )}

        {user && <RecommendedCertificates />}

        {/* 자격증 상세 모달 */}
        {showModal && selectedCert && (
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
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '0' }}>
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
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    👤 응시자격
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.eligibility}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    📊 결과발표일
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.resultDate}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    🎯 합격기준
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.passingCriteria}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    💻 시험방식
                  </h4>
                  <p style={{ margin: '0', color: '#555' }}>{selectedCert.examMethod}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => addToMyQualiculum(selectedCert.id)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  담기
                </button>
                <button
                  onClick={() => goToApplication(selectedCert.applicationUrl)}
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
                  신청하러 가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
