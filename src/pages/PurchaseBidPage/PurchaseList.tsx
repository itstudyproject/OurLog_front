// src/pages/PurchaseBidPage/PurchaseList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";
import "../../styles/PurchaseList.css";

interface Purchase {
  tradeId: number;
  postId: number;
  postTitle: string;
  artist: string;
  price: number;
  method: string;
  date: string;
  image: string;
}

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/trades/mypage/purchases", {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch 실패");
        return res.json();
      })
      .then((data) => {
        const mapped = data.map((item: any) => ({
          tradeId: item.tradeId,
          postId: item.postDTO?.postId,
          postTitle: item.postTitle || "제목 없음",
          artist: item.postDTO?.user?.nickname ?? "알 수 없음",
          price: item.nowBuy ?? item.highestBid ?? 0,
          method: item.nowBuy ? "즉시구매" : "경매낙찰",
          date: item.modifiedAt?.substring(0, 10) ?? "",
          image: item.thumbnailPath || "/images/sample1.jpg",
        }));
        setPurchases(mapped);
      })
      .catch((err) => console.error("에러 발생:", err));
  }, []);

  const currentItems = purchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(purchases.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>구매 목록</h2>
      </div>

      <div className="bid-list">
<<<<<<< HEAD
        {currentItems.map((item) => (
          <div
            key={item.tradeId}
            className="bid-item"
            onClick={() => navigate(`/art/${item.tradeId}`)}
          >
            <div className="bid-artwork">
              <img src={item.image} alt={item.postTitle} />
            </div>
            <div className="bid-details">
              <h3>{item.postTitle}</h3>
              <p className="bid-amount">
                구매금액: {item.price.toLocaleString()}원
              </p>
              <p>구매방식: {item.method}</p>
              <p>구매날짜: {item.date}</p>
=======
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.tradeId}
              className="bid-item"
              onClick={() => navigate(`/art/${item.postId}`)}
            >
              <div className="bid-artwork">
                <img src={item.image} alt={item.postTitle} />
              </div>
              <div className="bid-details">
                <h3>{item.postTitle}</h3>
                <p className="bid-amount">구매금액: {item.price.toLocaleString()}원</p>
                <p>구매방식: {item.method}</p>
                <p>구매날짜: {item.date}</p>
              </div>
              <div className="bid-actions">
                <button
                  className="detail-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/art/${item.postId}`);
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
            <p>구매 내역이 없습니다.</p>
          </div>
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
    </div>
  );
};

export default PurchaseList;
