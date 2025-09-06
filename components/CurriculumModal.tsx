interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  certName: string;
}

export default function CurriculumModal({ isOpen, onClose, certName }: CurriculumModalProps) {
  if (!isOpen) return null;

  const mockRecommendations = {
    books: [
      {
        title: `${certName} 완벽 가이드`,
        author: '전문가 저자',
        publisher: '기술출판사',
        link: 'https://example.com/book1'
      },
      {
        title: `${certName} 실전 문제집`,
        author: '시험 전문가',
        publisher: '학습출판사',
        link: 'https://example.com/book2'
      }
    ],
    videos: [
      {
        title: `${certName} 완전정복 강의`,
        instructor: '전문 강사',
        platform: '온라인 강의 플랫폼',
        link: 'https://example.com/video1'
      },
      {
        title: `${certName} 실습 중심 강의`,
        instructor: '실무 전문가',
        platform: '교육 플랫폼',
        link: 'https://example.com/video2'
      }
    ]
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>{certName} 추천 자료</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#007bff', marginBottom: '15px' }}>📚 추천 교재</h3>
          {mockRecommendations.books.map((book, index) => (
            <div key={index} style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{book.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                저자: {book.author} | 출판사: {book.publisher}
              </p>
              <button
                onClick={() => window.open(book.link, '_blank')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                구매하기 →
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🎥 추천 영상</h3>
          {mockRecommendations.videos.map((video, index) => (
            <div key={index} style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{video.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                강사: {video.instructor} | 플랫폼: {video.platform}
              </p>
              <button
                onClick={() => window.open(video.link, '_blank')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                강의 보기 →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
