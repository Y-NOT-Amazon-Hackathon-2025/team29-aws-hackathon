import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { isAuthenticated } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Certificate {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  examDate: string;
  cost: number;
  duration: string;
  passingScore: string;
}

export default function Certificates() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recommendedCerts, setRecommendedCerts] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL.replace(/\/$/, '')}/certificates`);
      
      // 응답이 배열인지 확인하고 DynamoDB 형식 데이터 파싱
      const rawData = Array.isArray(response.data) ? response.data : [];
      
      const parsedData = rawData.map((item: any) => ({
        id: item.id?.S || item.id || '',
        name: item.name?.S || item.name || '',
        category: item.category?.S || item.category || '',
        difficulty: item.difficulty?.S || item.difficulty || '',
        description: item.description?.S || item.description || '',
        examDate: item.examDate?.S || item.examDate || '',
        cost: parseInt(item.cost?.N || item.cost || '0'),
        duration: item.duration?.S || item.duration || '',
        passingScore: item.passingScore?.S || item.passingScore || ''
      }));
      
      console.log('Parsed certificates:', parsedData);
      setCertificates(parsedData);
      setFilteredCertificates(parsedData);
      
      // 로그인한 사용자의 추천 자격증 가져오기
      if (isAuthenticated()) {
        try {
          const token = localStorage.getItem('accessToken');
          const recommendedResponse = await axios.get(`${API_URL.replace(/\/$/, '')}/certificates/recommended`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const recommendedData = Array.isArray(recommendedResponse.data) ? recommendedResponse.data : [];
          const parsedRecommended = recommendedData.map((item: any) => ({
            id: item.id?.S || item.id || '',
            name: item.name?.S || item.name || '',
            category: item.category?.S || item.category || '',
            difficulty: item.difficulty?.S || item.difficulty || '',
            description: item.description?.S || item.description || '',
            examDate: item.examDate?.S || item.examDate || '',
            cost: parseInt(item.cost?.N || item.cost || '0'),
            duration: item.duration?.S || item.duration || '',
            passingScore: item.passingScore?.S || item.passingScore || ''
          }));
          
          setRecommendedCerts(parsedRecommended);
        } catch (error) {
          console.log('Failed to fetch recommended certificates');
        }
      }
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

  const saveCertificate = async (certId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      const response = await axios.post(`${API_URL.replace(/\/$/, '')}/certificates/${certId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Save response:', response.data);
      
      if (response.data.success) {
        // localStorage에 저장된 자격증 추가
        const savedCerts = JSON.parse(localStorage.getItem('savedCertificates') || '["ceh", "ccna", "aws-solutions-architect-associate"]');
        if (!savedCerts.includes(certId)) {
          savedCerts.push(certId);
          localStorage.setItem('savedCertificates', JSON.stringify(savedCerts));
        }
        
        alert('즐겨찾기에 추가되었습니다!');
        router.push('/my');
      } else {
        alert('즐겨찾기 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save certificate error:', error);
      alert('즐겨찾기 추가에 실패했습니다.');
    }
  };

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    fetchCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [search, category, certificates]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🔍 자격증 검색</h1>

      {/* 추천 자격증 섹션 (로그인한 사용자만) */}
      {isLoggedIn && recommendedCerts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '20px', 
            color: '#e74c3c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎯 당신을 위한 추천 자격증
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#7f8c8d',
              fontWeight: 'normal'
            }}>
              (관심사 기반)
            </span>
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '15px',
            marginBottom: '30px'
          }}>
            {recommendedCerts.slice(0, 3).map((cert) => (
              <div 
                key={cert.id} 
                style={{
                  border: '2px solid #e74c3c',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#fff5f5',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}
                onClick={() => showDetail(cert)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  추천
                </div>
                <h4 style={{ marginBottom: '8px', color: '#2c3e50', fontSize: '1rem' }}>
                  {cert.name}
                </h4>
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', margin: '5px 0' }}>
                  {cert.category} | {cert.difficulty}
                </p>
                <p style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {cert.duration}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 검색 필터 */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="자격증명 또는 설명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="">모든 카테고리</option>
          <option value="Cloud">클라우드</option>
          <option value="Security">보안</option>
          <option value="Management">관리</option>
          <option value="DevOps">데브옵스</option>
          <option value="Network">네트워크</option>
        </select>

        <button
          onClick={() => {
            setSearch('');
            setCategory('');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          초기화
        </button>
      </div>

      {/* 추천 섹션 */}
      {!search && !category && (
        <div style={{ marginBottom: '40px' }}>
          <h2>🌟 추천 자격증</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            인기 있는 자격증들을 확인해보세요
          </p>
        </div>
      )}

      {/* 자격증 목록 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>검색 중...</div>
      ) : filteredCertificates.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어를 시도해보세요.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <h3>{cert.name}</h3>
              <div style={{ color: '#666', marginBottom: '10px' }}>
                <span style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  marginRight: '10px'
                }}>
                  {cert.category}
                </span>
                <span style={{ 
                  backgroundColor: cert.difficulty === 'Advanced' ? '#dc3545' : 
                               cert.difficulty === 'Intermediate' ? '#ffc107' : '#28a745',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {cert.difficulty}
                </span>
              </div>
              <p style={{ marginBottom: '15px', fontSize: '14px', lineHeight: '1.4' }}>
                {cert.description}
              </p>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                <div>📅 시험일: {cert.examDate}</div>
                <div>💰 비용: ${cert.cost}</div>
                <div>⏱️ 소요시간: {cert.duration}</div>
                <div>🎯 합격점수: {cert.passingScore}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    saveCertificate(cert.id);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ⭐ 즐겨찾기
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showDetail(cert);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedCert.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ 
                backgroundColor: '#e9ecef', 
                padding: '6px 12px', 
                borderRadius: '6px',
                marginRight: '10px'
              }}>
                {selectedCert.category}
              </span>
              <span style={{ 
                backgroundColor: selectedCert.difficulty === 'Advanced' ? '#dc3545' : 
                             selectedCert.difficulty === 'Intermediate' ? '#ffc107' : '#28a745',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px'
              }}>
                {selectedCert.difficulty}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>📋 자격증 설명</h3>
              <p style={{ lineHeight: '1.6', color: '#333' }}>
                {selectedCert.description}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>📊 시험 정보</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>📅 시험일:</strong>
                  <div>{selectedCert.examDate}</div>
                </div>
                <div>
                  <strong>💰 비용:</strong>
                  <div>${selectedCert.cost}</div>
                </div>
                <div>
                  <strong>⏱️ 소요시간:</strong>
                  <div>{selectedCert.duration}</div>
                </div>
                <div>
                  <strong>🎯 합격점수:</strong>
                  <div>{selectedCert.passingScore}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  saveCertificate(selectedCert.id);
                  setShowModal(false);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ⭐ 즐겨찾기 추가
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
