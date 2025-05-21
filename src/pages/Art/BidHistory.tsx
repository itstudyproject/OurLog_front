import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/BidHistory.css';
import { getAuthHeaders, hasToken } from '../../utils/auth'; // 인증 헤더 가져오기 함수 임포트

// 백엔드에서 받아올 입찰 기록 항목에 대한 인터페이스 (백엔드 API 응답에 맞춰 수정 필요)
// TradeServiceImpl.getPurchaseList의 반환 구조에 맞춰 수정
interface PurchaseOrBidEntry {
  tradeId: number; // 거래 ID
  postId: number; // 게시글 ID
  startPrice: number; // 시작가
  highestBid: number; // 현재 최고 입찰가
  nowBuy: number | null; // 즉시 구매가
  tradeStatus: boolean; // 거래 상태 (true: 종료, false: 진행 중)
  lastBidTime?: string; // 마지막 입찰 시간 또는 경매 종료 시간
  bidderId?: number; // 현재 최고 입찰자 ID
  bidderNickname?: string; // 현재 최고 입찰자 닉네임
  // 추가 필드 (예: 게시글 제목, 이미지 경로 등)가 필요하다면 여기에 추가
  postTitle?: string; // 게시글 제목 (백엔드 API에 추가 필요)
  postImage?: string; // 게시글 대표 이미지 경로 (백엔드 API에 추가 필요)
}

const BidHistory = () => {
  const navigate = useNavigate();
  // tradeId 대신 사용자 ID가 필요
  // const { tradeId } = useParams<{ tradeId?: string }>(); // tradeId useParams 제거
  const [currentBids, setCurrentBids] = useState<PurchaseOrBidEntry[]>([]);
  const [wonTrades, setWonTrades] = useState<PurchaseOrBidEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [artTitle, setArtTitle] = useState<string>(''); // 게시글 제목은 목록별로 달라짐
  // const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null); // 단일 거래 정보 제거

  useEffect(() => {
    // TODO: 실제 로그인한 사용자 ID를 가져와야 합니다.
    // const currentUserId = 2; // 임시 사용자 ID (실제 구현 시 수정 필요) -> 제거

    // if (!currentUserId) { // 사용자 ID 체크 로직 제거
    //     alert("사용자 정보를 찾을 수 없습니다. 로그인이 필요합니다.");
    //     navigate('/login');
    //     setLoading(false);
    //     return;
    // }

    // fetchUserTrades(currentUserId); // 사용자 ID로 목록 가져오기 -> 인자 제거
    fetchUserTrades();

  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // 작품 상세 페이지로 이동 함수 (게시글 ID 사용)
  const handleArtworkClick = (postId: number) => {
    navigate(`/Art/${postId}`);
  };

  // fetchUserTrades 함수를 다시 정의하고 userId 인자를 제거합니다.
  const fetchUserTrades = async () => {
    setLoading(true);
    // 사용자 로그인 상태 확인
    if (!hasToken()) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      setLoading(false);
      return;
    }

    // 로그인한 사용자 정보에서 userId 가져오기
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user?.userId;

    if (!currentUserId) {
      alert("사용자 정보를 찾을 수 없습니다. 로그인이 필요합니다.");
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      // 헤더가 없는 경우는 hasToken()에서 걸러지지만, 안전을 위해 다시 체크
      if (!headers) {
          alert("로그인이 필요합니다.");
          navigate('/login');
          setLoading(false);
          return;
        }

      // 백엔드 UserProfileController의 /profile/purchases/{userId} 엔드포인트 사용
      const response = await fetch(`http://localhost:8080/ourlog/profile/purchases/${currentUserId}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        console.error(`구매/입찰 목록 조회 실패: HTTP 상태 코드 ${response.status}`);
        alert("구매 및 입찰 목록을 불러오는데 실패했습니다.");
        setCurrentBids([]); // 실패 시 빈 배열로 설정
        setWonTrades([]); // 실패 시 빈 배열로 설정
        setLoading(false);
        return;
      }

      const data = await response.json();

      // API 응답 구조에 따라 데이터 파싱
      // TradeServiceImpl.getPurchaseList의 반환 구조는 Map<String, List<TradeDTO>>
      if (data.currentBids && Array.isArray(data.currentBids) && data.wonTrades && Array.isArray(data.wonTrades)) {
          setCurrentBids(data.currentBids);
          setWonTrades(data.wonTrades);
      } else {
          console.error("Unexpected API response structure:", data);
          alert("구매 및 입찰 목록 데이터 형식이 올바르지 않습니다.");
           setCurrentBids([]); // 실패 시 빈 배열로 설정
           setWonTrades([]); // 실패 시 빈 배열로 설정
      }

    } catch (error) {
      console.error('구매/입찰 목록을 불러오는 중 오류가 발생했습니다:', error);
      alert("구매 및 입찰 목록을 불러오는 중 오류가 발생했습니다.");
      setCurrentBids([]); // 에러 발생 시 빈 배열로 설정
      setWonTrades([]); // 에러 발생 시 빈 배열로 설정
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

   // 목록이 없을 때 메시지 표시
   if (currentBids.length === 0 && wonTrades.length === 0) {
    return (
      <div className="no-data-container">
        <p>구매 및 입찰 내역이 없습니다.</p>
        <button onClick={handleGoBack}>뒤로 가기</button>
      </div>
    );
  }

  return (
    <div className="bid-history-container"> {/* 컨테이너 이름은 그대로 사용 */}

      <div className="page-title"> {/* 페이지 제목 */}
        <h2>나의 구매 및 입찰 내역</h2>
      </div>

      {/* 현재 입찰 중인 목록 */}
      <div className="bid-list-section"> {/* 섹션 분리 */}
          <h3>현재 입찰 중인 경매</h3>
          <div className="bid-list"> {/* 목록 컨테이너 재사용 */}
               {currentBids.length > 0 ? (
                currentBids.map((item) => (
                    // 각 항목 클릭 시 작품 상세로 이동
                  <div key={item.tradeId} className="bid-item data" onClick={() => handleArtworkClick(item.postId)} style={{ cursor: 'pointer' }}>
                     {/* TODO: 이미지 표시 */}
                     <div className="item-thumbnail">{item.postImage ? <img src={item.postImage} alt={item.postTitle || 'Artwork'} /> : <div className="no-image-placeholder-small">🖼️</div>}</div>
                    <div className="item-details">
                        <div className="item-title">{item.postTitle || '제목 없음'}</div>
                        <div className="item-price">현재가: {item.highestBid != null ? item.highestBid.toLocaleString() : '가격 정보 없음'}원</div>
                         {/* TODO: 남은 시간 표시 로직 추가 */}
                        <div className="item-time">남은 시간: {item.lastBidTime ? new Date(item.lastBidTime).toLocaleString() : '시간 정보 없음'}</div>
                    </div>
                     <div className="item-status">입찰 중</div> {/* 상태 표시 */}
                  </div>
                ))
            ) : (
                <div className="no-bids">현재 입찰 중인 경매가 없습니다.</div>
            )}
          </div>
      </div>

       {/* 낙찰받은 목록 */}
       <div className="bid-list-section"> {/* 섹션 분리 */}
          <h3>낙찰된 경매</h3>
          <div className="bid-list"> {/* 목록 컨테이너 재사용 */}
               {wonTrades.length > 0 ? (
                wonTrades.map((item) => (
                     // 각 항목 클릭 시 작품 상세로 이동
                   <div key={item.tradeId} className="bid-item data won" onClick={() => handleArtworkClick(item.postId)} style={{ cursor: 'pointer' }}>
                     {/* TODO: 이미지 표시 */}
                     <div className="item-thumbnail">{item.postImage ? <img src={item.postImage} alt={item.postTitle || 'Artwork'} /> : <div className="no-image-placeholder-small">🖼️</div>}</div>
                     <div className="item-details">
                         <div className="item-title">{item.postTitle || '제목 없음'}</div>
                         <div className="item-price">낙찰가: {item.highestBid != null ? item.highestBid.toLocaleString() : '가격 정보 없음'}원</div>
                         <div className="item-time">낙찰 시간: {item.lastBidTime ? new Date(item.lastBidTime).toLocaleString() : '시간 정보 없음'}</div> {/* 낙찰 시간 또는 종료 시간 */}
                     </div>
                     <div className="item-status won">낙찰</div> {/* 상태 표시 */}
                   </div>
                ))
            ) : (
                <div className="no-bids">낙찰된 경매가 없습니다.</div>
            )}
          </div>
      </div>

      <div className="bid-history-footer">
        <button onClick={handleGoBack} className="back-button">뒤로 가기</button>
      </div>
    </div>
  );
};

export default BidHistory;