import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/BidHistory.css";
import { getAuthHeaders, hasToken } from "../../utils/auth"; // 인증 헤더 가져오기 함수 임포트
// import { formatRemainingTime } from '../../utils/timeUtils'; // 시간 포맷팅 유틸 함수 임포트 예정 // 사용하지 않으므로 제거

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
  startBidTime?: string; // 경매 시작 시간 (백엔드에서 추가)
  sellerId?: number; // 판매자 ID (백엔드에서 추가)
}

// userId prop을 받도록 수정
const BidHistory: React.FC<{ userId: number }> = ({ userId }) => {
  const navigate = useNavigate();
  // tradeId 대신 사용자 ID가 필요
  // const { tradeId } = useParams<{ tradeId?: string }>(); // tradeId useParams 제거
  const [currentBids, setCurrentBids] = useState<PurchaseOrBidEntry[]>([]);
  const [wonTrades, setWonTrades] = useState<PurchaseOrBidEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date()); // LocalDateTime 대신 Date 객체 사용
  // const [artTitle, setArtTitle] = useState<string>(''); // 게시글 제목은 목록별로 달라짐
  // const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null); // 단일 거래 정보 제거

  useEffect(() => {
    fetchUserTrades();
    // 의존성 배열을 빈 배열[]로 변경하여 마운트 시 1회 실행 보장
  }, []); // navigate 제거 및 빈 배열로 변경

  // 남은 시간 표시를 위한 현재 시간 업데이트
  useEffect(() => {
    // 현재 입찰 중인 목록이 있을 때만 타이머 설정
    if (currentBids.length > 0) {
      const timer = setInterval(() => {
        setCurrentTime(new Date()); // Date.now() 또는 new Date() 사용
      }, 1000); // 1초마다 업데이트

      return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 해제
    }
  }, [currentBids]); // currentBids 목록이 변경될 때마다 타이머 재설정

  const handleGoBack = () => {
    navigate(-1);
  };

  // 작품 상세 페이지로 이동 함수 (게시글 ID 사용)
  const handleArtworkClick = (postId: number) => {
    navigate(`/Art/${postId}`);
  };

  const fetchUserTrades = async () => {
    setLoading(true);

    // 사용자 로그인 상태 확인 및 userId 가져오기
    if (!hasToken()) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      setLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user?.userId;

    if (!currentUserId) {
      alert("사용자 정보를 찾을 수 없습니다. 로그인이 필요합니다.");
      navigate("/login");
      setLoading(false);
      return;
    }

    console.log("Fetching user trades for userId:", currentUserId);

    try {
      const headers = getAuthHeaders();
      console.log("Auth headers:", headers);
      if (!headers) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        setLoading(false);
        return;
      }

      console.log(
        "Calling API:",
        `http://localhost:8080/ourlog/profile/purchases/${currentUserId}`
      );
      const response = await fetch(
        `http://localhost:8080/ourlog/profile/purchases/${currentUserId}`,
        {
          method: "GET",
          headers: headers,
        }
      );
      console.log("API response received:", response);

      if (!response.ok) {
        console.error(
          `구매/입찰 목록 조회 실패: HTTP 상태 코드 ${response.status}`
        );
        alert("구매 및 입찰 목록을 불러오는데 실패했습니다.");
        setCurrentBids([]);
        setWonTrades([]);
        return;
      }

      const data = await response.json();
      console.log("API response data:", data);

      if (
        data.currentBids &&
        Array.isArray(data.currentBids) &&
        data.wonTrades &&
        Array.isArray(data.wonTrades)
      ) {
        setCurrentBids(data.currentBids);
        setWonTrades(data.wonTrades);
        console.log("State updated - currentBids:", data.currentBids);
        console.log("State updated - wonTrades:", data.wonTrades);
      } else {
        console.error("Unexpected API response structure:", data);
        alert("구매 및 입찰 목록 데이터 형식이 올바르지 않습니다.");
        setCurrentBids([]);
        setWonTrades([]);
      }
    } catch (error) {
      console.error("구매/입찰 목록을 불러오는 중 오류가 발생했습니다:", error);
      alert("구매 및 입찰 목록을 불러오는 중 오류가 발생했습니다.");
      setCurrentBids([]);
      setWonTrades([]);
    } finally {
      console.log("fetchUserTrades finished. Setting loading to false.");
      setLoading(false);
    }
  };

  const handleDownloadOriginal = (e: React.MouseEvent, item: PurchaseOrBidEntry) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    if (!item.postImage) {
      alert("다운로드할 이미지가 없습니다.");
      return;
    }

    const imageUrl = `http://localhost:8080/ourlog/picture/display/${item.postImage}`;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', `${item.postTitle || item.postId}_original.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 목록이 없을 때 메시지 표시 (로딩이 끝난 후)
  if (currentBids.length === 0 && wonTrades.length === 0) {
    return (
      <div className="bh-no-data-container">
        {" "}
        {/* 클래스 이름 변경 */}
        <p>구매 및 입찰 내역이 없습니다.</p>
        <button onClick={handleGoBack}>뒤로 가기</button>
      </div>
    );
  }

  // 남은 시간 계산 및 포맷팅 함수
  const getRemainingTime = (endTimeString: string | undefined) => {
    if (!endTimeString) return "시간 정보 없음";

    // 백엔드에서 온 시간 문자열을 Date 객체로 파싱
    const endTime = new Date(endTimeString); // Date 객체로 파싱
    const now = new Date(currentTime); // 현재 시간 Date 객체 사용

    // 시간 차이 계산 (밀리초)
    const durationMs = endTime.getTime() - now.getTime();

    if (durationMs <= 0) {
      // 0 이하이면 경매 종료
      return "경매 종료";
    }

    // 밀리초를 일, 시간, 분, 초로 변환
    const seconds = Math.floor(durationMs / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let timeString = "";
    if (days > 0) timeString += `${days}일 `;
    if (hours > 0 || days > 0) timeString += `${hours}시간 `;
    if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}분 `;
    timeString += `${remainingSeconds}초`;

    return `남은 시간: ${timeString.trim()}`;
  };

  return (
    <div className="bh-container">
      {" "}
      {/* 컨테이너 이름 변경 */}
      <div className="bh-page-title">
        {" "}
        {/* 페이지 제목 */}
        <h2>나의 구매 및 입찰 내역</h2>
      </div>
      {/* 입찰 목록과 낙찰 목록을 담는 컨테이너 추가 */}
      <div className="bh-trade-lists-wrapper">
        {" "}
        {/* 클래스 이름 변경 */}
        {/* 현재 입찰 중인 목록 */}
        <div className="bh-list-section bh-current-bids-section">
          {" "}
          {/* 섹션 분리 */}
          <h3>현재 입찰 중인 경매</h3>
          <div className="bh-list">
            {" "}
            {/* 목록 컨테이너 재사용 */}
            {currentBids.length > 0 ? (
              currentBids.map((item) => (
                // 각 항목 클릭 시 작품 상세로 이동
                <div
                  key={item.tradeId}
                  className="bh-item data"
                  onClick={() => handleArtworkClick(item.postId)}
                  style={{ cursor: "pointer" }}
                >
                  {/* TODO: 이미지 표시 */}
                  <div className="bh-item-thumbnail">
                    {item.postImage ? (
                      <img
                        src={`http://localhost:8080${item.postImage}`}
                        alt={item.postTitle || "Artwork"}
                      />
                    ) : (
                      <div className="bh-no-image-placeholder-small">🖼️</div>
                    )}
                  </div>
                  <div className="bh-item-details">
                    {" "}
                    {/* 상세 정보 */}
                    <div className="bh-item-title">
                      {item.postTitle || "제목 없음"}
                    </div>
                    <div className="bh-item-price">
                      현재가:{" "}
                      {item.highestBid != null
                        ? item.highestBid.toLocaleString()
                        : "가격 정보 없음"}
                      원
                    </div>
                    {/* TODO: 남은 시간 표시 로직 추가 */}
                    <div className="bh-item-time">
                      {getRemainingTime(item.lastBidTime)}
                    </div>
                  </div>
                  <div className="bh-item-status">입찰 중</div>{" "}
                  {/* 상태 표시 */}
                </div>
              ))
            ) : (
              <div className="bh-no-bids">현재 입찰 중인 경매가 없습니다.</div>
            )}
          </div>
        </div>
        {/* 낙찰받은 목록 */}
        <div className="bh-list-section bh-won-trades-section">
          {" "}
          {/* 섹션 분리 */}
          <h3>낙찰된 경매</h3>
          <div className="bh-list">
            {" "}
            {/* 목록 컨테이너 재사용 */}
            {wonTrades.length > 0 ? (
              wonTrades.map((item) => (
                // 각 항목 클릭 시 작품 상세로 이동
                <div
                  key={item.tradeId}
                  className="bh-item data won"
                  onClick={() => handleArtworkClick(item.postId)}
                  style={{ cursor: "pointer" }}
                >
                  {/* TODO: 이미지 표시 */}
                  <div className="bh-item-thumbnail">
                    {item.postImage ? (
                      <img
                        src={`http://localhost:8080${item.postImage}`}
                        alt={item.postTitle || "Artwork"}
                      />
                    ) : (
                      <div className="bh-no-image-placeholder-small">🖼️</div>
                    )}
                  </div>
                  <div className="bh-item-details">
                    {" "}
                    {/* 상세 정보 */}
                    <div className="bh-item-title">
                      {item.postTitle || "제목 없음"}
                    </div>
                    <div className="bh-item-price">
                      낙찰가:{" "}
                      {item.highestBid != null
                        ? item.highestBid.toLocaleString()
                        : "가격 정보 없음"}
                      원
                    </div>
                    <div className="bh-item-time">
                      낙찰 시간:{" "}
                      {item.lastBidTime
                        ? new Date(item.lastBidTime).toLocaleString()
                        : "시간 정보 없음"}
                    </div>
                  </div>
                  <div className="bh-item-status-container">
                    <div className="bh-item-status won">낙찰</div>
                    <button
                      className="bh-download-button"
                      onClick={(e) => handleDownloadOriginal(e, item)}
                      title="원본 이미지 다운로드"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bh-no-bids">낙찰된 경매가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
      <div className="bh-history-footer">
        {" "}
        {/* 푸터 */}
        <button onClick={handleGoBack} className="bh-back-button">
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default BidHistory;
