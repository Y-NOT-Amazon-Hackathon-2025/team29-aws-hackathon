import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    gender: '',
    major: '',
    interests: '',
    email: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
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

    if (!formData.name || !formData.birthDate || !formData.gender || !formData.major || !formData.email || !formData.agreeTerms) {
      setError('필수 항목을 모두 입력하고 약관에 동의해주세요');
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
        major: formData.major,
        interests: formData.interests,
        email: formData.email
      });

      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      router.push('/login');
    } catch (error: any) {
      setError(error.response?.data?.error || '회원가입에 실패했습니다');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header />

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '3rem',
          width: '100%',
          maxWidth: '500px',
          position: 'relative'
        }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '14px', color: step === 1 ? '#007bff' : '#6c757d' }}>계정정보</span>
              <span style={{ fontSize: '14px', color: step === 2 ? '#007bff' : '#6c757d' }}>개인정보</span>
            </div>
            <div style={{
              height: '4px',
              backgroundColor: '#e9ecef',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#007bff',
                width: step === 1 ? '50%' : '100%',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: '#2c3e50',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            회원가입
          </h1>

          {step === 1 ? (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  아이디
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  영문자, 숫자, 특수문자 포함 8자리 이상
                </small>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              {error && (
                <div style={{ 
                  color: '#dc3545', 
                  marginBottom: '1.5rem',
                  padding: '12px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                다음
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  생년월일 *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  성별 *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                >
                  <option value="">선택해주세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  학과/직업 *
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  관심사 (선택사항)
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: '#495057', fontSize: '14px' }}>
                    이용약관 및 개인정보처리방침에 동의합니다 *
                  </span>
                </label>
              </div>

              {error && (
                <div style={{ 
                  color: '#dc3545', 
                  marginBottom: '1.5rem',
                  padding: '12px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: loading ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#218838')}
                  onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#28a745')}
                >
                  {loading ? '가입 중...' : '회원가입'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ color: '#6c757d', fontSize: '14px' }}>이미 계정이 있으신가요? </span>
            <a href="/login" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
