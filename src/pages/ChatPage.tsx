import React, { useState } from "react";
import "../styles/ChatPage.css";

// 사용자 프로필 이미지 정보
const userProfiles: { [key: string]: string } = {
  ann: "/images/ann_01.jpg",
  john: "/images/john_01.jpg",
  mary: "/images/mary_01.jpg",
  오달숙: "/images/오달숙_01.jpg",
  제임스: "/images/제임스_01.jpg",
};

// 메시지 타입 정의
interface ChatMessage {
  sender: string;
  message: string;
  paymentInfo?: {
    itemImage: string;
    itemName: string;
    price: number;
  };
}

const ChatPage: React.FC = () => {
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isPaymentRequestVisible, setIsPaymentRequestVisible] = useState(false);

  const handleOpenChatModal = (user: string) => {
    const confirmChat = window.confirm(`${user}님과 채팅을 시작하시겠습니까?`);
    if (!confirmChat) return;

    setCurrentUser(user);
    setIsListModalVisible(false);
    setIsChatModalVisible(true);
    setMessages([]);
  };

  const handleCloseListModal = () => setIsListModalVisible(false);

  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentUser(null);
    setIsListModalVisible(true);
    setIsPaymentRequestVisible(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message: ChatMessage = {
        sender: "Me",
        message: newMessage,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 토글되어 수락/거절 박스가 생겼다 사라졌다 합니다
  const handleSecurePaymentRequest = () => {
    setIsPaymentRequestVisible((prev) => !prev);
  };

  const handleAcceptPayment = () => {
    const message: ChatMessage = {
      sender: "Me",
      message: "안전결제를 수락하셨습니다.",
      paymentInfo: {
        itemImage: "/images/파스타.jpg",
        itemName: "디지털 아트워크",
        price: 50000,
      },
    };
    setMessages([...messages, message]);
    setIsPaymentRequestVisible(false);
  };

  const handleRejectPayment = () => {
    const message: ChatMessage = {
      sender: "Me",
      message: "안전결제를 거절하셨습니다.",
    };
    setMessages([...messages, message]);
    setIsPaymentRequestVisible(false);
  };

  return (
    <div className="chat-page">
      {isListModalVisible && (
        <div className="modal-overlay">
          <div className="chat-list-modal">
            <div className="chat-list-header">
              <h2>채팅 목록</h2>
              <button className="exit-btn" onClick={handleCloseListModal}>
                닫기
              </button>
            </div>
            <ul className="chat-list">
              {Object.keys(userProfiles).map((user, idx) => (
                <li key={idx} onClick={() => handleOpenChatModal(user)}>
                  <img src={userProfiles[user]} alt={user} />
                  <div className="chat-info">
                    <strong>{user}</strong>
                    <p>구매 확실하면 안전거래 이용해주세요</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isChatModalVisible && currentUser && (
        <div className="chat-modal">
          <div className="chat-header">
            <div className="chat-header-left">
              <img
                src={userProfiles[currentUser] || "/profile-placeholder.jpg"}
                alt={currentUser}
              />
              <span>{currentUser}</span>
            </div>
            <button className="exit-btn" onClick={handleExitClick}>
              나가기
            </button>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender === "Me" ? "me" : "you"}`}
            >
              {msg.sender !== "Me" && (
                <img
                  src={userProfiles[currentUser] || "/profile-placeholder.jpg"}
                  alt="상대방"
                  className="profile-icon"
                />
              )}
              <div
                className={`message ${
                  msg.sender === "Me" ? "me-message" : "you-message"
                }`}
              >
                {msg.message.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                {msg.paymentInfo && (
                  <div className="payment-card">
                    <img src={msg.paymentInfo.itemImage} alt="상품 이미지" />
                    <div className="item-details">
                      <strong>{msg.paymentInfo.itemName}</strong>
                      <p>{msg.paymentInfo.price.toLocaleString()}원</p>
                    </div>
                    <button className="go-to-payment">결제하기</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isPaymentRequestVisible && (
            <div className="payment-request-message">
              <p>안전결제를 하시겠습니까?</p>
              <div className="payment-buttons">
                <button onClick={handleAcceptPayment}>수락</button>
                <button onClick={handleRejectPayment}>거절</button>
              </div>
            </div>
          )}

          <div className="chat-footer">
            <textarea
              value={newMessage}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button onClick={handleSendMessage}>보내기</button>

            <div className="secure-payment-box">
              <button
                className="secure-payment-btn"
                onClick={handleSecurePaymentRequest}
              >
                안전결제 요청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
