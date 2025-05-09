// ChatPage.tsx
import React, { useState } from "react";
import "../styles/ChatPage.css";

const userProfiles: { [key: string]: string } = {
  ann: "/images/ann_01.jpg",
  john: "/images/john_01.jpg",
  mary: "/images/mary_01.jpg",
  오달숙: "/images/오달숙_01.jpg",
  제임스: "/images/제임스_01.jpg",
};

interface ChatMessage {
  sender: string;
  message: string;
  paymentInfo?: {
    itemImage: string;
    itemName: string;
    price: number;
  };
  isPaymentFormVisible?: boolean;
  hidden?: boolean;
  isPaymentComplete?: boolean;
}

const ChatPage: React.FC = () => {
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");

  const handleOpenChatModal = (user: string) => {
    const confirmChat = window.confirm(`${user}님과 채팅을 시작하시겠습니까?`);
    if (!confirmChat) return;
    setCurrentUser(user);
    setIsListModalVisible(false);
    setIsChatModalVisible(true);
    setMessagesByUser((prev) => ({ ...prev, [user]: prev[user] || [] }));
  };

  const handleCloseListModal = () => setIsListModalVisible(false);
  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentUser(null);
    setIsListModalVisible(true);
    setCardNumber("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentUser) return;
    const message: ChatMessage = { sender: "Me", message: newMessage };
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), message],
    }));
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSecurePaymentRequest = () => {
    if (!currentUser) return;
    const message: ChatMessage = {
      sender: currentUser,
      message: "상대방이 안전결제를 요청했습니다.",
      paymentInfo: {
        itemImage: "/images/파스타.jpg",
        itemName: "디지털 아트워크",
        price: 50000,
      },
      isPaymentFormVisible: false,
    };
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), message],
    }));
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
      isPaymentFormVisible: false,
      hidden: true,
    };
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser || ""]: [...(prev[currentUser || ""] || []), message],
    }));
  };

  const handleRejectPayment = () => {
    const message: ChatMessage = {
      sender: "Me",
      message: "안전결제를 거절하셨습니다.",
    };
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser || ""]: [...(prev[currentUser || ""] || []), message],
    }));
  };

  const togglePaymentForm = (index: number) => {
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser || ""]: prev[currentUser || ""].map((msg, i) =>
        i === index
          ? { ...msg, isPaymentFormVisible: !msg.isPaymentFormVisible }
          : msg
      ),
    }));
  };

  const handlePaymentSubmit = (index: number) => {
    if (cardNumber.length !== 12) {
      alert("카드 번호는 12자리여야 합니다.");
      return;
    }

    alert("결제가 완료되었습니다.");

    const updatedMessages = messagesByUser[currentUser || ""].map((msg, i) =>
      i === index
        ? { ...msg, isPaymentFormVisible: false, isPaymentComplete: true }
        : msg
    );

    const paymentSuccessMessage: ChatMessage = {
      sender: "Me",
      message: "결제가 완료되었습니다.",
    };

    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser || ""]: [...updatedMessages, paymentSuccessMessage],
    }));

    setCardNumber("");
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
                    <p>
                      {messagesByUser[user]?.length
                        ? messagesByUser[user][messagesByUser[user].length - 1]
                            .message
                        : "대화를 시작해보세요"}
                    </p>
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
              <img src={userProfiles[currentUser]} alt={currentUser} />
              <span>{currentUser}</span>
            </div>
            <button className="exit-btn" onClick={handleExitClick}>
              나가기
            </button>
          </div>

          {messagesByUser[currentUser].map((msg, index) =>
            msg.hidden ? null : (
              <div
                key={index}
                className={`message-row ${msg.sender === "Me" ? "me" : "you"}`}
              >
                {msg.sender !== "Me" && (
                  <img
                    src={userProfiles[currentUser]}
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
                      <img src={msg.paymentInfo.itemImage} alt="상품" />
                      <div className="item-details">
                        <strong>{msg.paymentInfo.itemName}</strong>
                        <p>{msg.paymentInfo.price.toLocaleString()}원</p>
                      </div>
                      {!msg.isPaymentFormVisible ? (
                        <button
                          className="go-to-payment"
                          onClick={() => togglePaymentForm(index)}
                          disabled={msg.isPaymentComplete}
                        >
                          결제하기
                        </button>
                      ) : (
                        <div className="payment-form">
                          <p>
                            <strong>결제 정보 확인</strong>
                          </p>
                          <label>
                            카드 번호:
                            <input
                              type="text"
                              value={cardNumber}
                              placeholder="123456789012"
                              onChange={(e) =>
                                setCardNumber(
                                  e.target.value.replace(/[^0-9]/g, "")
                                )
                              }
                              maxLength={12}
                            />
                          </label>
                          <p>
                            최종 결제 금액:{" "}
                            {msg.paymentInfo.price.toLocaleString()}원
                          </p>
                          <div className="payment-buttons">
                            <button onClick={() => togglePaymentForm(index)}>
                              돌아가기
                            </button>
                            <button onClick={() => handlePaymentSubmit(index)}>
                              결제 진행
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          <div className="chat-footer">
            <textarea
              value={newMessage}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
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
