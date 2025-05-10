// src/pages/SalePage/SaleStatusList.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BidHistory.css';  // BidHistory 스타일 재활용

interface SaleStatus {
  id: number;
  image: string;
  title: string;
  artist: string;
  regDate: string;
  auctionStart: string;
  saleEnd: string;
  method: string;
  status: string;
}

const dummyData: SaleStatus[] = [
  {
    id: 1,
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
  {
    id: 2,
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
  {
    id: 3,
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
];

const SaleStatusList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bid-history-container">
      {/* 섹션 타이틀 */}
      <div className="bid-history-title">
        <h2>판매 현황</h2>
        <p className="bid-date">2025.05.03 - 2025.05.10</p>
      </div>

      {/* 리스트 */}
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
              <p>등록일: {item.regDate}</p>
              <p>경매시작: {item.auctionStart}</p>
              <p>판매마감: {item.saleEnd}</p>
              <p>방식: {item.method}</p>
              <p className="bid-amount">상태: {item.status}</p>
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

export default SaleStatusList;
