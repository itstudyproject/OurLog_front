// src/pages/PurchaseBidPage/BidStatusList.tsx
import React from 'react';
import '../../styles/BidStatusList.css';

const dummyData = [
  {
    image: '/images/sample4.jpg',
    title: '천경자 “자화상” 일러스트',
    startTime: '2025.03.15 PM 15:00',
    endTime: '2025.03.18 PM 19:00',
    bidPrice: '20,000원',
    status: '진행중',
    participants: 23,
    isParticipating: true,
  },
  {
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

const BidStatusList = () => {
  return (
    <div className="bid-status-list">
      {/* 정렬 필터 */}
      <div className="filter-row">
        <select>
          <option>날짜순</option>
          <option>금액순</option>
        </select>
        <button className="date-filter">검색기간 설정</button>
      </div>

      {/* 리스트 */}
      <ul className="item-list">
        {dummyData.map((item, idx) => (
          <li key={idx} className="bid-item">
            <img src={item.image} alt={item.title} className="item-image" />
            <div className="item-info">
              <p className="title">{item.title}</p>
              <p>시작시간 {item.startTime}</p>
              <p>종료시간 {item.endTime}</p>
              <p>입찰금 {item.bidPrice}</p>
              <p>입찰상태 {item.status}</p>
              <p>현재참여자수 {item.participants}</p>
            </div>
            <div className="button-col">
              {item.isParticipating ? (
                <button className="btn active">입찰참여중</button>
              ) : (
                <button className="btn">입찰참여</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="pagination">
        {'<'} 1 2 3 4 5 {'>'}
      </div>
    </div>
  );
};

export default BidStatusList;
