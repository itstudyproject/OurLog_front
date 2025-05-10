// src/pages/PurchaseBidPage/PurchaseList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BidHistory.css';  // BidHistory 스타일을 재활용

interface Purchase {
  id: number;
  image: string;
  title: string;
  artist: string;
  date: string;
  price: string;
  method: string;
}

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출로 대체
    const dummy: Purchase[] = [
      {
        id: 1,
        image: '/images/sample1.jpg',
        title: '자화상 - 일러스트',
        artist: 'Allen Doichi',
        date: '2025.03.07',
        price: '20,000원',
        method: '경매로 입찰',
      },
      {
        id: 2,
        image: '/images/sample2.jpg',
        title: '작품명',
        artist: '작가명',
        date: '2025.03.07',
        price: '25,000원',
        method: '경매로 입찰',
      },
      {
        id: 3,
        image: '/images/sample3.jpg',
        title: '작품명',
        artist: '작가명',
        date: '2025.03.07',
        price: '10,000원',
        method: '경매로 입찰',
      },
    ];
    setPurchases(dummy);
    setLoading(false);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bid-history-container">

      {/* 구매 목록 타이틀 */}
      <div className="bid-history-title">
        <h2>구매 목록</h2>
        {/* 필요에 따라 기간을 동적으로 표시하세요 */}
        <p className="bid-date">2025.03.01 - 2025.03.07</p>
      </div>

      {/* 구매 아이템 리스트 */}
      <div className="bid-list">
        {purchases.map((item) => (
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
              <p className="bid-amount">구매금액 {item.price}</p>
              <p>구매방식: {item.method}</p>
              <p>구매날짜: {item.date}</p>
            </div>
            <div className="bid-actions">
              <button className="detail-button">상세 ▶</button>
            </div>
          </div>
        ))}
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="bid-history-footer">
        <button onClick={handleGoBack} className="back-button">
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default PurchaseList;
