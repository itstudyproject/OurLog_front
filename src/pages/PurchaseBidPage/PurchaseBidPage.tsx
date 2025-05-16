// src/pages/PurchaseBidPage.tsx

import React, { useEffect, useState } from 'react';
import { fetchPurchases, TradeDTO } from '../../hooks/tradeApi';

interface PurchaseResponse {
  currentBids: TradeDTO[];
  wonTrades: TradeDTO[];
}

interface Props {
  userId: number;
}

const PurchaseBidPage: React.FC<Props> = () => {
  const stored = localStorage.getItem('user');
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  // 👇 배열 하나가 아니라, 객체 형태로 상태 선언
  const [data, setData] = useState<PurchaseResponse>({
    currentBids: [],
    wonTrades: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('유저 정보가 없습니다.');
      setLoading(false);
      return;
    }

    fetchPurchases(userId)
      .then((resp) => {
        console.log('⚡️ raw purchases response:', resp);
        setData(resp);        // 👈 resp.currentBids, resp.wonTrades 모두 들어옵니다
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
      <h3>구매</h3>
      {data.currentBids.length > 0 ? (
        <ul>
          {data.currentBids.map((trade) => (
            <li key={trade.id}>
              {trade.title} — ₩{trade.price.toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>구매한 작품이 없습니다.</p>
      )}

      <h3>입찰목록</h3>
      {data.wonTrades.length > 0 ? (
        <ul>
          {data.wonTrades.map((trade) => (
            <li key={trade.id}>
              {trade.title} — ₩{trade.price.toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>입찰한 작품이 없습니다.</p>
      )}
    </div>
  );
};

export default PurchaseBidPage;
