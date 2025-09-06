import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import { commonStyles } from '../utils/common';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const interestCategories = [
  "데이터분석", "클라우드", "보안", "AI/ML", "웹개발",
  "모바일", "네트워크", "데이터베이스", "프로젝트관리", "디자인"
];

const majors = [
  "컴퓨터공학", "정보통신공학", "소프트웨어학과", "전자공학", "수학과",
  "통계학과", "경영학과", "경제학과", "산업공학", "기타"
];

const jobs = [
  "학생", "개발자", "데이터분석가", "기획자", "마케터",
  "디자이너", "연구원", "교육자", "프리랜서", "기타"
];

export default function Register() {
  const [step, setStep] = useState(1); // 1: 계정정보, 2: 개인정보
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    gender: '',
    majorJob: '',
    interests: [] as string[],
    major: '',
    email: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNextStep = () => {
    setError('');
    
    if (!formData.username.trim()) {
      setError('아이디를 입력해주세요');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setStep(2);
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleNext = () => {
    setError('');
    
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요');
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setError('비밀번호는 영문자, 숫자, 특수문자를 포함하여 8자리 이상이어야 합니다');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.agreeTerms) {
      setError('이용약관 및 개인정보 처리방침에 동의해주세요');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL.replace(/\/$/, '')}/register`, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender,
        majorJob: formData.majorJob,
        interests: formData.interests,
        email: formData.email
      });

      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      router.replace('/login');
    } catch (error: any) {
      setError(error.response?.data?.error || '회원가입에 실패했습니다');
    }
    setLoading(false);
  };

  return (
    <div style={commonStyles.container}>
      <Header />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
      }}>
        <div style={{
          ...commonStyles.card,
          width: '100%',
          maxWidth: '500px'
        }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>회원가입</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            borderRadius: '50%', 
            backgroundColor: step >= 1 ? '#007bff' : '#ddd',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>1</div>
          <div style={{ width: '50px', height: '2px', backgroundColor: step >= 2 ? '#007bff' : '#ddd' }}></div>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            borderRadius: '50%', 
            backgroundColor: step >= 2 ? '#007bff' : '#ddd',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>2</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <span>계정정보</span>
          <span>개인정보</span>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>🔐 계정정보 입력</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>아이디</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="사용할 아이디를 입력해주세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="6자 이상 입력해주세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력해주세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            다음 →
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              ←
            </button>
            <h3 style={{ color: '#333', margin: 0 }}>👤 개인정보 입력</h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="실명을 입력해주세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>생년월일 *</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>성별 *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">선택해주세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>학과/직업 *</label>
            <select
              name="majorJob"
              value={formData.majorJob}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">선택해주세요</option>
              <optgroup label="학과">
                {majors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </optgroup>
              <optgroup label="직업">
                {jobs.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>관심사 (선택사항)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '10px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa'
            }}>
              {interestCategories.map(interest => (
                <label key={interest} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '5px'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    style={{ marginRight: '8px' }}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>이메일 *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa'
            }}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontSize: '14px' }}>
                <strong>이용약관 및 개인정보 처리방침</strong>에 동의합니다 *
              </span>
            </label>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '가입 중...' : '회원가입 완료'}
          </button>
        </form>
      )}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              이미 계정이 있으신가요? 로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
