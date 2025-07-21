import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";

interface Trade {
  tradeId: number;
  postId: number;
  postTitle: string;
  thumbnailPath: string;
  startPrice: number;
  highestBid: number;
  nowBuy?: number;
  tradeStatus: boolean;
}

const BidStatusList: React.FC = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Trade[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/trades/mypage", {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        // API 응답 구조에 맞게 데이터 매핑
        const mappedData = data.map((item: any) => ({
          tradeId: item.tradeId,
          postId: item.postDTO?.postId,
          postTitle: item.postTitle || "제목 없음",
          thumbnailPath: item.thumbnailPath || "/images/sample1.jpg",
          startPrice: item.startPrice || 0,
          highestBid: item.highestBid || 0,
          nowBuy: item.nowBuy,
          tradeStatus: item.tradeStatus,
        }));
        setBids(mappedData);
      })
      .catch(console.error);
  }, []);

  const currentItems = bids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(bids.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>입찰내역</h2>
      </div>

      <div className="bid-list">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.tradeId}
              className="bid-item"
              onClick={() => navigate(`/art/${item.postId}`)}
            >
              <div className="bid-artwork">
                <img src={item.thumbnailPath} alt={item.postTitle} />
              </div>
              <div className="bid-details">
                <h3>{item.postTitle}</h3>
                <p>시작가: {item.startPrice.toLocaleString()}원</p>
                <p className="bid-amount">
                  낙찰가: {item.highestBid.toLocaleString()}원
                </p>
                {item.nowBuy && (
                  <p>즉시구매가: {item.nowBuy.toLocaleString()}원</p>
                )}
                <p>상태: {item.tradeStatus ? "진행중" : "마감"}</p>
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
            </div>
          ))
        ) : (
          <div
            className="bid-item"
            style={{ justifyContent: "center", padding: "30px" }}
          >
            <p>입찰 내역이 없습니다.</p>
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

export default BidStatusList;