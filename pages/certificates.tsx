import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SEARCH_API_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || API_URL;

interface Certificate {
  id: string;
  name: string;
  category: string;
  difficulty?: string;
  description: string;
  examDate?: string;
  cost?: number;
  duration?: string;
  passingScore?: string;
  field?: string;
  level?: string;
  code?: string;
}

interface SearchResult {
  items: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: string[];
    fields: string[];
    levels: string[];
  };
}

export default function Certificates() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    field: '',
    level: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  // Q-Net 검색 기능
  const searchCertifications = useCallback(async (page = 1) => {
    if (!search && !Object.values(filters).some(f => f)) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        page: page.toString(),
        limit: '20',
        ...filters
      });

      const response = await axios.get(`${SEARCH_API_URL.replace(/\/$/, '')}/certifications?${params}`);
      setSearchResults(response.data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  // 기존 자격증 목록 가져오기
  const fetchSavedCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL.replace(/\/$/, '')}/certificates`);
      
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
      
      setCertificates(parsedData);
    } catch (error) {
      console.error('자격증 조회 실패:', error);
      setCertificates([]);
    }
    setLoading(false);
  };

  // 검색 디바운스
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === 'search') {
        searchCertifications(1);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, filters, activeTab, searchCertifications]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedCertificates();
    }
  }, [activeTab]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handlePageChange = (page: number) => {
    searchCertifications(page);
  };

  const viewCertificate = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const generateCurriculum = (certId: string) => {
    router.push(`/curriculums?certId=${certId}`);
  };

  const displayCertificates = activeTab === 'search' ? searchResults?.items || [] : certificates;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        자격증 검색 및 관리
      </h1>

      {/* 탭 메뉴 */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'search' ? '#007bff' : 'transparent',
            color: activeTab === 'search' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer'
          }}
        >
          🔍 자격증 검색 (Q-Net)
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'saved' ? '#007bff' : 'transparent',
            color: activeTab === 'saved' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer'
          }}
        >
          📚 저장된 자격증
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder={activeTab === 'search' ? "자격증명, 분야, 등급으로 검색..." : "자격증명 또는 설명 검색..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>
        
        {activeTab === 'search' && searchResults?.filters && (
          <>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <option value="">전체 카테고리</option>
              {searchResults.filters.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.field}
              onChange={(e) => handleFilterChange('field', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <option value="">전체 분야</option>
              {searchResults.filters.fields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>

            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <option value="">전체 등급</option>
              {searchResults.filters.levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </>
        )}

        <button
          onClick={() => {
            setSearch('');
            setFilters({ category: '', field: '', level: '' });
            setSearchResults(null);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          초기화
        </button>
      </div>

      {/* 검색 결과 정보 */}
      {activeTab === 'search' && searchResults && (
        <div style={{ marginBottom: '20px', color: '#666' }}>
          총 {searchResults.pagination.total}개의 자격증이 검색되었습니다.
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '10px', color: '#666' }}>
            {activeTab === 'search' ? '검색 중...' : '로딩 중...'}
          </p>
        </div>
      )}

      {/* 자격증 목록 */}
      {!loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {displayCertificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onClick={() => viewCertificate(cert)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', lineHeight: '1.4' }}>
                  {cert.name}
                </h3>
                <span style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  marginLeft: '10px'
                }}>
                  {cert.category}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                {cert.field && (
                  <div style={{ marginBottom: '5px' }}>
                    <strong>분야:</strong> {cert.field}
                  </div>
                )}
                {cert.level && (
                  <div style={{ marginBottom: '5px' }}>
                    <strong>등급:</strong> {cert.level}
                  </div>
                )}
                {cert.code && (
                  <div style={{ marginBottom: '5px' }}>
                    <strong>코드:</strong> {cert.code}
                  </div>
                )}
                {cert.difficulty && (
                  <div style={{ marginBottom: '5px' }}>
                    <strong>난이도:</strong> {cert.difficulty}
                  </div>
                )}
              </div>

              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                lineHeight: '1.5',
                margin: '0 0 15px 0',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {cert.description}
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '10px',
                borderTop: '1px solid #eee',
                paddingTop: '15px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewCertificate(cert);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  자세히 보기
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateCurriculum(cert.id);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  커리큘럼 생성
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {activeTab === 'search' && searchResults && searchResults.pagination.totalPages > 1 && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '5px' }}>
            {Array.from({ length: searchResults.pagination.totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(searchResults.pagination.totalPages, currentPage + 2)
              )
              .map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: page === currentPage ? '#007bff' : 'white',
                    color: page === currentPage ? 'white' : '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!loading && displayCertificates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ marginBottom: '10px' }}>
            {activeTab === 'search' ? '검색 결과가 없습니다' : '저장된 자격증이 없습니다'}
          </h3>
          <p>
            {activeTab === 'search' 
              ? '다른 키워드로 검색해보세요.' 
              : '자격증을 검색하여 저장해보세요.'
            }
          </p>
        </div>
      )}

      {/* 모달 */}
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
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>{selectedCert.name}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>카테고리:</strong> {selectedCert.category}
              </div>
              {selectedCert.field && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>분야:</strong> {selectedCert.field}
                </div>
              )}
              {selectedCert.level && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>등급:</strong> {selectedCert.level}
                </div>
              )}
              {selectedCert.code && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>코드:</strong> {selectedCert.code}
                </div>
              )}
              {selectedCert.difficulty && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>난이도:</strong> {selectedCert.difficulty}
                </div>
              )}
              {selectedCert.examDate && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>시험일:</strong> {selectedCert.examDate}
                </div>
              )}
              {selectedCert.cost && selectedCert.cost > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>비용:</strong> {selectedCert.cost.toLocaleString()}원
                </div>
              )}
              {selectedCert.duration && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>시험시간:</strong> {selectedCert.duration}
                </div>
              )}
              {selectedCert.passingScore && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>합격점수:</strong> {selectedCert.passingScore}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>설명:</strong>
              <p style={{ marginTop: '10px', lineHeight: '1.6', color: '#666' }}>
                {selectedCert.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => generateCurriculum(selectedCert.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                커리큘럼 생성
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
