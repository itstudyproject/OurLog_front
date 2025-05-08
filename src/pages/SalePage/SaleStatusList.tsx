// src/pages/SalePage/SaleStatusList.tsx
import React from 'react';
import '../../styles/SaleStatusList.css';

const dummyData = [
  {
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

const SaleStatusList = () => {
  return (
    <div className="purchase-list">
      <div className="filter-row">
        <select>
          <option>날짜순</option>
          <option>금액순</option>
        </select>
        <button className="date-filter">검색기간 설정</button>
      </div>

      <ul className="item-list">
        {dummyData.map((item, idx) => (
          <li key={idx} className="purchase-item">
            <img src={item.image} alt={item.title} className="item-image" />
            <div className="item-info">
              <p className="title">{item.title}</p>
              <p className="artist">{item.artist}</p>
              <p>등록일 {item.regDate}</p>
              <p>경매시작일 {item.auctionStart}</p>
              <p>판매 마감일 {item.saleEnd}</p>
              <p>판매방식 {item.method}</p>
              <p>진행상태 {item.status}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">{'<'} 1 2 3 4 5 {'>'}</div>
    </div>
  );
};

export default SaleStatusList;
