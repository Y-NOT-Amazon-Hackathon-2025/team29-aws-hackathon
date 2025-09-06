import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ExamSchedule {
  id: string;
  certId: string;
  certName: string;
  examDate: string;
  registrationDeadline: string;
  notificationEnabled: boolean;
}

export default function Calendar() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/certificates/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 즐겨찾기한 자격증의 시험 일정 조회
      const savedCerts = response.data;
      const schedulePromises = savedCerts.map(async (cert: any) => {
        const certResponse = await axios.get(`${API_URL}/certificates/${cert.certId}`);
        return {
          id: cert.certId,
          certId: cert.certId,
          certName: certResponse.data.name,
          examDate: certResponse.data.examDate,
          registrationDeadline: certResponse.data.registrationDeadline,
          notificationEnabled: false
        };
      });
      
      const scheduleData = await Promise.all(schedulePromises);
      setSchedules(scheduleData);
    } catch (error) {
      console.error('일정 조회 실패:', error);
    }
  };

  const toggleNotification = async (certId: string, enabled: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (enabled) {
        // 알림 등록
        await axios.post(`${API_URL}/notifications`, {
          certId,
          notificationType: 'exam_reminder',
          enabled: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // 알림 해제
        await axios.delete(`${API_URL}/notifications/${certId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // 상태 업데이트
      setSchedules(prev => prev.map(schedule => 
        schedule.certId === certId 
          ? { ...schedule, notificationEnabled: enabled }
          : schedule
      ));
      
      alert(enabled ? '알림이 설정되었습니다!' : '알림이 해제되었습니다!');
    } catch (error) {
      console.error('알림 설정 오류:', error);
      alert('알림 설정에 실패했습니다.');
    }
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return '#6c757d'; // 지난 시험
    if (daysUntil <= 7) return '#dc3545'; // 임박
    if (daysUntil <= 30) return '#ffc107'; // 한 달 이내
    return '#28a745'; // 여유
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>📅 시험 일정 캘린더</h1>
      
      {/* 필터 */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={fetchSchedules}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          새로고침
        </button>
      </div>

      {/* 시험 일정 목록 */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {schedules.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3>등록된 시험 일정이 없습니다</h3>
            <p>자격증을 즐겨찾기에 추가하면 시험 일정이 표시됩니다.</p>
            <a href="/certificates" style={{ color: '#007bff' }}>
              자격증 검색하러 가기 →
            </a>
          </div>
        ) : (
          schedules.map((schedule) => {
            const daysUntil = getDaysUntilExam(schedule.examDate);
            const statusColor = getStatusColor(daysUntil);
            
            return (
              <div
                key={schedule.id}
                style={{
                  border: `2px solid ${statusColor}`,
                  borderRadius: '12px',
                  padding: '25px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: statusColor }}>
                      {schedule.certName}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <strong>시험일:</strong>
                        <div style={{ fontSize: '18px', color: statusColor, fontWeight: 'bold' }}>
                          {schedule.examDate}
                        </div>
                      </div>
                      
                      <div>
                        <strong>접수 마감:</strong>
                        <div>{schedule.registrationDeadline}</div>
                      </div>
                      
                      <div>
                        <strong>D-Day:</strong>
                        <div style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold',
                          color: statusColor
                        }}>
                          {daysUntil < 0 ? '시험 종료' : `D-${daysUntil}`}
                        </div>
                      </div>
                    </div>

                    {/* 진행 상황 표시 */}
                    {daysUntil > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                          {daysUntil <= 7 ? '🚨 시험이 임박했습니다!' : 
                           daysUntil <= 30 ? '⚠️ 한 달 이내 시험' : 
                           '✅ 충분한 준비 시간'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 알림 설정 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={schedule.notificationEnabled}
                        onChange={(e) => toggleNotification(schedule.certId, e.target.checked)}
                      />
                      <span>알림 받기</span>
                    </label>
                    
                    {schedule.notificationEnabled && (
                      <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                        📧 7일 전, 1일 전<br/>
                        이메일 알림 발송
                      </div>
                    )}
                    
                    <button
                      onClick={() => window.location.href = `/certificates/${schedule.certId}`}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 알림 안내 */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h4>📢 알림 서비스 안내</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>시험 7일 전: 마지막 점검 시작 알림</li>
          <li>시험 1일 전: D-Day 준비 알림</li>
          <li>등록한 이메일로 자동 발송됩니다</li>
        </ul>
      </div>
    </div>
  );
}
