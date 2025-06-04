import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/ArtPayment.css";
import { getAuthHeaders } from "../../utils/auth";

// src/types에서 필요한 인터페이스를 임포트합니다.
import { PostDTO } from "../../types/postTypes";
import { PictureDTO } from "../../types/pictureTypes";
import { TradeDTO } from "../../types/tradeTypes";

// Payment 페이지에서 사용할 정보 인터페이스
// ArtDetail 또는 MyPage에서 전달받는 PostDTO 구조에 맞춰 조정합니다.
interface PaymentInfo {
  artworkId?: number; // postId 사용
  title: string; // 게시글 제목
  price: number; // 결제할 최종 가격 (즉시 구매가 또는 낙찰가)
  author: string; // 작가 닉네임 (nickname)
  // imageSrc는 resizedImagePath, thumbnailImagePath, fileName 등을 사용할 수 있습니다.
  // imageSrc?: string; // 이제 pictureDTOList를 사용할 것이므로 필요 없음
}

const ArtPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // state에서 전달받은 post 객체를 저장할 상태 (PostDTO 구조 예상)
  const [postData, setPostData] = useState<PostDTO | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("카카오페이");
  const [agreement, setAgreement] = useState<boolean>(false);
  // ArtDetail처럼 메인 이미지 상태 추가
  const [mainImagePicture, setMainImagePicture] = useState<PictureDTO | null>(
    null
  );

  useEffect(() => {
    // location.state에서 post 객체를 가져옵니다.
    if (location.state && (location.state as any).post) {
      const receivedPost: PostDTO = (location.state as any).post;
      // 받은 post 데이터 콘솔 출력
      console.log("Received post data in Payment page:", receivedPost);
      setPostData(receivedPost);

      // 전달받은 post 객체로부터 PaymentInfo를 구성합니다.
      if (receivedPost.tradeDTO) {
        // ✅ 결제할 가격은 tradeDTO의 highestBid 또는 nowBuy 중 적절한 것을 사용
        // MyPage의 낙찰/구매 완료 목록에서 넘어올 때는 highestBid가 최종 가격임
        // ArtDetail의 즉시구매에서 넘어올 때는 nowBuy가 최종 가격임
        // 여기서는 tradeDTO.highestBid를 우선 사용하고, 없으면 nowBuy를 사용하도록 로직 변경
        const finalPrice =
          receivedPost.tradeDTO.highestBid ?? receivedPost.tradeDTO.nowBuy ?? 0;
        console.log("finalPrice", finalPrice);

        setPaymentInfo({
          artworkId: receivedPost.postId, // postId 사용
          title: receivedPost.title || "제목 없음",
          price: finalPrice, // ✅ 최종 가격으로 설정
          author: receivedPost.nickname || "알 수 없는 작가",
          // imageSrc는 pictureDTOList에서 가져올 것
        });

        // ✅ ArtDetail처럼 pictureDTOList에서 메인 이미지 설정
        if (
          receivedPost.pictureDTOList &&
          receivedPost.pictureDTOList.length > 0
        ) {
          // post.fileName (대표 이미지 UUID)와 pictureDTOList의 uuid를 비교하여 메인 이미지 찾기
          const mainPic = receivedPost.pictureDTOList.find(
            (pic: PictureDTO) => pic.uuid === receivedPost.fileName
          );
          if (mainPic) {
            setMainImagePicture(mainPic);
          } else {
            // 대표 이미지를 찾지 못하면 첫 번째 이미지를 메인 이미지로 사용
            setMainImagePicture(receivedPost.pictureDTOList[0]);
          }
        } else {
          setMainImagePicture(null); // 이미지 목록이 없으면 메인 이미지 없음
        }

        setLoading(false);
      } else {
        console.error("TradeDTO is missing in the received post data.");
        alert("결제 정보를 불러오는데 실패했습니다. 거래 정보가 없습니다.");
        setLoading(false);
        setPaymentInfo(null); // Trade 정보가 없으면 결제 정보도 없음
      }
    } else {
      console.warn("No post data received in location state.");
      alert("잘못된 접근입니다. 작품 정보를 불러올 수 없습니다.");
      setLoading(false);
      setPostData(null);
      setPaymentInfo(null);
    }
  }, [location.state]); // location.state가 변경될 때마다 실행

  const handleGoBack = () => {
    // 이전 페이지로 돌아가거나, 작품 상세 페이지로 돌아갈 수 있습니다.
    // 여기서는 간단히 이전 페이지로 돌아갑니다.
    navigate(-1);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  // ✅ ArtDetail처럼 썸네일 클릭 핸들러 추가
  const handleImageClick = (picture: PictureDTO) => {
    // 클릭된 썸네일의 originImagePath를 사용하여 전체 URL 구성
    const fullImageUrl = picture.originImagePath
      ? `http://localhost:8080/ourlog/picture/display/${picture.originImagePath}`
      : null;

    // 메인 이미지 상태 업데이트 시에는 PostDTO의 pictureDTOList에 있는 해당 picture 객체를 그대로 사용
    // 이렇게 해야 mainImagePicture 상태에 originImagePath, uuid 등의 정보가 모두 담깁니다.
    setMainImagePicture(picture);
  };

  // 실제 결제 처리 및 API 호출 함수
  const processPayment = async () => {
    if (!postData?.tradeDTO?.tradeId) {
      alert("결제 정보를 찾을 수 없습니다. 거래 ID가 누락되었습니다.");
      setLoading(false);
      return;
    }

    setLoading(true); // 로딩 상태 활성화

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        setLoading(false);
        return;
      }

      console.log("결제 요청 헤더:", headers); // 헤더 로깅 추가

      const tradeId = postData.tradeDTO.tradeId;

      // ✅ 즉시 구매 또는 낙찰 결제 API 호출
      // MyPage의 낙찰 목록에서 올 경우, 이는 이미 낙찰된 거래에 대한 결제입니다.
      // 이 경우 백엔드에서는 해당 거래 ID에 대해 최종 낙찰가로 거래 완료 처리를 진행할 것입니다.
      // ArtDetail에서 즉시 구매 버튼을 눌렀을 경우도 동일하게 즉시 구매 처리가 진행될 것입니다.
      // 백엔드 API 엔드포인트가 즉시구매와 낙찰 결제를 동일한 엔드포인트로 처리한다고 가정합니다.
      // 엔드포인트: POST /ourlog/trades/{tradeId}/complete (가정)
      // 이전의 nowBuy 엔드포인트는 즉시구매 "요청"이었고, 여기서는 "완료" 또는 최종 결제 처리가 필요
      // 백엔드 명세에 따라 엔드포인트를 확인하고 수정해야 합니다.
      // 일단 `POST /ourlog/trades/${tradeId}/complete` 와 같이 결제를 완료하는 엔드포인트가 있다고 가정합니다.
      // 만약 백엔드에 별도의 "낙찰 후 결제" 엔드포인트가 없다면, 즉시구매 엔드포인트를 재활용할 수도 있지만 의미상 부적절할 수 있습니다.
      // 백엔드와 협의하여 정확한 결제 완료 API 엔드포인트를 사용해야 합니다.

      // TODO: 백엔드 결제 완료 API 엔드포인트 및 요청 방식 확인 필요
      // 임시로 기존 즉시구매 API를 사용하여 테스트하거나, 백엔드에 문의하여 정확한 API 사용
      // 현재 BidHistory에서 nowBuy API 호출 시 문자열을 반환하는 것으로 보아,
      // 즉시 구매는 해당 API로 완료되고, 낙찰은 다른 API 또는 수동 처리가 필요할 수 있습니다.
      // 사용자 요청사항은 "payment로 이동해서 결제가 되는 방식은 낙찰금액이어야 해" 입니다.
      // 이는 MyPage -> Payment 경로로 올 때 해당되며, ArtDetail -> Payment 경로는 즉시 구매입니다.
      // 두 경로를 분기하여 다른 API를 호출하거나, 동일 API가 내부적으로 분기하도록 설계해야 합니다.
      // 현재 Payment 컴포넌트는 postData.tradeDTO만 보고 결제 금액을 결정하므로,
      // API 호출 시에는 해당 거래 ID에 대한 결제 완료 요청만 보내면 됩니다.

      // 백엔드와의 연동이 필요합니다. 임시로 기존 즉시구매 API를 사용하되,
      // 실제 구현 시에는 낙찰 결제를 처리하는 백엔드 API를 사용해야 합니다.
      console.log(`Calling Payment Complete API for tradeId: ${tradeId}`);
      const response = await fetch(
        `http://localhost:8080/ourlog/trades/${tradeId}/nowBuy`,
        {
          // TODO: 백엔드 결제 완료 API로 변경 필요
          method: "POST", // 백엔드 컨트롤러 명세에 따라 POST 사용 (임시)
          headers: headers,
          // 낙찰 결제 API는 보통 요청 본문에 추가 정보가 필요 없습니다.
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`결제 실패 (${response.status}):`, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          alert(`결제 실패: ${errorJson.message || errorText || "서버 오류"}`);
        } catch (e) {
          alert(`결제 실패: ${errorText || "서버 오류"}`);
        }
        setLoading(false);
        return; // 실패 시 여기서 중단
      }

      // 결제 성공
      const successMessage = await response.text(); // 백엔드 API 응답 확인 필요
      console.log("결제 성공 응답:", successMessage);

      alert("결제가 완료되었습니다!");
      // 결제 완료 후 BidHistory 페이지로 이동
      // userId를 URL 파라미터로 전달
      const stored = localStorage.getItem("user");
      const userId = stored ? JSON.parse(stored).userId : null;
      if (userId) {
        navigate(`/Art/bidhistory/${userId}`);
      } else {
        alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        navigate("/login");
      }
    } catch (error) {
      console.error("결제 요청 중 오류 발생:", error);
      alert(
        `결제 처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  const handlePaymentSubmit = () => {
    if (!agreement) {
      alert("구매 조건 및 결제진행에 동의해주세요.");
      return;
    }

    // 최종 확인창 표시
    const isConfirmed = window.confirm("결제하시겠습니까?");

    if (isConfirmed) {
      // 확인 시 실제 결제 처리 함수 호출
      processPayment();
    } else {
      // 취소 시 아무것도 하지 않음
      console.log("결제 취소");
    }
  };

  if (loading || !postData || !paymentInfo) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* <div className="header">
        <h1 style={{ fontFamily: "'Kolker Brush', cursive" }}>OurLog</h1>
      </div> */}

      <div className="payment-title">
        <h2>주문 / 결제</h2>
      </div>

      <div className="payment-content">
        <div className="order-info-section">
          <h3>작품 정보</h3>
          <div className="artwork-order-info">
            <div className="artwork-thumbnail">
              {/* mainImagePicture의 originImagePath를 사용하여 이미지 표시 */}
              {mainImagePicture && mainImagePicture.originImagePath ? (
                <img
                  src={
                    mainImagePicture.originImagePath.startsWith("/ourlog")
                      ? `http://localhost:8080${mainImagePicture.originImagePath}`
                      : `http://localhost:8080/ourlog/picture/display/${mainImagePicture.originImagePath}`
                  }
                  alt={paymentInfo.title}
                />
              ) : (
                <div className="no-image-placeholder">이미지 없음</div>
              )}
            </div>
            <div className="artwork-details">
              <div className="artist-name">{paymentInfo.author}</div>
              <div className="artwork-title">{paymentInfo.title}</div>
            </div>
          </div>

          <h3 className="artwork-description-title">작품 설명</h3>
          <div className="artwork-description-content">
            <p>{postData?.content || "작품 설명 없음"}</p>
          </div>
        </div>

        <div className="payment-info-section">
          <h3>결제 금액</h3>
          <div className="price-detail">
            {/* ✅ 표시되는 가격은 paymentInfo.price 사용 (낙찰가 또는 즉시구매가) */}
            <div className="price-row">
              <span>상품금액</span>
              <span>{paymentInfo.price.toLocaleString()}원</span>
            </div>
            {/* TODO: 실제 결제 방식에 따른 금액 표시 */}
            <div className="price-row">
              <span>신용카드</span>
              <span>{paymentInfo.price.toLocaleString()}원</span>
            </div>
            <div className="price-row">
              <span>계좌이체</span>
              <span>0원</span> {/* 예시 */}
            </div>
          </div>

          <h3 className="policy-title">미술 작품 설명</h3>
          <div className="policy-detail">
            <p>※ 취소 및 환불 규정</p>
            {/* TODO: 실제 작품 설명 또는 약관 로드 */}
            <ul>
              <li>작품은 치밀한 품질/포장검수 과정을 거쳐 배송됩니다.</li>
              <li>작품의 하자 발생 시 교환 또는 환불이 가능합니다.</li>
              <li>작품의 훼손/변형/분실에 대한 책임은 매수인에게 있습니다.</li>
              <li>
                통관 운송료/보험료는 기기마다 다른 차액 책정은 회원/작가의 사정
                하에 가격 차이로 책정되며, 작품 충 고러가 기타로 책정 되었을
                나사에만 추적이어니 광매리자 리객 어깨 채번을 그재 대어성 리을
                초후를 확인하 뷀바바니다.
              </li>
              <li>
                작품 제작기간이 소요되는 작품은 결제 시점 입금이 자동 연장처리
                되지 않아니다.
              </li>
              <li>
                작품 정보 참여 숙도에서 가각 책정과 지난 작품 포토컴을 작업히
                경우에 대해 회안리하니오니 광매리자 리객 어깨 채번을 그재 대어성
                리을 초후를 확인하 뷀바바니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ ArtDetail처럼 이미지 표시 영역을 payment-content 밖으로 이동 */}
      <div className="payment-image-display-area">
        <div className="main-image-container">
          {mainImagePicture && mainImagePicture.originImagePath ? (
            <img
              // ✅ 이미지 URL 생성 로직 수정
              src={
                mainImagePicture.originImagePath.startsWith("/ourlog")
                  ? `http://localhost:8080${mainImagePicture.originImagePath}`
                  : `http://localhost:8080/ourlog/picture/display/${mainImagePicture.originImagePath}`
              }
              alt={paymentInfo.title}
              className="main-artwork-image"
            />
          ) : (
            <div className="no-image-placeholder main">이미지 없음</div>
          )}
        </div>

        {/* ✅ ArtDetail처럼 썸네일 목록 표시 */}
        {postData?.pictureDTOList && postData.pictureDTOList.length > 1 && (
          <div className="thumbnail-list-container">
            {postData.pictureDTOList
              // 현재 메인 이미지는 썸네일에서 제외 (uuid로 비교)
              .filter((pic) => pic.uuid !== mainImagePicture?.uuid)
              .map((picture, index) => {
                const imageUrl = picture.originImagePath
                  ? // ✅ 썸네일 이미지 URL 생성 로직 수정
                    picture.originImagePath.startsWith("/ourlog")
                    ? `http://localhost:8080${picture.originImagePath}`
                    : `http://localhost:8080/ourlog/picture/display/${picture.originImagePath}`
                  : null;

                if (!imageUrl) return null;

                return (
                  <div
                    key={picture.uuid || index} // uuid가 없으면 index 사용
                    className="thumbnail-item"
                    onClick={() => handleImageClick(picture)} // 클릭 시 메인 이미지 변경
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${paymentInfo.title || "Thumbnail image"} ${
                        index + 1
                      }`}
                      className="thumbnail-image"
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div className="payment-method-section">
        <h3>결제 방법</h3>
        <div className="payment-methods">
          {/* TODO: 실제 사용 가능한 결제 수단 목록 동적으로 생성 */}
          <div
            className={`payment-method ${
              selectedMethod === "카카오페이" ? "selected" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("카카오페이")}
          >
            <img src="/images/kakaopay.png" alt="카카오페이" />
          </div>
          <div
            className={`payment-method ${
              selectedMethod === "네이버페이" ? "selected" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("네이버페이")}
          >
            <img src="/images/naverpay.png" alt="네이버페이" />
          </div>
          <div
            className={`payment-method ${
              selectedMethod === "토스페이" ? "selected" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("토스페이")}
          >
            <img src="/images/tosspay.png" alt="토스페이" />
          </div>
        </div>
      </div>

      <div className="payment-agreement">
        <label className="agreement-label">
          <input
            type="checkbox"
            checked={agreement}
            onChange={() => setAgreement(!agreement)}
          />
          <span>구매 조건 및 결제진행에 동의합니다.</span>
        </label>
      </div>

      <div className="payment-actions">
        <button className="cancel-button" onClick={handleGoBack}>
          취소
        </button>
        <button
          className={`payment-button ${!agreement ? "disabled" : ""}`}
          onClick={handlePaymentSubmit}
          disabled={!agreement}
        >
          결제하기
        </button>
      </div>
    </div>
  );
};

export default ArtPayment;
