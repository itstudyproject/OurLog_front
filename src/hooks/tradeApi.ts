// src/hooks/tradeApi.ts
import { getAuthHeaders } from '../utils/auth';

export interface TradeDTO {
  id: number;
  title: string;
  price: number;
  thumbnailUrl?: string;
}

// 서버에서 내려주는 전체 응답 형태
export interface PurchaseResponse {
  currentBids: TradeDTO[];
  wonTrades:   TradeDTO[];
}

export async function fetchPurchases(
  userId: number
): Promise<PurchaseResponse> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');

  const res = await fetch(
    `http://localhost:8080/ourlog/profile/purchases/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`구매목록 조회 실패: ${errorText}`);
  }

  // json의 형태가 { currentBids: [...], wonTrades: [...] } 이라고 가정
  const json = (await res.json()) as {
    currentBids?: TradeDTO[];
    wonTrades?:   TradeDTO[];
  };

  return {
    currentBids: Array.isArray(json.currentBids) ? json.currentBids : [],
    wonTrades:   Array.isArray(json.wonTrades)   ? json.wonTrades   : [],
  };
}

// ──────────────────────────────────────────────
// 판매목록 조회 함수는 그대로 유지
export async function fetchSales(userId: number): Promise<TradeDTO[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');

  const res = await fetch(
    `http://localhost:8080/ourlog/profile/sales/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`판매목록 조회 실패: ${errorText}`);
  }

  return res.json();
}
