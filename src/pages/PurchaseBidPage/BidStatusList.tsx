import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";

interface Trade {
  tradeId: number;
  postDTO: {
    postId: number;
  };
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
      .then(setBids)
      .catch(console.error);
  }, []);

  const currentItems = bids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(bids.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>입찰내역</h2>
      </div>

      <div className="bid-list">
        {currentItems.map((item) => (
          <div key={item.tradeId} className="bid-item" onClick={() => navigate(`/art/${item.postDTO.postId}`)}>
            <div className="bid-artwork">
              <img src={item.thumbnailPath} alt={item.postTitle} />
            </div>
            <div className="bid-details">
              <h3>{item.postTitle}</h3>
              <p>시작가: {item.startPrice.toLocaleString()}원</p>
              <p className="bid-amount">낙찰가: {item.highestBid.toLocaleString()}원</p>
              {item.nowBuy && <p>즉시구매가: {item.nowBuy.toLocaleString()}원</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`page-btn${page === currentPage ? " active" : ""}`}>
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BidStatusList;
