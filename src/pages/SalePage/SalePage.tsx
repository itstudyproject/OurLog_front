// src/pages/SalePage/SalePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSales, TradeDTO } from "../../hooks/tradeApi";
import "../../styles/BidHistory.css";

interface SalePageProps {
  userId: number;
}

const SalePage: React.FC<SalePageProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<TradeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales(userId)
      .then((data) => setSales(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>로딩 중…</p>;
  if (error) return <p>오류: {error}</p>;

  if (sales.length === 0) {
    return (
      <div className="bid-history-container">
        <h2>판매 현황</h2>
        <p>판매 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>판매 현황</h2>
      </div>
      <div className="bid-list">
        {sales.map((item) => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => navigate(`/art/${item.id}`)}
          >
            <div className="bid-artwork">
              <img src={item.thumbnailUrl} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>₩{item.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      {/* 필요하다면 페이징 로직 추가 */}
    </div>
  );
};

export default SalePage;
