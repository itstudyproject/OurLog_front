import React, { useState } from "react";
import "../styles/ChatPage.css";

interface ChatMessage {
  sender: string;
  message: string;
}

const userProfiles: { [key: string]: string } = {
  ann: "/images/ann_01.jpg",
  john: "/images/john_01.jpg",
  mary: "/images/mary_01.jpg",
  오달숙: "/images/오달숙_01.jpg",
  제임스: "/images/제임스_01.jpg",
};

const ChatPage: React.FC = () => {
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBlinking, setIsBlinking] = useState(false);

  const handleOpenChatModal = (user: string) => {
    setCurrentUser(user);
    setIsListModalVisible(false);
    setIsChatModalVisible(true);
    setMessages([]);
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 5000);
  };

  const handleCloseListModal = () => setIsListModalVisible(false);

  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentUser(null);
    setIsListModalVisible(true);
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
        <div className={`chat-modal ${isBlinking ? "blinking" : ""}`}>
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

          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.sender === "Me" ? "me" : "you"}`}
              >
                {msg.sender !== "Me" && (
                  <img
                    src={
                      userProfiles[currentUser] || "/profile-placeholder.jpg"
                    }
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
                </div>
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <textarea
              value={newMessage}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button onClick={handleSendMessage}>보내기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
