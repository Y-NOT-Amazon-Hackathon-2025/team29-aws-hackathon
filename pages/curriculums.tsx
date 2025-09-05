import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function Curriculums() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    title: '',
    certId: '',
    timeframe: 12,
    studyHoursPerWeek: 10,
    difficulty: 'intermediate'
  });
  const router = useRouter();
  const fetchCurriculums = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/curriculums`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // DynamoDB 형식 데이터 파싱
      const parsedData = response.data.map((item: any) => ({
        id: item.id?.S || item.id,
        title: item.title?.S || item.title,
        certId: item.certId?.S || item.certId,
        status: item.status?.S || item.status,
        progress: 0, // 별도 API로 가져와야 함
        createdAt: item.createdAt?.S || item.createdAt,
        aiGenerated: item.aiGenerated?.BOOL || false,
        totalHours: parseInt(item.totalHours?.N || '0')
      }));
      
      setCurriculums(parsedData);
    } catch (error) {
      console.error('커리큘럼 조회 실패:', error);
    }
    setLoading(false);
  };

  const createCurriculum = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await axios.post(`${API_URL}/curriculums`, newCurriculum, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Curriculum created:', response.data);
      setShowCreateModal(false);
      fetchCurriculums();
      
      // 생성된 커리큘럼으로 이동
      if (response.data.id) {
        router.push(`/curriculum/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('커리큘럼 생성 오류:', error);
      alert(`커리큘럼 생성에 실패했습니다: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteCurriculum = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/curriculums/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchCurriculums();
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCurriculums();
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
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
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
            fontSize: '16px'
          }}
        >
          + 새 커리큘럼 만들기
        </button>
      </div>

      {/* 커리큘럼 목록 */}
      {curriculums.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
          <h3>아직 커리큘럼이 없습니다</h3>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            첫 번째 학습 계획을 만들어보세요!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            커리큘럼 만들기
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {curriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => router.push(`/curriculum/${curriculum.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  자격증: {curriculum.certId}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  상태: <span style={{ 
                    color: curriculum.status === 'active' ? '#28a745' : '#6c757d',
                    fontWeight: 'bold'
                  }}>
                    {curriculum.status === 'active' ? '진행중' : '대기중'}
                  </span>
                </div>
                {curriculum.totalHours > 0 && (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    총 학습시간: {curriculum.totalHours}시간
                  </div>
                )}
              </div>

              {/* 진행률 바 */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '14px', 
                  marginBottom: '5px' 
                }}>
                  <span>진행률</span>
                  <span>{curriculum.progress}%</span>
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
                    backgroundColor: curriculum.progress > 70 ? '#28a745' : 
                                   curriculum.progress > 30 ? '#ffc107' : '#dc3545',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '12px',
                color: '#999'
              }}>
                <span>
                  생성일: {new Date(curriculum.createdAt).toLocaleDateString()}
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
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>새 커리큘럼 만들기</h2>
            
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
              <label style={{ display: 'block', marginBottom: '5px' }}>자격증</label>
              <select
                value={newCurriculum.certId}
                onChange={(e) => setNewCurriculum({...newCurriculum, certId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="">자격증 선택</option>
                <option value="aws-saa">AWS Solutions Architect Associate</option>
                <option value="cissp">CISSP</option>
                <option value="pmp">Project Management Professional</option>
                <option value="cka">Certified Kubernetes Administrator</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>학습 기간 (주)</label>
                <input
                  type="number"
                  value={newCurriculum.timeframe}
                  onChange={(e) => setNewCurriculum({...newCurriculum, timeframe: parseInt(e.target.value)})}
                  min="4"
                  max="52"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>주당 시간</label>
                <input
                  type="number"
                  value={newCurriculum.studyHoursPerWeek}
                  onChange={(e) => setNewCurriculum({...newCurriculum, studyHoursPerWeek: parseInt(e.target.value)})}
                  min="1"
                  max="40"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
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
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: newCurriculum.title && newCurriculum.certId ? 'pointer' : 'not-allowed',
                  opacity: newCurriculum.title && newCurriculum.certId ? 1 : 0.6
                }}
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
