import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/BidHistory.css";
import { getAuthHeaders, hasToken } from "../../utils/auth"; // 인증 헤더 가져오기 함수 임포트
import { PostDTO } from "../../types/postTypes"; // PostDTO 임포트
import { PictureDTO } from "../../types/pictureTypes"; // PictureDTO 임포트
import { TradeDTO } from "../../types/tradeTypes"; // TradeDTO 임포트
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
  postTitle?: string; // 게시글 제목
  postImage?: string; // 게시글 대표 이미지 경로
  startBidTime?: string; // 경매 시작 시간
  sellerId?: number; // 판매자 ID
  buyerId?: number; // 구매자 ID (낙찰 또는 즉시구매된 경우)
  buyerNickname?: string; // 구매자 닉네임 (낙찰 또는 즉시구매된 경우)
}

// userId prop을 받도록 수정
const BidHistory: React.FC<{ userId: number }> = ({ userId }) => {
  const navigate = useNavigate();
  // tradeId 대신 사용자 ID가 필요
  // const { tradeId } = useParams<{ tradeId?: string }>(); // tradeId useParams 제거
  const [currentBids, setCurrentBids] = useState<PurchaseOrBidEntry[]>([]);
  // ✅ wonTrades 대신 completedTrades로 변경하여 낙찰/즉시구매 모두 포함
  const [completedTrades, setCompletedTrades] = useState<PurchaseOrBidEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date()); // LocalDateTime 대신 Date 객체 사용
  // const [artTitle, setArtTitle] = useState<string>(''); // 게시글 제목은 목록별로 달라짐
  // const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null); // 단일 거래 정보 제거

  useEffect(() => {
    fetchUserTrades();
    // 의존성 배열을 빈 배열[]로 변경하여 마운트 시 1회 실행 보장
  }, [userId]); // userId를 의존성 배열에 추가하여 prop 변경 시 재실행

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

   // ✅ 낙찰/즉시구매 항목에서 '결제하기' 버튼 클릭 시 호출될 함수
  // Payment 페이지로 이동하며 해당 거래 정보(tradeDTO 포함된 postData)를 넘겨줍니다.
  const handlePaymentClick = (e: React.MouseEvent, item: PurchaseOrBidEntry) => {
     e.stopPropagation(); // 부모 요소(카드)로의 클릭 이벤트 전파 방지
     console.log("Attempting to navigate to payment with item:", item);

     // ✅ 필요한 PostDTO 구조를 재구성하여 Payment 페이지로 전달
     // PurchaseOrBidEntry 구조를 사용하여 PostDTO 형태로 Payment에 전달하기 위해 필요한 정보를 포함하는 객체 생성
     // 특히 tradeDTO 필드를 PurchaseOrBidEntry 정보로 채워야 합니다.
      const postDataForPayment: PostDTO = {
          postId: item.postId,
          // ✅ PostDTO 필수 속성 추가 (PurchaseOrBidEntry 정보 및 기본값 활용)
          userId: item.sellerId || 0, // 판매자 ID를 userId로 사용 (원 게시글 작성자)
          title: item.postTitle || "제목 없음",
          content: "", // 마이페이지 목록에서는 설명을 가져오지 않으므로 빈 값
          nickname: item.buyerNickname || item.bidderNickname || "알 수 없는 작가", // 작가 닉네임은 거래 정보에서 가져옴
          fileName: item.postImage || "", // 이미지 파일명을 postImage로 사용
          boardNo: 5, // 아트 게시판
          views: 0, // 정보 없음, 기본값 0
          tag: "", // 정보 없음, 기본값 빈 문자열
          thumbnailImagePath: item.postImage || null, // postImage를 썸네일 경로로 사용
          resizedImagePath: item.postImage || undefined, // postImage를 리사이즈 경로로 사용
          originImagePath: item.postImage ? [item.postImage] as string[] : [] as string[], // postImage를 원본 경로 목록으로 사용
          followers: 0, // 정보 없음, 기본값 0
          downloads: 0, // 정보 없음, 기본값 0
          favoriteCnt: 0, // 정보 없음, 기본값 0
           // ✅ tradeDTO 필드에 거래 정보 포함
           // TradeDTO 인터페이스에 맞게 객체 구조 수정
          tradeDTO: {
             tradeId: item.tradeId,
             postId: item.postId,
             sellerId: item.sellerId || 0, // 정보 없으면 0
             bidderId: item.bidderId || item.buyerId || null, // 입찰자 또는 구매자 ID
             bidderNickname: item.bidderNickname || item.buyerNickname || null, // 입찰자 또는 구매자 닉네임
             startPrice: item.startPrice || 0, // 정보 없으면 0
             highestBid: item.highestBid || item.nowBuy || null, // 최고 입찰가 또는 구매가
             bidAmount: null, // 정보 없음
             nowBuy: item.nowBuy || 0, // 정보 없으면 0
             tradeStatus: item.tradeStatus, // 거래 상태
             startBidTime: null, // 정보 없음
             lastBidTime: item.lastBidTime || null, // 마지막 입찰 시간 또는 종료 시간
          } as TradeDTO,
          // ✅ pictureDTOList 객체 구조를 PictureDTO 인터페이스에 맞게 수정
          pictureDTOList: item.postImage ? [{
              picId: 0, // 정보 없음, 기본값 0
              uuid: item.postImage, // postImage를 uuid로 사용
              picName: item.postTitle || "image", // 게시글 제목 또는 기본값으로 파일명 사용
              path: item.postImage, // postImage를 path로 사용
              picDescribe: null, // 정보 없음
              downloads: 0, // 정보 없음, 기본값 0
              tag: null, // 정보 없음
              originImagePath: item.postImage || null, // postImage를 원본 경로로 사용
              thumbnailImagePath: item.postImage || null, // postImage를 썸네일 경로로 사용
              resizedImagePath: item.postImage || null, // postImage를 리사이즈 경로로 사용
              ownerId: item.sellerId, // 판매자 ID를 ownerId로 사용
              postId: item.postId, // 게시글 ID 사용
          } as PictureDTO] : [], // pictureDTOList는 배열
           profileImage: null, // 정보 없음, 기본값 null
          replyCnt: 0, // 정보 없음, 기본값 0
          regDate: null, // 정보 없음, 기본값 null
          modDate: null, // 정보 없음, 기본값 null
      };

     if (item.tradeId) {
        // Payment 페이지로 이동 시 state에 postData 객체를 담아 전달
        navigate(`/Art/payment`, { state: { post: postDataForPayment } });
     } else {
         alert("결제 정보를 찾을 수 없습니다. 거래 ID가 누락되었습니다.");
     }
  };


  const fetchUserTrades = async () => {
    setLoading(true);

    // 사용자 로그인 상태 확인 및 userId 가져오기
    // userId는 props로 받으므로 여기서 다시 localStorage에서 가져올 필요 없음
    const currentUserId = userId;

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

      // 구매/입찰 목록을 가져오는 API 엔드포인트 수정
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
        setCompletedTrades([]); // 실패 시 completedTrades도 초기화
        return;
      }

      const data = await response.json();
      console.log("API response data:", data);

      if (
        data.currentBids &&
        Array.isArray(data.currentBids) &&
        data.wonTrades && // API 응답에 wonTrades가 있다고 가정
        Array.isArray(data.wonTrades)
      ) {
        // 현재 입찰 중인 목록 필터링
        const currentBidsList = data.currentBids.filter((item: PurchaseOrBidEntry) =>
          item.tradeStatus === false && item.bidderId === currentUserId && item.sellerId !== currentUserId
        );

        // ✅ 완료된 목록 (낙찰 또는 즉시구매) 필터링 조건 수정
        // API 응답에서 wonTrades는 거래가 완료된 (tradeStatus === true) 구매/입찰 내역이라고 가정
        // 여기서도 판매자가 아닌 구매자/입찰자 관점에서 필터링
        console.log("Before filtering completedTrades (from wonTrades):", data.wonTrades);
        const completedTradesList = data.wonTrades.filter((item: PurchaseOrBidEntry) => {
          console.log("Checking completed trade item:", {
            tradeId: item.tradeId,
            tradeStatus: item.tradeStatus,
            buyerId: item.buyerId,
            currentUserId: currentUserId,
            sellerId: item.sellerId,
             bidderId: item.bidderId // bidderId도 확인
          });

          // 완료된 거래는 다음 조건을 만족해야 함:
          // 1. 거래가 완료된 상태 (API 응답의 wonTrades는 이미 true일 가능성 높음)
          // 2. 현재 사용자가 판매자가 아님
          // 3. 현재 사용자가 구매자이거나 최고 입찰자 (즉시구매 또는 낙찰)
          return (
            item.tradeStatus === true && // 거래 완료 상태
            item.sellerId !== currentUserId && // 판매자가 아님
            (item.buyerId === currentUserId || item.bidderId === currentUserId) // 구매자 또는 최고 입찰자
          );
        });
        console.log("After filtering completedTrades:", completedTradesList);


        setCurrentBids(currentBidsList);
        // ✅ 낙찰/즉시구매 목록을 completedTrades 상태에 저장
        setCompletedTrades(completedTradesList);
        console.log("State updated - currentBids:", currentBidsList);
        console.log("State updated - completedTrades:", completedTradesList); // 상태 로깅 업데이트
      } else {
        console.error("Unexpected API response structure:", data);
        alert("구매 및 입찰 목록 데이터 형식이 올바르지 않습니다.");
        setCurrentBids([]);
        setCompletedTrades([]); // 잘못된 구조인 경우 초기화
      }
    } catch (error) {
      console.error("구매/입찰 목록을 불러오는 중 오류가 발생했습니다:", error);
      alert("구매 및 입찰 목록을 불러오는 중 오류가 발생했습니다.");
      setCurrentBids([]);
      setCompletedTrades([]); // 오류 발생 시 초기화
    } finally {
      console.log("fetchUserTrades finished. Setting loading to false.");
      setLoading(false);
    }
  };

  // ✅ 원본 이미지 다운로드 함수 (completedTrades 항목용)
  // BidHistory에서는 낙찰된 항목(즉시구매 포함)에만 다운로드 버튼이 있으므로 여기에 정의
  const handleDownloadOriginal = (e: React.MouseEvent, item: PurchaseOrBidEntry) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    if (!item.postImage) {
      alert("다운로드할 이미지가 없습니다.");
      return;
    }

    // postImage 경로가 이미 /ourlog/picture/display/ 를 포함하고 있는지 확인
    // BidHistory에서 사용될 때는 item.postImage가 이미 전체 경로(`/ourlog/picture/display/...`) 형태일 가능성 높음
     const imageUrl = item.postImage.startsWith('/ourlog')
        ? `http://localhost:8080${item.postImage}`
        : `http://localhost:8080/ourlog/picture/display/${item.postImage}`; // 포함하지 않으면 base url 추가 (안전 장치)


    const link = document.createElement('a');
    link.href = imageUrl;
    // 파일 이름에 상태(낙찰/구매완료) 정보 추가
    const statusText = (item.nowBuy !== null && item.highestBid === item.nowBuy) ? 'purchase' : 'auction_won';
    link.setAttribute('download', `${item.postTitle || item.postId}_${statusText}_original.jpg`);
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
  // ✅ currentBids와 completedTrades 모두 없을 때
  if (currentBids.length === 0 && completedTrades.length === 0) {
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
                  {/* 썸네일 이미지 */}
                  <div className="bh-item-thumbnail">
                    {item.postImage ? (
                       // ✅ 이미지 URL 생성 로직 수정
                       <img
                         src={item.postImage.startsWith('/ourlog') ? `http://localhost:8080${item.postImage}` : `http://localhost:8080/ourlog/picture/display/${item.postImage}`}
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
                    {/* 남은 시간 표시 */}
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
        {/* ✅ 낙찰/즉시구매 완료 목록 */}
        <div className="bh-list-section bh-completed-trades-section">
          {" "}
          {/* ✅ 완료된 거래 내역 제목 수정 */}
          <h3>완료된 거래 내역</h3>
          <div className="bh-list">
            {" "}
            {/* 목록 컨테이너 재사용 */}
            {completedTrades.length > 0 ? (
              completedTrades.map((item) => {
                // ✅ 즉시 구매인지 입찰 낙찰인지 구분
                const isInstantPurchase = item.nowBuy !== null && item.highestBid === item.nowBuy;
                const statusText = isInstantPurchase ? "구매 완료" : "낙찰";
                const priceLabel = isInstantPurchase ? "구매가" : "낙찰가";

                return (
                // 각 항목 클릭 시 작품 상세로 이동
                <div
                  key={item.tradeId}
                  className={`bh-item data ${isInstantPurchase ? 'purchased' : 'won'}`} // 상태별 클래스 추가
                  onClick={() => handleArtworkClick(item.postId)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="bh-item-thumbnail-wrapper"> {/* ✅ 썸네일과 다운로드 버튼을 감싸는 div 추가 */}
                      {/* 썸네일 이미지 */}
                      <div className="bh-item-thumbnail">
                          {item.postImage ? (
                             // ✅ 이미지 URL 생성 로직 수정
                             <img
                               src={item.postImage.startsWith('/ourlog') ? `http://localhost:8080${item.postImage}` : `http://localhost:8080/ourlog/picture/display/${item.postImage}`}
                               alt={item.postTitle || "Artwork"}
                             />
                           ) : (
                            <div className="bh-no-image-placeholder-small">🖼️</div>
                          )}
                      </div>
                       {/* ✅ 즉시 구매인 경우 썸네일 바로 아래 다운로드 버튼 */}
                       {isInstantPurchase && (
                          <button
                            className="bh-download-button-under-thumbnail" // ✅ 새로운 클래스 적용
                            onClick={(e) => handleDownloadOriginal(e, item)}
                            title="원본 이미지 다운로드"
                          >
                            ⬇️ 다운로드
                          </button>
                        )}
                  </div> {/* ✅ 썸네일 Wrapper 끝 */}

                  <div className="bh-item-details">
                    {" "}
                    {/* 상세 정보 */}
                    <div className="bh-item-title">
                      {item.postTitle || "제목 없음"}
                    </div>
                    <div className="bh-item-price">
                       {/* 가격 정보 표시 */}
                      {priceLabel}:{" "}
                      {item.highestBid != null
                        ? item.highestBid.toLocaleString()
                        : "가격 정보 없음"}
                      원
                    </div>
                    <div className="bh-item-time">
                       {/* 완료 시간 또는 구매자 닉네임 표시 (✅ 구매자 닉네임 표시 제거) */}
                       {/* isInstantPurchase ? (
                         item.buyerNickname ? `구매자: ${item.buyerNickname}` : '구매자 정보 없음'
                       ) : ( // 낙찰인 경우
                         item.buyerNickname ? `낙찰자: ${item.buyerNickname}` : '낙찰자 정보 없음'
                       )*/}
                        {/* 남은 시간 또는 종료 시간 정보 필요시 여기에 추가 */}
                        {item.lastBidTime ? `종료 시간: ${new Date(item.lastBidTime).toLocaleString()}` : '시간 정보 없음'}
                    </div>
                  </div>
                  <div className="bh-item-status-container">
                    {/* 상태 표시 */}
                    <div className={`bh-item-status ${isInstantPurchase ? 'purchased' : 'won'}`}>
                       {statusText}
                    </div>
                    {/* ✅ 낙찰인 경우 상태 바로 아래 결제하기 버튼 */}
                    {!isInstantPurchase && (
                        <button
                           className="bh-payment-button" // ✅ 새로운 클래스 적용
                           onClick={(e) => handlePaymentClick(e, item)} // ✅ 결제하기 버튼 클릭 핸들러
                        >
                           결제하기
                        </button>
                    )}
                  </div>
                </div>
                ); // end return
              }) // end map
            ) : (
              <div className="bh-no-bids">완료된 거래 내역이 없습니다.</div>
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
