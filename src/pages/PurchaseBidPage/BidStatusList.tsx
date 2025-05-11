// src/pages/PurchaseBidPage/BidStatusList.tsx

import React, { useState } from 'react';
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
  {
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 한 페이지에 보여줄 아이템 개수

  // 현재 페이지 아이템들
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = dummyData.slice(indexOfFirst, indexOfLast);

  // 전체 페이지 수
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 페이지 이동 핸들러
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카드 클릭 핸들러
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
        {currentItems.map(item => (
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

          {/* 페이지네이션 버튼 */}
      <div className="pagination" style={{ textAlign: 'center', marginTop: '1rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`page-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => setCurrentPage(page)}
            style={{ margin: '0 4px' }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BidStatusList;
