// src/hooks/tradeApi.ts
import { getAuthHeaders } from '../utils/auth';

export interface TradeDTO {
  tradeId: number; // 거래 ID
  postId: number; // 게시글 ID
  startPrice: number; // 시작가
  highestBid: number; // 현재 최고 입찰가
  nowBuy: number | null; // 즉시 구매가
  tradeStatus: boolean; // 거래 상태 (true: 종료, false: 진행 중)
  lastBidTime?: string; // 마지막 입찰 시간 또는 경매 종료 시간
  bidderId?: number; // 현재 최고 입찰자 ID
  bidderNickname?: string; // 현재 최고 입찰자 닉네임
  postTitle?: string; // 게시글 제목 (백엔드 API에 추가 필요)
  postImage?: string;
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
