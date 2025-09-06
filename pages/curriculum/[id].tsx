import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Task {
  id: string;
  title: string;
  status: string;
  estimatedHours: number;
  actualHours: number;
  resources: string[];
}

interface Week {
  week: number;
  topic: string;
  tasks: Task[];
}

interface Curriculum {
  id: string;
  title: string;
  certId: string;
  status: string;
  progress: number;
  weeks: Week[];
}

export default function CurriculumDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCurriculum, setAiCurriculum] = useState<any>(null);

  const fetchCurriculum = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/curriculums/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurriculum(response.data);
    } catch (error) {
      console.error('커리큘럼 조회 실패:', error);
    }
  };

  const generateAICurriculum = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_URL}/planner/generate`, {
        certificationId: curriculum?.certId,
        difficulty: 'intermediate',
        timeframe: 12,
        studyHoursPerWeek: 10
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiCurriculum(response.data.curriculum);
    } catch (error) {
      alert('AI 커리큘럼 생성에 실패했습니다.');
    }
    setAiLoading(false);
  };

  const applyAICurriculum = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/planner/${id}/apply`, {
        curriculum: aiCurriculum
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAIModal(false);
      fetchCurriculum(); // 새로고침
      alert('AI 커리큘럼이 적용되었습니다!');
    } catch (error) {
      alert('커리큘럼 적용에 실패했습니다.');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`${API_URL}/curriculums/${id}/tasks/${taskId}`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchCurriculum(); // 새로고침
    } catch (error) {
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [id]);

  if (!curriculum) return <div>로딩 중...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>{curriculum.title}</h1>
          <div style={{ color: '#666' }}>
            진행률: {curriculum.progress}% | 상태: {curriculum.status}
          </div>
        </div>
        <button
          onClick={() => setShowAIModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🤖 AI 커리큘럼 생성
        </button>
      </div>

      {/* 진행률 바 */}
      <div style={{ 
        width: '100%', 
        height: '20px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '10px',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${curriculum.progress}%`,
          height: '100%',
          backgroundColor: '#28a745',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* 주차별 커리큘럼 */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {curriculum.weeks?.map((week) => (
          <div
            key={week.week}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}
          >
            <h3>Week {week.week}: {week.topic}</h3>
            
            <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              {week.tasks?.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: task.status === 'completed' ? '#d4edda' : '#f8f9fa',
                    borderRadius: '6px',
                    border: `1px solid ${task.status === 'completed' ? '#c3e6cb' : '#dee2e6'}`
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'pending')}
                    style={{ marginRight: '15px' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      예상 시간: {task.estimatedHours}시간
                      {task.actualHours > 0 && ` | 실제 시간: ${task.actualHours}시간`}
                    </div>
                    {task.resources && (
                      <div style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                        📚 {task.resources.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI 커리큘럼 모달 */}
      {showAIModal && (
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
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <h2>🤖 AI 맞춤형 커리큘럼</h2>
            
            {!aiCurriculum ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <button
                  onClick={generateAICurriculum}
                  disabled={aiLoading}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: aiLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {aiLoading ? '생성 중...' : 'AI 커리큘럼 생성하기'}
                </button>
              </div>
            ) : (
              <div>
                <h3>{aiCurriculum.title}</h3>
                <p>총 {aiCurriculum.totalWeeks}주, {aiCurriculum.totalHours}시간</p>
                
                <div style={{ maxHeight: '400px', overflow: 'auto', margin: '20px 0' }}>
                  {aiCurriculum.weeks?.map((week: any) => (
                    <div key={week.week} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <h4>Week {week.week}: {week.topic}</h4>
                      <ul>
                        {week.tasks?.map((task: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: '5px' }}>
                            {task.title} ({task.estimatedHours}시간)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
                    onClick={applyAICurriculum}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    적용하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
