import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";

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

const SaleStatusList: React.FC = () => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<SaleStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/profile/sale-status", {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item.tradeId,
          title: item.postTitle,
          image: item.thumbnailPath,
          artist: item.postDTO?.user?.nickname ?? "나",
          regDate: item.createdAt?.substring(0, 10) ?? "",
          auctionStart: item.createdAt?.substring(0, 10) ?? "", // 실제 시작시간 필요시 수정
          saleEnd: item.expiredAt?.substring(0, 10) ?? "", // 필요시 Trade에 추가
          method: item.nowBuy ? "즉시구매" : "경매",
          status: item.tradeStatus ? "진행중" : "마감",
        }));
        setStatuses(mapped);
      });
  }, []);

  const currentItems = statuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(statuses.length / itemsPerPage);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>판매 현황</h2>
      </div>
      <div className="bid-list">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
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
                <p>등록일: {item.regDate}</p>
                <p>경매시작: {item.auctionStart}</p>
                <p>판매마감: {item.saleEnd}</p>
                <p>방식: {item.method}</p>
                <p className="bid-amount">상태: {item.status}</p>
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
            </div>
          ))
        ) : (
          <div className="bid-item" style={{ justifyContent: "center", padding: "30px" }}>
            <p>판매 현황이 없습니다.</p>
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

export default SaleStatusList;