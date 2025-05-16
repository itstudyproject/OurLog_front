// src/hooks/tradeApi.ts
export interface TradeDTO {
  id: number;
  title: string;
  price: number;
  // …백엔드 DTO에 맞춰서 필드 추가
}

export async function fetchPurchases(userId: number): Promise<TradeDTO[]> {
  const token = localStorage.getItem('token');  // 로그인 시 저장한 JWT
  if (!token) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/purchases/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`구매목록 조회 실패: ${errorText}`);
  }

  return res.json();
}
