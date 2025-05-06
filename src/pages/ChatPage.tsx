import React from 'react';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  return (
    <div className="chat-page">
      {/* 왼쪽 패널 */}
      <div className="left-panel">
        <div className="back-title">← 구매</div> {/* NEW */}
        <div className="purchase-buttons"> {/* NEW */}
          <button>문의</button>
          <button>구매</button>
        </div>

        {/* 구매 확인 메시지 (팝업 느낌) - NEW */}
        <div className="purchase-confirm-box">
          <p>
            판매자에게 거래 요청하시겠습니까?<br />
            거절을 방지하려면 확인해주세요.
          </p>
          <div className="footer-buttons">
            <button className="safe-btn">완전 거래</button>
            <button className="exit-btn">취소</button>
          </div>
        </div>
      </div>

      {/* 가운데 패널 */}
      <div className="center-panel">
        <ul className="chat-list">
          {['Sintae', '예지사랑', 'podutron', 'bans3985', 'naroriri', '6677Anam', 'Minsohee_0933', 'lee_sg'].map((user, idx) => (
            <li key={idx} className={user === 'lee_sg' ? 'active' : ''}>
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
      </div>

      {/* 오른쪽 패널 */}
      <div className="right-panel">
        <div className="chat-header">
          <img src="/cat-profile.jpg" alt="XOXO" />
          <span>XOXO</span>
        </div>

        <div className="chat-body">
          <div className="message blue">구매 확실하면 안전거래 이용해주세요</div>
          <img className="chat-image" src="/cat-art.jpg" alt="작품 이미지" />
          <div className="purchase-confirm">
            위의 그림을 구매 하시겠습니까?<br />
            개인 거래로 인한 피해는 책임지지 않습니다.<br />
            사기거래에 주의해 안전결제를 권장합니다.
            <button className="payment-btn">결제창으로 이동</button>
          </div>
        </div>

        <div className="chat-footer">
          <input type="text" placeholder="메시지를 입력하세요..." />
          <button>...</button> {/* NEW - 가운데 버튼 */}
          <div className="footer-buttons">
            <button className="safe-btn">안전 거래</button>
            <button className="exit-btn">나가기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
