// src/pages/BookmarkPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BidHistory.css'; // BidHistory.css를 그대로 재활용

interface Bookmark {
  id: number;
  imageSrc: string;
  title: string;
  artist: string;
  bookmarkedDate: string;
  method: string;
  status: string;
}

const bookmarkData: Bookmark[] = [
  { id: 1, imageSrc: '/images/bookmark1.jpg', title: 'Peach Garden',  artist: 'Minji', bookmarkedDate: '2025.05.01', method: '경매',   status: '입찰중'   },
  { id: 2, imageSrc: '/images/bookmark2.jpg', title: 'Summer Breeze', artist: 'Yuna', bookmarkedDate: '2025.04.22', method: '개인의뢰', status: '판매완료' },
  { id: 3, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },
  { id: 4, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },
  { id: 5, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },
  { id: 6, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },
  { id: 7, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },
  { id: 8, imageSrc: '/images/bookmark3.jpg', title: 'Silent Night',  artist: 'Jisoo', bookmarkedDate: '2025.04.10', method: '경매',   status: '대기중'   },

];

const BookmarkPage: React.FC = () => {
  const navigate = useNavigate();

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 현재 페이지 아이템
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = bookmarkData.slice(indexOfFirst, indexOfLast);

  // 전체 페이지 수
  const totalPages = Math.ceil(bookmarkData.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      {/* 제목 및 날짜 */}
      <div className="bid-history-title">
        <h2>북마크한 작품들</h2>
        <p className="bid-date">2025.04.01 - 2025.05.01</p>
      </div>

      {/* 리스트 영역 */}
      <div className="bid-list">
        {currentItems.map(item => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => navigate(`/art/${item.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bid-artwork">
              <img src={item.imageSrc} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>작가: {item.artist}</p>
              <p>북마크 날짜: {item.bookmarkedDate}</p>
              <p>판매방식: {item.method}</p>
              <p>현재상태: {item.status}</p>
            </div>
            <div className="bid-actions">
              <button
                className="detail-button"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/art/${item.id}`);
                }}
              >
                자세히 ▶
              </button>
              <button
                className="bid-now-button"
                onClick={e => {
                  e.stopPropagation();
                  alert(`${item.id}번 작품 북마크 해제`);
                }}
              >
                북마크 해제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination" style={{ textAlign: 'center', marginTop: '1rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`page-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ margin: '0 4px' }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookmarkPage;
