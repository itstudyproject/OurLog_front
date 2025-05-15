import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";

interface Sale {
  id: number;
  image: string;
  title: string;
  artist: string;
  count: number;
  date: string;
  price: string | number;
  method: string;
}

const SaleList: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/trades/mypage/sales", {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item.tradeId,
          image: item.thumbnailPath,
          title: item.postTitle,
          price: item.nowBuy ?? item.highestBid ?? 0,
          method: item.nowBuy ? "즉시구매" : "경매",
          date: item.createdAt?.substring(0, 10) ?? "",
          count: 1, // 혹시 판매 횟수가 있으면 백에서 처리
          artist: item.postDTO?.user?.nickname ?? "나",
        }));
        setSales(mapped);
      });
  }, []);

  const currentItems = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>판매 내역</h2>
      </div>
      <div className="bid-list">
<<<<<<< HEAD
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => navigate(`/art/${item.id}`)}
          >
            <div className="bid-artwork">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>작가: {item.artist}</p>
              <p>판매횟수: {item.count}</p>
              <p className="bid-amount">판매금액: {item.price}</p>
              <p>판매방식: {item.method}</p>
              <p>판매날짜: {item.date}</p>
=======
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div key={item.id} className="bid-item" onClick={() => navigate(`/art/${item.id}`)}>
              <div className="bid-artwork">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="bid-details">
                <h3>{item.title}</h3>
                <p>작가: {item.artist}</p>
                <p>판매횟수: {item.count}</p>
                <p className="bid-amount">판매금액: {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}원</p>
                <p>판매방식: {item.method}</p>
                <p>판매날짜: {item.date}</p>
              </div>
              <div className="bid-actions">
                <button
                  className="detail-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/art/${item.id}`);
                  }}
                >
                  자세히 보기
                </button>
              </div>
>>>>>>> df63bbf64df1866a6b77c055120343162bd818cf
            </div>
          ))
        ) : (
          <div className="bid-item" style={{ justifyContent: "center", padding: "30px" }}>
            <p>판매 내역이 없습니다.</p>
          </div>
<<<<<<< HEAD
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`page-btn${page === currentPage ? " active" : ""}`}
          >
            {page}
          </button>
        ))}
      </div>
=======
        )}
      </div>

      {totalPages > 1 && (
        <div className="bid-history-footer">
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page} 
                onClick={() => setCurrentPage(page)} 
                className={page === currentPage ? "active" : ""}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
>>>>>>> df63bbf64df1866a6b77c055120343162bd818cf
    </div>
  );
};

export default SaleList;
