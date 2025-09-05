import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      router.push('/login');
    } catch (error: any) {
      setError(error.response?.data?.error || '회원가입에 실패했습니다');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>회원가입</h1>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
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
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/login" style={{ color: '#007bff' }}>
          이미 계정이 있으신가요? 로그인
        </a>
      </div>
    </div>
  );
}
