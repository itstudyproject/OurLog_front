import React from 'react';
import '../styles/PurchaseList.css';

const bookmarkData = [
  {
    image: '/images/bookmark1.jpg',
    title: 'Peach Garden',
    artist: 'Minji',
    bookmarkedDate: '2025.05.01',
    method: '경매',
    status: '입찰중',
  },
  {
    image: '/images/bookmark2.jpg',
    title: 'Summer Breeze',
    artist: 'Yuna',
    bookmarkedDate: '2025.04.22',
    method: '개인의뢰',
    status: '판매완료',
  },
  {
    image: '/images/bookmark3.jpg',
    title: 'Silent Night',
    artist: 'Jisoo',
    bookmarkedDate: '2025.04.10',
    method: '경매',
    status: '대기중',
  },
];

const BookmarkPage = () => {
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

      {/* 북마크 아이템 리스트 */}
      <ul className="item-list">
        {bookmarkData.map((item, idx) => (
          <li key={idx} className="purchase-item">
            <img src={item.image} alt={item.title} className="item-image" />
            <div className="item-info">
              <p className="title">{item.title}</p>
              <p className="artist">{item.artist}</p>
              <p>북마크 날짜 {item.bookmarkedDate}</p>
              <p>판매방식 {item.method}</p>
              <p>현재 상태 {item.status}</p>
              <div className="button-group">
                <button className="detail-btn">자세히 보기</button>
                <button className="unbookmark-btn">북마크 해제</button>
              </div>
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

export default BookmarkPage;
