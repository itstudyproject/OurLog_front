import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/BidHistory.css';
import { getAuthHeaders } from '../../utils/auth'; // 인증 헤더 가져오기 함수 임포트

// 백엔드에서 받아올 입찰 기록 항목에 대한 인터페이스 (백엔드 API 응답에 맞춰 수정 필요)
interface BidHistoryEntry {
  bidId?: number; // 입찰 ID (있다면)
  bidAmount: number; // 입찰 금액
  bidderNickname?: string; // 입찰자 닉네임 (백엔드에서 제공된다면)
  bidTime: string; // 입찰 시간 (ISO 8601 형식 문자열 또는 Date)
  // 추가 필드 (예: bidderId 등)가 필요하다면 여기에 추가
}

// Trade 정보 (API 응답에 포함될 수 있음)
interface TradeInfo {
  tradeId: number;
  postId: number;
  startPrice: number;
  highestBid: number;
  nowBuy: number | null;
  tradeStatus: boolean;
  startBidTime?: string;
  lastBidTime?: string; // 경매 종료 시간 또는 마지막 입찰 시간
  // 추가 필드 (예: 게시글 제목, 이미지 경로 등)가 필요하다면 여기에 추가
  postTitle?: string; // 게시글 제목
  postImage?: string; // 게시글 대표 이미지 경로
}

const BidHistory = () => {
  const navigate = useNavigate();
  // URL 파라미터에서 tradeId를 가져옵니다.
  const { tradeId } = useParams<{ tradeId?: string }>();
  const [bids, setBids] = useState<BidHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [artTitle, setArtTitle] = useState<string>(''); // 게시글 제목은 API에서 가져올 수 있도록
  const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null);

  useEffect(() => {
    // tradeId가 없으면 처리 중지
    if (!tradeId) {
      console.error("Trade ID is missing in URL parameters.");
      setLoading(false);
      return;
    }

    // 실제 구현에서는 API 호출로 데이터를 가져오게 됩니다
    const fetchBidHistory = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          alert("로그인이 필요합니다.");
          navigate('/login');
          setLoading(false);
          return;
        }

        // TODO: 백엔드에서 해당 tradeId의 입찰 기록 목록을 가져오는 API 엔드포인트를 호출해야 합니다.
        // 현재는 더미 데이터를 사용하거나 빈 목록을 설정합니다.

        // 백엔드 API 예시 (가정): GET /ourlog/trades/{tradeId}/bids
        // const response = await fetch(`http://localhost:8080/ourlog/trades/${tradeId}/bids`, {
        //   method: 'GET',
        //   headers: headers,
        // });

        // if (!response.ok) {
        //   console.error(`입찰 기록 조회 실패: HTTP 상태 코드 ${response.status}`);
        //   alert("입찰 기록을 불러오는데 실패했습니다.");
        //   setLoading(false);
        //   return;
        // }

        // const data = await response.json();
        // setBids(data.bids); // API 응답 구조에 따라 조정 필요
        // setTradeInfo(data.tradeInfo); // API 응답 구조에 따라 조정 필요

        // 테스트용 더미 데이터 (백엔드 API 구현 후 삭제)
        const dummyBids: BidHistoryEntry[] = [
           { bidAmount: 60000, bidderNickname: '입찰자1', bidTime: '2023-03-20T15:00:00' },
           { bidAmount: 50000, bidderNickname: '입찰자2', bidTime: '2023-03-20T14:00:00' },
           { bidAmount: 40000, bidderNickname: '입찰자3', bidTime: '2023-03-20T13:00:00' },
        ];

        // API 응답에 거래 정보가 포함된다고 가정하고 설정
         const dummyTradeInfo: TradeInfo = {
             tradeId: Number(tradeId),
             postId: 123, // 예시
             startPrice: 30000,
             highestBid: 60000,
             nowBuy: 100000,
             tradeStatus: false, // 진행 중
             startBidTime: '2023-03-16T09:00:00',
             lastBidTime: '2023-03-24T18:00:00',
             postTitle: '뚱글뚱글 파스타',
             postImage: '/images/파스타.jpg'
         };

        setBids(dummyBids);
        setTradeInfo(dummyTradeInfo);
        setLoading(false);
      } catch (error) {
        console.error('입찰 기록을 불러오는 중 오류가 발생했습니다:', error);
        alert("입찰 기록을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchBidHistory();
  }, [tradeId, navigate]); // tradeId 또는 navigate 변경 시 재실행

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleArtworkClick = () => {
    if (tradeInfo?.postId) {
      navigate(`/Art/${tradeInfo.postId}`);
    } else {
      console.warn("Post ID is missing, cannot navigate to artwork detail.");
      alert("작품 상세 정보를 찾을 수 없습니다.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

   // tradeInfo가 없으면 오류 메시지 표시
   if (!tradeInfo) {
    return (
      <div className="error-container">
        <p>경매 정보를 불러오지 못했습니다.</p>
        <button onClick={handleGoBack}>뒤로 가기</button>
      </div>
    );
  }

  return (
    <div className="bid-history-container">

      <div className="bid-history-title">
        <h2>{tradeInfo.postTitle || '입찰 목록'}</h2> {/* API에서 제목 가져오기 */}
        {/* <p className="bid-date">2023.03.16 - 2023.03.24</p> */}
         {tradeInfo.startBidTime && tradeInfo.lastBidTime && (
           <p className="bid-date">{`${new Date(tradeInfo.startBidTime).toLocaleDateString()} - ${new Date(tradeInfo.lastBidTime).toLocaleDateString()}`}</p>
         )}
      </div>

      {tradeInfo.postImage && (
         <div className="bid-artwork-preview" onClick={handleArtworkClick} style={{ cursor: 'pointer' }}>
            <img src={tradeInfo.postImage} alt={tradeInfo.postTitle || 'Artwork'} />
         </div>
      )}

      <div className="bid-list">
        {/* 헤더 행 */}
        <div className="bid-item header">
          <div className="bid-details">입찰 금액</div>
          <div className="bid-time">입찰 시간</div>
          <div className="bid-bidder">입찰자</div> {/* 입찰자 닉네임 추가 */}
        </div>
        {/* 데이터 행 */}
        {bids.length > 0 ? (
            bids.map((bid, index) => (
              <div key={index} className="bid-item data">
                <div className="bid-details">{bid.bidAmount.toLocaleString()}원</div>
                {/* bid.bidTime이 유효한 날짜 문자열인지 확인 후 포맷 */}
                 <div className="bid-time">{bid.bidTime ? new Date(bid.bidTime).toLocaleString() : '시간 정보 없음'}</div>
                <div className="bid-bidder">{bid.bidderNickname || '알 수 없음'}</div>
              </div>
            ))
        ) : (
            <div className="no-bids">아직 입찰 기록이 없습니다.</div>
        )}
      </div>

      <div className="bid-history-footer">
        <button onClick={handleGoBack} className="back-button">뒤로 가기</button>
      </div>
    </div>
  );
};

export default BidHistory;