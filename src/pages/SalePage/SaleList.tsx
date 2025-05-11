import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BidHistory.css';  // BidHistory 스타일을 재활용

interface Sale {
  id: number;
  image: string;
  title: string;
  artist: string;
  count: number;
  date: string;
  price: string;
  method: string;
}

const dummyData: Sale[] = [
  { id: 1, image: '/images/sample6.jpg', title: 'coconut', artist: 'coco', count: 20, date: '2025.03.05', price: '200,000원', method: '개인의뢰' },
  { id: 2, image: '/images/sample7.jpg', title: 'peach',   artist: 'uouo', count: 15, date: '2025.03.10', price: '150,000원', method: '경매'     },
  { id: 3, image: '/images/sample8.jpg', title: 'banana',  artist: 'bana', count: 10, date: '2025.03.15', price: '100,000원', method: '개인의뢰' },
  { id: 4, image: '/images/sample9.jpg', title: 'apple',   artist: 'appl', count:  5, date: '2025.03.20', price: '120,000원', method: '경매'     },
  { id: 5, image: '/images/sample9.jpg', title: 'apple',   artist: 'appl', count:  5, date: '2025.03.20', price: '120,000원', method: '경매'     },
  { id: 6, image: '/images/sample9.jpg', title: 'apple',   artist: 'appl', count:  5, date: '2025.03.20', price: '120,000원', method: '경매'     },
  { id: 7, image: '/images/sample9.jpg', title: 'apple',   artist: 'appl', count:  5, date: '2025.03.20', price: '120,000원', method: '경매'     },
  { id: 8, image: '/images/sample9.jpg', title: 'apple',   artist: 'appl', count:  5, date: '2025.03.20', price: '120,000원', method: '경매'     },

];

const SaleList: React.FC = () => {
  const navigate = useNavigate();

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = dummyData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      {/* 타이틀 */}
      <div className="bid-history-title">
        <h2>판매 내역</h2>
        <p className="bid-date">2025.03.01 - 2025.03.31</p>
      </div>

      {/* 리스트 */}
      <div className="bid-list">
        {currentItems.map(item => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => navigate(`/Art/${item.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bid-artwork">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>작가: {item.artist}</p>
              <p>판매횟수: {item.count}</p>
              <p className="bid-amount">판매금액: {item.price}</p>
              <p>판매방식: {item.method}</p>
              <p>판매날짜: {item.date}</p>
            </div>
            <div className="bid-actions">
              <button className="detail-button">상세 ▶</button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`page-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SaleList;
