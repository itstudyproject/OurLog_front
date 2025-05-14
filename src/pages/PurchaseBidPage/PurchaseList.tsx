// src/pages/PurchaseBidPage/PurchaseList.tsx
import React from 'react';
import '../../styles/PurchaseList.css';

const dummyData = [
  {
    image: '/images/sample1.jpg',
    title: '자화상 - 일러스트',
    artist: 'Allen Doichi',
    date: '2025.03.07',
    price: '20,000원',
    method: '경매로 입찰',
  },
  {
    image: '/images/sample2.jpg',
    title: '작품명',
    artist: '작가명',
    date: '2025.03.07',
    price: '25,000원',
    method: '경매로 입찰',
  },
  {
    image: '/images/sample3.jpg',
    title: '작품명',
    artist: '작가명',
    date: '2025.03.07',
    price: '10,000원',
    method: '경매로 입찰',
  },
];

const PurchaseList = () => {
  return (
    <div className="purchase-list">
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
          <li key={idx} className="purchase-item">
            <img src={item.image} alt={item.title} className="item-image" />
            <div className="item-info">
              <p className="purchase-item-title">{item.title}</p>
              <p className="artist">{item.artist}</p>
              <p>구매날짜 {item.date}</p>
              <p>구매금액 {item.price}</p>
              <p>구매방식 {item.method}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="pagination">
        {'<'} 1 2 3 4 5 6 7 {'>'}
      </div>
    </div>
  );
};

export default PurchaseList;
