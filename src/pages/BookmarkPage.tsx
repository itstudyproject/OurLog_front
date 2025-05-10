// src/pages/BookmarkPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BidHistory.css'; // BidHistory.css 를 그대로 재활용

interface Bookmark {
  id: number;
  imageSrc: string;
  title: string;
  artist: string;
  bookmarkedDate: string;
  method: string;
  status: string;
}

const BookmarkPage: React.FC = () => {
  const navigate = useNavigate();

  const bookmarkData: Bookmark[] = [
    {
      id: 1,
      imageSrc: '/images/bookmark1.jpg',
      title: 'Peach Garden',
      artist: 'Minji',
      bookmarkedDate: '2025.05.01',
      method: '경매',
      status: '입찰중',
    },
    {
      id: 2,
      imageSrc: '/images/bookmark2.jpg',
      title: 'Summer Breeze',
      artist: 'Yuna',
      bookmarkedDate: '2025.04.22',
      method: '개인의뢰',
      status: '판매완료',
    },
    {
      id: 3,
      imageSrc: '/images/bookmark3.jpg',
      title: 'Silent Night',
      artist: 'Jisoo',
      bookmarkedDate: '2025.04.10',
      method: '경매',
      status: '대기중',
    },
  ];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDetail = (id: number) => {
    navigate(`/art/${id}`);
  };

  const handleUnbookmark = (id: number) => {
    // TODO: 실제 언북마크 로직
    alert(`${id}번 작품 북마크 해제`);
  };

  return (
    <div className="bid-history-container">
      {/* 제목 및 날짜 */}
      <div className="bid-history-title">
        <h2>북마크한 작품들</h2>
        <p className="bid-date">2025.04.01 - 2025.05.01</p>
      </div>

      {/* 리스트 영역 */}
      <div className="bid-list">
        {bookmarkData.map((item) => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => handleDetail(item.id)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleDetail(item.id);
                }}
              >
                자세히 ▶
              </button>
              <button
                className="bid-now-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnbookmark(item.id);
                }}
              >
                북마크 해제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 뒤로 가기 버튼 */}
      <div className="bid-history-footer">
        <button onClick={handleGoBack} className="back-button">
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default BookmarkPage;
