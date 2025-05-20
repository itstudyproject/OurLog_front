import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/ArtPayment.css";

// src/types에서 필요한 인터페이스를 임포트합니다.
import { PostDTO } from "../../types/postTypes";

// Payment 페이지에서 사용할 정보 인터페이스
// ArtDetail에서 전달받는 PostDTO 구조에 맞춰 조정합니다.
interface PaymentInfo {
  artworkId?: number; // postId 사용
  title: string; // 게시글 제목
  price: number; // 즉시 구매가 (nowBuy)
  author: string; // 작가 닉네임 (nickname)
  imageSrc?: string; // 게시글 대표 이미지 (fileName)
}

const ArtPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // state에서 전달받은 post 객체를 저장할 상태
  const [postData, setPostData] = useState<PostDTO | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("카카오페이");
  const [agreement, setAgreement] = useState<boolean>(false);

  useEffect(() => {
    // location.state에서 post 객체를 가져옵니다.
    if (location.state && (location.state as any).post) {
      const receivedPost: PostDTO = (location.state as any).post;
      setPostData(receivedPost);

      // 전달받은 post 객체로부터 PaymentInfo를 구성합니다.
      if (receivedPost.tradeDTO) {
          setPaymentInfo({
              artworkId: receivedPost.postId, // postId 사용
              title: receivedPost.title || '제목 없음',
              price: receivedPost.tradeDTO.nowBuy ?? 0, // 즉시 구매가 사용
              author: receivedPost.nickname || '알 수 없는 작가',
              imageSrc: receivedPost.fileName // 대표 이미지 사용
          });
          setLoading(false);
      } else {
          console.error("TradeDTO is missing in the received post data.");
          alert("결제 정보를 불러오는데 실패했습니다. 경매 정보가 없습니다.");
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

  const handlePaymentSubmit = () => {
    if (!agreement) {
      alert("구매 조건 및 결제진행에 동의해주세요.");
      return;
    }

    // TODO: 실제 결제 처리 로직 구현 (API 호출 등)
    console.log("결제 진행:", paymentInfo, "선택된 방법:", selectedMethod);

    // 결제 완료 후 리다이렉션 (예: 주문 완료 페이지 또는 마이페이지 구매 내역)
    // 현재는 더미 경로로 이동합니다.
    alert("결제가 완료되었습니다! (더미)"); // 실제 결제 후 성공/실패 처리 필요
    navigate("/Art"); // 예시: 아트 목록 페이지로 이동
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
              {/* paymentInfo.imageSrc가 있을 때만 이미지 표시 */}
              {paymentInfo.imageSrc ? (
                <img src={paymentInfo.imageSrc} alt={paymentInfo.title} />
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
             <p>{postData?.content || '작품 설명 없음'}</p>
          </div>

        </div>

        <div className="payment-info-section">
          <h3>결제 금액</h3>
          <div className="price-detail">
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
              <li>통관 운송료/보험료는 기기마다 다른 차액 책정은 회원/작가의 사정 하에 가격 차이로 책정되며, 작품 충 고러가 기타로 책정 되었을 나사에만 추적이어니다.</li>
              <li>작품 제작기간이 소요되는 작품은 결제 시점 입금이 자동 연장처리 되지 않아니다.</li>
              <li>작품 정보 참여 숙도에서 가각 책정과 지난 작품 포토컴을 작업히 경우에 대해 회안리하니오니 광매리자 리객 어깨 채번을 그재 대어성 리을 초후를 확인하 뷀바바니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="payment-method-section">
        <h3>결제 방법</h3>
        <div className="payment-methods">
          {/* TODO: 실제 사용 가능한 결제 수단 목록 동적으로 생성 */}
          <div
            className={`payment-method ${selectedMethod === "카카오페이" ? "selected" : ""}`}
            onClick={() => handlePaymentMethodSelect("카카오페이")}
          >
            <img src="/images/kakaopay.png" alt="카카오페이" />
          </div>
          <div
            className={`payment-method ${selectedMethod === "네이버페이" ? "selected" : ""}`}
            onClick={() => handlePaymentMethodSelect("네이버페이")}
          >
            <img src="/images/naverpay.png" alt="네이버페이" />
          </div>
          <div
            className={`payment-method ${selectedMethod === "토스페이" ? "selected" : ""}`}
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
        <button className="cancel-button" onClick={handleGoBack}>취소</button>
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