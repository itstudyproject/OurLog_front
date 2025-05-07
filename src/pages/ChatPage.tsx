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
}

const ChatPage: React.FC = () => {
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // 채팅창 모달 열기
  const handleOpenChatModal = (user: string) => {
    setCurrentUser(user);
    setIsListModalVisible(false);
    setIsChatModalVisible(true);
    setMessages([]); // 새 채팅 시작
  };

  // 채팅목록 모달 닫기
  const handleCloseListModal = () => setIsListModalVisible(false);

  // 나가기 버튼 클릭
  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentUser(null);
    setIsListModalVisible(true);
  };

  // 메시지 보내기
  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message: ChatMessage = {
        sender: "Me",
        message: newMessage,
      };
      setMessages([...messages, message]);
      setNewMessage(""); // 입력창 초기화
    }
  };

  // 엔터키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      {/* 채팅 목록 모달 */}
      {isListModalVisible && (
        <div className="modal-overlay">
          <div className="chat-list-modal">
            <div className="chat-list-header">
              <h2>채팅 목록</h2>
              <button className="exit-btn" onClick={handleCloseListModal}>닫기</button>
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

      {/* 채팅창 모달 */}
      {isChatModalVisible && currentUser && (
        <div className="chat-modal">
          <div className="chat-header">
            <div className="chat-header-left">
              <img src={userProfiles[currentUser] || "/profile-placeholder.jpg"} alt={currentUser} />
              <span>{currentUser}</span>
            </div>
            <button className="exit-btn" onClick={handleExitClick}>나가기</button>
          </div>

          {/* 메시지 영역 */}
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender === "Me" ? "me" : "you"}`}>
                {msg.sender !== "Me" && (
                  <img src={userProfiles[currentUser] || "/profile-placeholder.jpg"} alt="상대방" className="profile-icon" />
                )}
                <div className={`message ${msg.sender === "Me" ? "me-message" : "you-message"}`}>
                  {msg.message.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 메시지 입력창 */}
          <div className="chat-footer">
            <textarea
              value={newMessage}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button onClick={handleSendMessage}>보내기</button>

            {/* 안전결제 요청 버튼 */}
            <div className="secure-payment-box">
              <button className="secure-payment-btn">안전결제 요청</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
