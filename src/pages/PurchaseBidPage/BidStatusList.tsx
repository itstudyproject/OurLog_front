// src/pages/PurchaseBidPage/BidStatusList.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BidHistory.css';  // BidHistory 스타일을 재활용

interface BidStatus {
  id: number;
  image: string;
  title: string;
  startTime: string;
  endTime: string;
  bidPrice: string;
  status: string;
  participants: number;
  isParticipating: boolean;
}

const dummyData: BidStatus[] = [
  {
    id: 1,
    image: '/images/sample4.jpg',
    title: '천경자 "자화상" 일러스트',
    startTime: '2025.03.15 PM 15:00',
    endTime: '2025.03.18 PM 19:00',
    bidPrice: '20,000원',
    status: '진행중',
    participants: 23,
    isParticipating: true,
  },
  {
    id: 2,
    image: '/images/sample5.jpg',
    title: '작품명',
    startTime: '2025.04.01 PM 13:00',
    endTime: '2025.04.03 PM 17:00',
    bidPrice: '15,000원',
    status: '마감',
    participants: 12,
    isParticipating: false,
  },
  {
    id: 3,
    image: '/images/sample5.jpg',
    title: '작품명',
    startTime: '2025.04.01 PM 13:00',
    endTime: '2025.04.03 PM 17:00',
    bidPrice: '15,000원',
    status: '마감',
    participants: 12,
    isParticipating: false,
  },
];

const BidStatusList: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  return (
    <div className="bid-history-container">
      {/* 섹션 타이틀 */}
      <div className="bid-history-title">
        <h2>입찰 현황</h2>
        <p className="bid-date">2025.03.15 - 2025.04.03</p>
      </div>

      {/* 리스트 */}
      <div className="bid-list">
        {dummyData.map(item => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => handleCardClick(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bid-artwork">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>시작시간: {item.startTime}</p>
              <p>종료시간: {item.endTime}</p>
              <p className="bid-amount">입찰금: {item.bidPrice}</p>
              <p>입찰상태: {item.status}</p>
              <p>참여자: {item.participants}</p>
            </div>
            <div className="bid-actions">
              {item.isParticipating ? (
                <button className="detail-button">상세 ▶</button>
              ) : (
                <button className="bid-now-button">입찰참여</button>
              )}
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

export default BidStatusList;
