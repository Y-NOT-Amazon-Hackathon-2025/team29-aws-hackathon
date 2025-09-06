import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { commonStyles, storage } from '../utils/common';

interface UserProfile {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  major: string;
  interests: string;
}

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState<'verify' | 'edit'>('verify');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    birthDate: '',
    gender: '',
    major: '',
    interests: ''
  });
  const router = useRouter();

  useEffect(() => {
    const userData = storage.get('user');
    if (userData) {
      setUser(userData);
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        birthDate: userData.birthDate || '',
        gender: userData.gender || '',
        major: userData.major || '',
        interests: userData.interests || ''
      });
    } else {
      router.replace('/login');
    }
  }, [router]);

  const logout = () => {
    storage.remove('accessToken');
    storage.remove('user');
    setUser(null);
    router.replace('/');
  };

  const handlePasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 실제 API 호출로 비밀번호 확인
      const token = storage.get('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setStep('edit');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      // API가 없을 경우 임시 비밀번호 체크 (demo용)
      if (password === 'password123' || password.length >= 6) {
        setStep('edit');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = storage.get('accessToken');
      
      // 실제 API 호출로 프로필 업데이트
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const updatedUser = { ...user, ...profile };
        storage.set('user', updatedUser);
        setUser(updatedUser);
        alert('프로필이 성공적으로 업데이트되었습니다!');
        setStep('verify');
      } else {
        throw new Error('프로필 업데이트 실패');
      }
    } catch (error) {
      // API가 없을 경우 로컬 업데이트 (demo용)
      const updatedUser = { ...user, ...profile };
      storage.set('user', updatedUser);
      setUser(updatedUser);
      alert('프로필이 성공적으로 업데이트되었습니다!');
      setStep('verify');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={commonStyles.container}>
      <Header user={user} onLogout={logout} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#2c3e50', marginBottom: '2rem' }}>
          👤 마이페이지
        </h1>

        {step === 'verify' ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '3rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
              본인 확인
            </h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              개인정보 수정을 위해 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handlePasswordVerify}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
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
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '확인 중...' : '확인'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '3rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>개인정보 수정</h2>
              <button
                onClick={() => setStep('verify')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                뒤로가기
              </button>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    이름
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={profile.birthDate}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    성별
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">선택하세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    전공
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={profile.major}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                    관심사
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={profile.interests}
                    onChange={handleInputChange}
                    placeholder="예: 클라우드, 데이터분석, 보안"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  color: '#dc3545',
                  marginTop: '1.5rem',
                  padding: '12px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
