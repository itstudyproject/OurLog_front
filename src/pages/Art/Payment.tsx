import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/ArtPayment.css";

interface Payment {
  artworkId: number;
  title: string;
  price: number;
  author: string;
  imageSrc: string;
}

const ArtPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentInfo, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("카카오페이");
  const [agreement, setAgreement] = useState<boolean>(false);
  
  useEffect(() => {
    // 실제 구현에서는 location.state에서 데이터를 받아올 수 있음
    // 여기서는 테스트용 더미 데이터 사용
    const dummyInfo: Payment = {
      artworkId: 1,
      title: "뚱글뚱글 파스타",
      price: 50000,
      author: "작가1",
      imageSrc: "/images/파스타.jpg"
    };
    
    setPayment(dummyInfo);
    setLoading(false);
  }, [location]);

  const handleGoBack = () => {
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
  
    // 결제 완료 후 입찰 목록 화면으로 이동
    navigate("/Art/bids");
  };
  
  if (loading || !paymentInfo) {
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
          <h3>상품 정보</h3>
          <div className="artwork-order-info">
            <div className="artwork-thumbnail">
              <img src={paymentInfo.imageSrc} alt={paymentInfo.title} />
            </div>
            <div className="artwork-details">
              <div className="artist-name">{paymentInfo.author}</div>
              <div className="artwork-title">{paymentInfo.title}</div>
            </div>
          </div>
          
          <h3 className="delivery-title">구매자 정보</h3>
          <div className="buyer-info">
            <p>* 구매자 정보는 가입 시 입력한 정보로 자동 입력됩니다.</p>
          </div>
        </div>
        
        <div className="payment-info-section">
          <h3>결제 금액</h3>
          <div className="price-detail">
            <div className="price-row">
              <span>상품금액</span>
              <span>{paymentInfo.price.toLocaleString()}원</span>
            </div>
            <div className="price-row">
              <span>신용카드</span>
              <span>{paymentInfo.price.toLocaleString()}원</span>
            </div>
            <div className="price-row">
              <span>계좌이체</span>
              <span>0원</span>
            </div>
          </div>
          
          <h3 className="policy-title">미술 작품 설명</h3>
          <div className="policy-detail">
            <p>※ 취소 및 환불 규정</p>
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