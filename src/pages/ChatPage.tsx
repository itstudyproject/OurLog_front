import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "../styles/ChatPage.css";
import { getAuthHeaders, getToken } from "../utils/auth";

interface UserProfile {
  nickname: string;
  profileImage: string;
}

interface ChatMessage {
  sender: string;
  receiver: string;
  content: string;
  timestamp?: string;
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
  const navigate = useNavigate();

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");

  const stompClient = useRef<any>(null);

  // 브라우저 호환성: global 객체 설정
  useEffect(() => {
    if (typeof global === "undefined") {
      (window as any).global = window;
    }
  }, []);

  // 1. 사용자 목록 API 호출
  useEffect(() => {
    fetch("/chat/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("유저 목록 불러오기 실패");
        }
        return res.json();
      })
      .then((data: UserProfile[]) => setUserProfiles(data))
      .catch(console.error);
  }, []);

  // 2. 유저 목록이 비어 있으면 기본 유저와 채팅 시작
  useEffect(() => {
    if (userProfiles.length === 0) {
      const fallbackUser = "관리자";
      setCurrentUser(fallbackUser);
      setMessagesByUser((prev) => ({ ...prev, [fallbackUser]: [] }));
    }
  }, [userProfiles]);

  // 3. currentUser 변경 시 WebSocket 연결 & 구독
  useEffect(() => {
    if (!currentUser) return;

    const token = getToken(); // ex: "Bearer eyJhbGci..."
    const pureToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const url = `http://localhost:8080/ourlog/ws-chat?token=${encodeURIComponent(
      pureToken
    )}`;

    const socket = new SockJS(url);
    const client = Stomp.over(socket);
    client.debug = null; // 로그 제거

    client.connect(
      {}, // 헤더는 전달하지 않음 (JWT는 쿼리파라미터로 전달)
      () => {
        console.log("STOMP 연결 성공");

        client.subscribe(`/topic/messages/${currentUser}`, (message: any) => {
          const body = JSON.parse(message.body) as ChatMessage;

          setMessagesByUser((prev) => ({
            ...prev,
            [currentUser]: [...(prev[currentUser] || []), body],
          }));
        });
      },
      (error) => {
        console.error("STOMP 연결 실패:", error);
      }
    );

    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect(() => {
          console.log("Disconnected");
        });
        stompClient.current = null;
      }
    };
  }, [currentUser]);

  // 4. 채팅 모달 열기
  const handleOpenChatModal = (user: string) => {
    console.log("handleOpenChatModal 실행");
    if (window.confirm(`${user}님과 채팅을 시작하시겠습니까?`)) {
      setCurrentUser(user);
      setIsListModalVisible(false);
      setIsChatModalVisible(true);
      setMessagesByUser((prev) => ({ ...prev, [user]: prev[user] || [] }));
    }
  };

  // 5. 모달 닫기 등 UI 핸들러
  const handleCloseListModal = () => {
    setIsListModalVisible(false);
  };

  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentUser(null);
    setIsListModalVisible(true);
    setCardNumber("");
    navigate("/worker/{userId}");
  };

  // 6. 메시지 전송
  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentUser) return;

    const message: ChatMessage = {
      sender: "Me",
      receiver: currentUser,
      content: newMessage,
    };

    // 클라이언트 화면 먼저 갱신
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), message],
    }));
    setNewMessage("");

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send("/app/chat/send", {}, JSON.stringify(message));
    } else {
      alert("서버와 연결되어 있지 않습니다.");
    }
  };

  // 7. Enter키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 8. 안전결제 요청 (예시)
  const handleSecurePaymentRequest = () => {
    if (!currentUser) return;
    const message: ChatMessage = {
      sender: currentUser,
      receiver: "Me",
      content: "상대방이 안전결제를 요청했습니다.",
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

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send("/app/chat/send", {}, JSON.stringify(message));
    }
  };

  // 9. 결제 폼 토글
  const togglePaymentForm = (index: number) => {
    if (!currentUser) return;
    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser]: prev[currentUser].map((msg, i) =>
        i === index
          ? { ...msg, isPaymentFormVisible: !msg.isPaymentFormVisible }
          : msg
      ),
    }));
  };

  // 10. 결제 완료 처리
  const handlePaymentSubmit = (index: number) => {
    if (cardNumber.length !== 12) {
      alert("카드 번호는 12자리여야 합니다.");
      return;
    }

    alert("결제가 완료되었습니다.");

    if (!currentUser) return;

    const paymentSuccessMessage: ChatMessage = {
      sender: "Me",
      receiver: currentUser,
      content: "결제가 완료되었습니다.",
      hidden: false,
      isPaymentComplete: true,
    };

    setMessagesByUser((prev) => ({
      ...prev,
      [currentUser]: prev[currentUser]
        .map((msg, i) =>
          i === index
            ? { ...msg, isPaymentFormVisible: false, isPaymentComplete: true }
            : msg
        )
        .concat(paymentSuccessMessage),
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
              {userProfiles.map((user, idx) => (
                <li
                  key={idx}
                  onClick={() => handleOpenChatModal(user.nickname)}
                >
                  <img src={user.profileImage} alt={user.nickname} />
                  <div className="chat-info">
                    <strong>{user.nickname}</strong>
                    <p>
                      {messagesByUser[user.nickname] &&
                      messagesByUser[user.nickname].length > 0
                        ? messagesByUser[user.nickname][
                            messagesByUser[user.nickname].length - 1
                          ].content
                        : "대화를 시작해보세요"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {currentUser && (
        <div className="modal-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <div className="chat-header-left">
                <img
                  src={
                    userProfiles.find((u) => u.nickname === currentUser)
                      ?.profileImage || "/profile-placeholder.jpg"
                  }
                  alt={currentUser}
                />
                <span>{currentUser}</span>
              </div>
              <button className="exit-btn" onClick={handleExitClick}>
                나가기
              </button>
            </div>

            <div className="chat-messages">
              {messagesByUser[currentUser]?.map(
                (msg, index) =>
                  !msg.hidden && (
                    <div
                      key={index}
                      className={`message-row ${
                        msg.sender === "Me" ? "me" : "you"
                      }`}
                    >
                      {msg.sender !== "Me" && (
                        <img
                          src={
                            userProfiles.find((u) => u.nickname === currentUser)
                              ?.profileImage || "/profile-placeholder.jpg"
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
                        {msg.content.split("\n").map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}

                        {msg.paymentInfo && (
                          <div className="payment-card">
                            <img
                              src={msg.paymentInfo.itemImage}
                              alt={msg.paymentInfo.itemName}
                            />
                            <div>
                              <p>{msg.paymentInfo.itemName}</p>
                              <p>₩{msg.paymentInfo.price.toLocaleString()}</p>
                            </div>

                            {!msg.isPaymentFormVisible &&
                              !msg.isPaymentComplete && (
                                <button
                                  onClick={() => togglePaymentForm(index)}
                                  className="payment-btn"
                                >
                                  결제하기
                                </button>
                              )}

                            {msg.isPaymentFormVisible && (
                              <form
                                className="payment-form"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handlePaymentSubmit(index);
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="카드 번호 12자리 입력"
                                  value={cardNumber}
                                  maxLength={12}
                                  onChange={(e) =>
                                    setCardNumber(
                                      e.target.value.replace(/[^0-9]/g, "")
                                    )
                                  }
                                />
                                <button type="submit">결제 완료</button>
                              </form>
                            )}

                            {msg.isPaymentComplete && (
                              <p className="payment-complete-msg">
                                결제가 완료되었습니다.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>

            <div className="chat-input-area">
              <textarea
                placeholder="메시지를 입력하세요"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSendMessage}>전송</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
