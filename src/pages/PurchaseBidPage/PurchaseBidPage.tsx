import React, { useEffect, useState } from 'react';
import { fetchPurchases, TradeDTO } from '../../hooks/tradeApi';

const PurchaseBidPage: React.FC = () => {
  const stored = localStorage.getItem('user');
  const userId = stored ? (JSON.parse(stored).userId as number) : null;
  const [purchases, setPurchases] = useState<TradeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('유저 정보가 없습니다.');
      setLoading(false);
      return;
    }

    fetchPurchases(userId)
      .then((data) => {
        setPurchases(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>로딩 중…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>구매 / 입찰 목록</h3>
      {purchases.length === 0
        ? <p>내역이 없습니다.</p>
        : (
          <ul>
            {purchases.map((trade) => (
              <li key={trade.id}>
                {trade.title} — ₩{trade.price.toLocaleString()}
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
};

export default PurchaseBidPage;
