// src/pages/SalePage/SaleList.tsx

import React from 'react';
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
  {
    id: 1,
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
  {
    id: 2,
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
  {
    id: 3,
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
];

const SaleList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bid-history-container">
      {/* 섹션 타이틀 */}
      <div className="bid-history-title">
        <h2>판매 내역</h2>
        <p className="bid-date">2025.03.01 - 2025.03.31</p>
      </div>

      {/* 판매 리스트 */}
      <div className="bid-list">
        {dummyData.map(item => (
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

      {/* 뒤로가기 버튼 */}
      <div className="bid-history-footer">
        <button onClick={() => navigate(-1)} className="back-button">
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default SaleList;
