import api from './auth';

export const curriculumApi = {
  // 커리큘럼 목록 조회
  list: () => api.get('/curriculums'),
  
  // AI 커리큘럼 생성
  create: (data) => api.post('/curriculums', data),
  
  // 커리큘럼 상세 조회
  getById: (id) => api.get(`/curriculums/${id}`),
  
  // 커리큘럼 상태 업데이트
  updateStatus: (id, status, progress = 0) => 
    api.put(`/curriculums/${id}`, { status, progress }),
  
  // 커리큘럼 삭제
  delete: (id) => api.delete(`/curriculums/${id}`),
  
  // 나의 자격증 관련
  getMyCertificates: () => api.get('/my-certificates'),
  addMyCertificate: (data) => api.post('/my-certificates', data),
  updateMyCertificate: (id, data) => api.put(`/my-certificates/${id}`, data),
  deleteMyCertificate: (id) => api.delete(`/my-certificates/${id}`)
};
