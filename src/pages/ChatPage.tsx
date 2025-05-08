import React, { useState } from "react";
import "../styles/ChatPage.css";

const ChatPage: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false);

  const handleInquiryClick = () => {
    setIsChatActive(true);
  };

  const handleExitClick = () => {
    setIsChatActive(false);
  };

  return (
    <div className="chat-page">
      {/* 왼쪽 패널 */}
      <div className="left-panel">
        {/* 구매 확인 메시지 박스 - 채팅 활성화 시에만 표시 */}
        {isChatActive && (
          <div className="purchase-confirm-box above-buttons">
            <p>
              판매자에게 거래 요청하시겠습니까?
              <br />
              거절을 방지하려면 확인해주세요.
            </p>
            <div className="footer-buttons">
              <button className="safe-btn">안전 거래</button>
              <button className="exit-btn" onClick={handleExitClick}>
                취소
              </button>
            </div>
          </div>
        )}

        {/* 하단 고정 문의/구매 버튼 - 항상 표시 */}
        <div className="purchase-buttons">
          <button onClick={handleInquiryClick}>문의</button>
          <button>구매</button>
        </div>
      </div>

      {/* 가운데 패널 - 채팅 목록 */}
      <div className="center-panel">
        {isChatActive && (
          <>
            <ul className="chat-list">
              {[
                "Sintae",
                "예지사랑",
                "podutron",
                "bans3985",
                "naroriri",
                "6677Anam",
                "Minsohee_0933",
                "lee_sg",
              ].map((user, idx) => (
                <li key={idx} className={user === "lee_sg" ? "active" : ""}>
                  <img src="/profile-placeholder.jpg" alt="profile" />
                  <div className="chat-info">
                    <strong>{user}</strong>
                    <p>구매 확실하면 안전거래 이용해주세요</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="chat-menu">
              <button>채팅하기</button>
              <button>프로필보기</button>
            </div>
          </>
        )}
      </div>

      {/* 오른쪽 패널 - 채팅창 */}
      <div className="right-panel">
        {isChatActive && (
          <>
            <div className="chat-header">
              <img src="/cat-profile.jpg" alt="XOXO" />
              <span>XOXO</span>
            </div>

            <div className="chat-body">
              <div className="message blue">
                구매 확실하면 안전거래 이용해주세요
              </div>
              <img
                className="chat-image"
                src="/cat-art.jpg"
                alt="작품 이미지"
              />
              <div className="purchase-confirm">
                위의 그림을 구매하시겠습니까?
                <br />
                개인 거래로 인한 피해는 책임지지 않습니다.
                <br />
                사기거래에 주의해 안전결제를 권장합니다.
                <button className="payment-btn">결제창으로 이동</button>
              </div>
            </div>

            <div className="chat-footer">
              <input type="text" placeholder="메시지를 입력하세요..." />
              <button>...</button>
              <div className="footer-buttons">
                <button className="safe-btn">안전 거래</button>
                <button className="exit-btn" onClick={handleExitClick}>
                  나가기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
