import { useRouter } from 'next/router';

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter();

  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => router.replace('/')}
      >
        <img src="/logo1.png" alt="Y-NOT Logo" style={{ height: '40px', width: 'auto' }} />
      </div>
      
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="/certificates" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>About Qualification</a>
            <a href="/curriculums" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>My Qualiculum</a>
            <a href="/my" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>My page</a>
          </nav>
          <span>안녕하세요, {user.name}님!</span>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/certificates" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>About Qualification</a>
          <a href="/login" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>로그인</a>
          <a href="/register" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: '500' }}>회원가입</a>
        </nav>
      )}
    </header>
  );
}
