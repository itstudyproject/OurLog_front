// src/pages/SalePage/SaleList.tsx
import React from 'react';
import '../../styles/SaleList.css';


const dummyData = [
  {
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
  {
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
  {
    image: '/images/sample6.jpg',
    title: 'coconut',
    artist: 'coco',
    count: 20,
    date: '2025.03.05',
    price: '200,000원',
    method: '개인의뢰',
  },
];

const SaleList = () => {
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
              <p className="sale-item-title">{item.title}</p>
              <p className="artist">{item.artist}</p>
              <p>판매횟수 {item.count}</p>
              <p>판매날짜 {item.date}</p>
              <p>판매금액 {item.price}</p>
              <p>판매방식 {item.method}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">{'<'} 1 2 3 4 5 {'>'}</div>
    </div>
  );
};

export default SaleList;
