package com.example.ourLog.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TradeServiceImpl implements TradeService {

    // 입찰 갱신
    @Override
    @Transactional
    public String bidUpdate(Long tradeId, TradeDTO dto, UserAuthDTO currentBidder) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new RuntimeException("거래가 존재하지 않습니다."));

        if (trade.isTradeStatus()) {
            throw new RuntimeException("종료된 경매입니다.");
        }

        // 입찰가 기본 검증
        if (dto.getBidAmount() == null || dto.getBidAmount() <= 0) {
            throw new RuntimeException("올바른 입찰 금액을 입력해주세요.");
        }

        if (dto.getBidAmount() % 1000 != 0) {
            throw new RuntimeException("입찰가는 1000원 단위로 입력해야 합니다.");
        }

        // 즉시 구매가가 설정되어 있고, 입찰 금액이 즉시 구매가와 같은 경우
        if (trade.getNowBuy() != null && dto.getBidAmount() != null && dto.getBidAmount().equals(trade.getNowBuy())) {
            // ✅ 추가: 즉시 구매가와 같은 경우 특정 문자열 반환하여 프론트엔드에 알림
            return "EQUALS_NOW_BUY";
        }

        // 최소 입찰가 검증 (즉시 구매가보다 같거나 큰 경우는 위에서 걸러짐)
        Long minBidAmount = trade.getHighestBid() + 1000; // 최소 1000원 이상 높게
        if (dto.getBidAmount() < minBidAmount) {
            throw new RuntimeException("입찰가는 현재 최고가보다 1000원 이상 높아야 합니다.");
        }

        // 즉시 구매가보다 큰 경우 (같거나 큰 경우는 위에서 걸러졌지만, 만약을 위해 로직 유지)
         if (trade.getNowBuy() != null && dto.getBidAmount() > trade.getNowBuy()) {
              throw new RuntimeException("즉시 구매가 이상으로 입찰할 수 없습니다. 즉시 구매를 이용해주세요.");
         }


        // 입찰자 정보
        User bidder = userRepository.findById(currentBidder.getUserId())
                .orElseThrow(() -> new RuntimeException("입찰자가 존재하지 않습니다."));

        // 판매자 본인 입찰 방지
        if (bidder.getUserId().equals(trade.getUser().getUserId())) {
            throw new RuntimeException("판매자는 본인의 경매에 입찰할 수 없습니다.");
        }

        // 최고 입찰가 갱신
        trade.setHighestBid(dto.getBidAmount());

        Bid bid = Bid.builder()
                .amount(dto.getBidAmount())
                .trade(trade)
                .user(bidder)
                .bidTime(LocalDateTime.now())
                .build();

        bidRepository.save(bid);
        tradeRepository.save(trade);

        // ✅ 정상 입찰 성공 메시지 반환
        return "입찰이 등록되었습니다.";
    }
} 