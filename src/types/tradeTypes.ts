export interface TradeDTO {
  tradeId: number;
  postId: number;
  sellerId: number;
  bidderId: number | null; // 현재 최고 입찰자 ID
  bidderNickname: string | null; // 현재 최고 입찰자 닉네임
  startPrice: number;
  highestBid: number | null; // 현재 최고 입찰가
  bidAmount: number | null; // 입찰 단위
  nowBuy: number;
  tradeStatus: boolean; // 경매 상태 (true: 진행 중, false: 종료)
  startBidTime: string | Date | null; // 경매 시작 시간
  lastBidTime: string | Date | null; // 경매 종료 시간
} 