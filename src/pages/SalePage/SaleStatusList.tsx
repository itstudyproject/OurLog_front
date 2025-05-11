// src/pages/SalePage/SaleStatusList.tsx

import React, { useState } from 'react';
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

// 더미 데이터
const dummyData: SaleStatus[] = [
  { id: 1, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.03', auctionStart: '2025.05.03', saleEnd: '2025.05.10', method: '공개입찰', status: '입찰중' },
  { id: 2, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.03', auctionStart: '2025.05.03', saleEnd: '2025.05.10', method: '공개입찰', status: '입찰중' },
  { id: 3, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.03', auctionStart: '2025.05.03', saleEnd: '2025.05.10', method: '공개입찰', status: '입찰중' },
  { id: 4, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.04', auctionStart: '2025.05.04', saleEnd: '2025.05.11', method: '공개입찰', status: '입찰중' },
  { id: 5, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.05', auctionStart: '2025.05.05', saleEnd: '2025.05.12', method: '공개입찰', status: '입찰중' },
  { id: 6, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.06', auctionStart: '2025.05.06', saleEnd: '2025.05.13', method: '공개입찰', status: '입찰중' },
  { id: 7, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.06', auctionStart: '2025.05.06', saleEnd: '2025.05.13', method: '공개입찰', status: '입찰중' },
  { id: 8, image: '/images/sample7.jpg', title: 'peach', artist: 'uouo', regDate: '2025.05.06', auctionStart: '2025.05.06', saleEnd: '2025.05.13', method: '공개입찰', status: '입찰중' },

];

const SaleStatusList: React.FC = () => {
  const navigate = useNavigate();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 현재 페이지에 해당하는 아이템들
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = dummyData.slice(indexOfFirst, indexOfLast);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  // 페이지 버튼 클릭 핸들러
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bid-history-container">
      {/* 섹션 타이틀 */}
      <div className="bid-history-title">
        <h2>판매 현황</h2>
        <p className="bid-date">2025.05.03 - 2025.05.10</p>
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

      {/* 페이지네이션 */}
      <div className="pagination" style={{ textAlign: 'center', marginTop: '1rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`page-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => handlePageClick(page)}
            style={{ margin: '0 4px' }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SaleStatusList;
