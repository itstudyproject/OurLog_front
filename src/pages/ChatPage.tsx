import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";
import { getToken } from "../utils/auth";
import SendbirdChat from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule, GroupChannel } from '@sendbird/chat/groupChannel';
import { UserMessage, BaseMessage } from '@sendbird/chat/message';
import { UserMessageCreateParams } from '@sendbird/chat/message';
import { OpenChannelModule } from '@sendbird/chat/openChannel';
import { BaseChannel } from '@sendbird/chat';

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
  messageId?: number;
  createdAt?: number;
  messageType?: string;
  customType?: string;
  data?: string;
}

// 이 변수는 사용되지 않으므로 제거하거나 주석 처리할 수 있습니다.
// const token = localStorage.getItem("token");

// 여기에 실제 Sendbird App ID를 입력하세요.
const APP_ID = 'C13DF699-49C2-474D-A2B4-341FBEB354EE';

// Sendbird SDK 인스턴스를 컴포넌트 외부가 아닌 내부에서 관리하는 것이 좋습니다.
// 여기서는 일단 useEffect 내에서 초기화하고, 필요에 따라 상태 관리 방식을 적용합니다.
// let sbInstance: SendbirdChat | null = null; // useRef로 관리하므로 제거

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<GroupChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelHandlerId = useRef<string>(`CHANNEL_HANDLER_ID_${Date.now()}`).current;

  // 글로벌 객체가 없으면 window를 할당 (브라우저 호환성)
  useEffect(() => {
    if (typeof global === "undefined") {
      (window as any).global = window;
    }
  }, []);

  // 백엔드에서 Sendbird Access Token과 User ID를 가져오는 비동기 함수
  const fetchSendbirdAuthInfo = async () => {
    const tokenWithPrefix = getToken(); // "Bearer [토큰]" 형식으로 반환될 것으로 예상

    if (!tokenWithPrefix) {
      console.error("JWT token not found. Cannot fetch Sendbird auth info.");
      navigate('/login');
      return null;
    }

    // "Bearer " 접두사 제거하고 순수한 토큰만 추출
    const token = tokenWithPrefix.startsWith('Bearer ') ? tokenWithPrefix.substring(7) : tokenWithPrefix;
    console.log("Extracted token for backend:", token);


    try {
      console.log("Fetching Sendbird auth info from backend...");
      // 백엔드 엔드포인트 URL 확인: /ourlog/chat/token (Controller에 @RequestMapping("/chat"), SecurityConfig에 /ourlog/** 매핑 가정)
      const response = await fetch('http://localhost:8080/ourlog/chat/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 순수한 토큰 문자열 사용
        },
      });

      if (!response.ok) {
        // 오류 응답 본문에서 상세 정보 파싱 시도
        const errorData = response.headers.get('Content-Type')?.includes('application/json')
          ? await response.json()
          : { message: await response.text(), error: response.statusText }; // JSON이 아니면 텍스트로 처리

        console.error("Failed to fetch Sendbird auth info:", response.status, errorData);
        // 백엔드 응답에 'message'나 'error' 필드가 없을 경우를 대비
        const errorMessage = errorData.message || errorData.error || response.statusText || `HTTP error! status: ${response.status}`;
        throw new Error(`Failed to fetch Sendbird auth info: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Received Sendbird auth info:", data);

       // 여기서 data.token 대신 data.accessToken을 확인하도록 수정합니다.
       if (!data.accessToken) {
         throw new Error("Sendbird accessToken not received from backend.");
       }

       // TODO: 백엔드 응답 형태에 따라 userId 추출 로직 수정
       // 현재 백엔드 코드는 accessToken만 반환하므로 userId는 다른 곳(예: JWT 디코딩)에서 가져오거나
       // 백엔드 /chat/token 엔드포인트를 수정하여 userId도 함께 반환해야 합니다.
       // 임시로 JWT에서 userId를 가져오는 예시 (실제 JWT 디코딩 라이브러리 사용 권장)
       const userString = localStorage.getItem("user"); // 로그인 페이지에서 저장한 user 정보 (임시)
       let backendUserId: string | null = null;
       if (userString) {
           try {
               const user = JSON.parse(userString);
               // 서비스의 User ID (Sendbird User ID는 string 타입 사용 권장)
               backendUserId = String(user.userId);
           } catch (e) {
               console.error("Failed to parse user info from localStorage for userId", e);
           }
       }

       if (!backendUserId) {
           throw new Error("Could not determine Sendbird User ID (backend userId). Please ensure user info is stored or fetched correctly.");
       }


      return {
        userId: backendUserId, // Sendbird User ID로 사용할 백엔드 사용자 ID
        // 여기서 data.token 대신 data.accessToken을 사용하도록 수정합니다.
        sendbirdAccessToken: data.accessToken, // 백엔드에서 받아온 Access Token
      };

    } catch (e: any) {
      console.error("Error fetching Sendbird auth info:", e);
      // 사용자 친화적인 오류 메시지 설정
      setError(`채팅 시스템 초기화 실패: ${e.message || '알 수 없는 오류 발생'}`);
      setLoading(false);
      return null;
    }
  };


  // Sendbird SDK 인스턴스 및 연결 관리 (v4 비동기 방식)
  // SendbirdChatInstanceType 타입으로 선언하여 타입 안정성 확보
  const sbInstance = useRef<SendbirdChat | null>(null); // useRef 사용

  useEffect(() => {
    const initializeAndConnectSendbird = async () => {
      setLoading(true);
      setError(null);

      const userInfo = await fetchSendbirdAuthInfo(); // 백엔드에서 사용자 정보 비동기로 가져오기

      // fetchSendbirdAuthInfo 함수 내에서 이미 에러 발생 시 null을 반환하고 에러 상태를 설정하므로,
      // 여기서 추가적인 오류 메시지 출력 대신 로딩 상태만 해제합니다.
      if (!userInfo || !userInfo.userId || !userInfo.sendbirdAccessToken) {
        // console.error("Sendbird connection failed: User info, userId, or accessToken not available after fetching."); // 이 로그는 이제 불필요
        setLoading(false);
        return;
      }

      try {
        console.log('Initializing Sendbird SDK (v4)');
        // useRef의 current 속성에 할당
        const sendbirdChatInstance = await SendbirdChat.init({
          appId: APP_ID,
          // 필요한 모듈을 modules 배열에 추가합니다.
          modules: [new GroupChannelModule(), new OpenChannelModule()], // GroupChannelModule 추가
          // logger: { console: console, level: SendbirdChat.Logger.LogLevel.INFO } // 필요 시 로깅 활성화
        });
        sbInstance.current = sendbirdChatInstance; // 초기화 결과 할당

        console.log('Sendbird SDK initialized:', sbInstance.current);
        // 초기화된 인스턴스가 올바른 타입인지 확인하는 로그 추가 (객체 내용을 더 자세히)
        console.log('sbInstance.current details:', typeof sbInstance.current, sbInstance.current);


        console.log(`Connecting to Sendbird as user ${userInfo.userId} with token...`);
        // Connect to Sendbird
        // connect 메소드는 SendbirdChat 인스턴스에 직접 있습니다.
        // sbInstance.current가 null이 아님을 보장하고 connect 호출
        const user = await sbInstance.current!.connect(userInfo.userId, userInfo.sendbirdAccessToken);
        console.log('Sendbird connection successful:', user);
        setCurrentUser(user.userId); // Sendbird User ID를 상태에 저장

        // 채널 목록 가져오기 (GroupChannelModule이 초기화되었으므로 groupChannel 접근 가능)
        console.log('Fetching channel list');
        // GroupChannelModule의 기능은 SendbirdChat 인스턴스에 직접 노출됩니다.
        // sbInstance.current가 null이 아님을 보장하고 groupChannel에 접근
        const channelListQuery = sbInstance.current!.groupChannel.createMyGroupChannelListQuery({
          limit: 10, // 가져올 채널 수 제한
          // includeEmpty: true, // 비어 있는 채널 포함 여부
          // order: 'latest_last_message', // 정렬 순서
        });

        const channels = await channelListQuery.next();
        console.log('Fetched channels:', channels);
        setChannels(channels); // 채널 목록 상태 업데이트

        // Sendbird 이벤트 핸들러 등록
        console.log('Adding Sendbird channel handler');
        const channelHandler = new GroupChannelHandler();

        // message 타입을 BaseMessage로 명시하여 추론 오류 방지
        // channel 타입을 BaseChannel로 명시하여 린터 오류 해결
        channelHandler.onMessageReceived = (channel: BaseChannel, message: BaseMessage) => {
          console.log('Message received:', channel, message);

          // 메시지가 사용자 메시지(user message) 타입인지 확인합니다.
          if (message.messageType === 'user') {
            const userMessage = message as UserMessage; // UserMessage로 타입 캐스팅

            // Sendbird 메시지 객체의 구조를 확인하여 ChatMessage 인터페이스와 매핑
            const formattedMessage: ChatMessage = {
              sender: userMessage.sender?.userId || 'Unknown', // UserMessage에서 sender 접근
              message: userMessage.message, // UserMessage에서 message 접근
              messageId: userMessage.messageId,
              createdAt: userMessage.createdAt,
              messageType: userMessage.messageType,
              customType: userMessage.customType,
              data: userMessage.data,
              // TODO: customType 및 data 기반으로 paymentInfo 등 처리 로직 추가 필요
              // isPaymentComplete 등은 UI 상태이므로 Sendbird 메시지 자체에 저장하기보다는
              // 수신된 메시지 data를 바탕으로 UI 상태를 결정하는 것이 일반적입니다.
            };

             // 안전결제 메시지 데이터 파싱
            try {
              if (userMessage.customType === 'payment_request' && userMessage.data) {
                const customData = JSON.parse(userMessage.data);
                 if (customData.paymentInfo) {
                  formattedMessage.paymentInfo = customData.paymentInfo;
                 }
                 // isPaymentComplete 등은 UI 상태이므로 메시지 data에 있다면 활용
                 if (customData.isPaymentComplete !== undefined) {
                    formattedMessage.isPaymentComplete = customData.isPaymentComplete;
                 }
                 if (customData.isPaymentFormVisible !== undefined) {
                    formattedMessage.isPaymentFormVisible = customData.isPaymentFormVisible;
                 } else {
                   formattedMessage.isPaymentFormVisible = false; // 기본값 설정
                 }
              }
            } catch (e) {
              console.error("Failed to parse message data:", e);
            }

            // 채널 URL이 GroupChannel 객체에 있는지 확인
            // isGroupChannel 속성이 함수인지 확인하고 호출하도록 수정 (린터 오류 해결)
            // Sendbird v4 문서에 따르면 isGroupChannel은 Boolean 속성이지만,
            // 린터가 함수로 인식하는 경우를 대비하여 이전처럼 함수 호출 및 any 캐스팅 사용
             if ('url' in channel && (channel as any).isGroupChannel && (channel as any).isGroupChannel()) {
              setMessagesByUser(prev => ({
                ...prev,
                [channel.url]: [...(prev[channel.url] || []), formattedMessage]
              }));
            } else {
              console.warn("Received message from a non-group channel or channel without URL:", channel);
              // 또는 오류 처리 로직 추가
            }


          } else {
            // 사용자 메시지가 아닌 다른 타입의 메시지 (예: 관리자 메시지) 처리 로직
            console.log(`Received non-user message of type: ${message.messageType}`);
            // 필요에 따라 다른 메시지 타입에 대한 처리 추가 (예: UI에 시스템 메시지 표시)
             const formattedMessage: ChatMessage = {
               sender: 'System', // 또는 다른 표시
               message: `[${message.messageType}] ${message.message || 'System message'}`,
               messageId: message.messageId,
               createdAt: message.createdAt,
               messageType: message.messageType,
               customType: message.customType,
               data: message.data,
             };
              // 채널 URL이 GroupChannel 객체에 있는지 확인
            if ('url' in channel) {
              setMessagesByUser(prev => ({
                ...prev,
                [channel.url]: [...(prev[channel.url] || []), formattedMessage]
              }));
            } else {
               console.warn("Received message from a channel without a URL property:", channel);
              // 또는 오류 처리 로직 추가
            }
          }
        };

        // sbInstance.current가 SendbirdChat 타입이므로 addChannelHandler 사용 가능
        if (sbInstance.current) {
             // v4 addChannelHandler 사용
             // 린터 오류 발생 시 주석 처리
             // @ts-ignore
             sbInstance.current.groupChannel.addGroupChannelHandler(channelHandlerId, channelHandler);
             console.log('Sendbird channel handler added with ID:', channelHandlerId);
        }


      } catch (error: any) { // 에러 타입을 any로 캐스팅
        console.error('Sendbird initialization or connection failed:', error);
        setError(`채팅 시스템 초기화 실패: ${error.message || '알 수 없는 오류 발생'}`);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    initializeAndConnectSendbird();

    // 컴포넌트 언마운트 시 Sendbird 연결 해제 및 핸들러 제거
    return () => {
      console.log("ChatPage unmounting. Cleaning up Sendbird.");
      if (sbInstance.current) {
        // v4 removeChannelHandler는 핸들러 ID를 인자로 받습니다.
        // SendbirdChat 인스턴스에 removeChannelHandler가 직접 있습니다.
        sbInstance.current.removeChannelHandler(channelHandlerId);
        console.log('Sendbird channel handler removed with ID:', channelHandlerId);

        // v4 disconnect는 콜백 인자가 없습니다.
        // SendbirdChat 인스턴스에 disconnect 메소드가 있는지 확인
        if (typeof sbInstance.current.disconnect === 'function') {
             console.log("Disconnecting from Sendbird");
             sbInstance.current.disconnect(); // 콜백 제거
             console.log("Sendbird disconnected.");
        } else {
             console.warn("Sendbird disconnect method not found on sbInstance.current.");
        }

      }
    };
  }, [navigate]); // navigate를 의존성 배열에 추가 (navigate 함수 변경 시 useEffect 재실행)


  const handleOpenChatModal = async (channelUrl: string) => {
    console.log("채널 선택:", channelUrl);
    // Sendbird 채널 URL로 채널 인스턴스를 가져와서 상태에 저장
    if (sbInstance.current) { // null 체크
      try {
        // GroupChannelModule의 기능은 SendbirdChat 인스턴스에 직접 노출됩니다.
         const channel = await sbInstance.current.groupChannel.getChannel(channelUrl);
        console.log('Selected channel:', channel);
        setCurrentChannel(channel); // 현재 선택된 채널 상태 업데이트
        setIsListModalVisible(false);
        setIsChatModalVisible(true);

        // 선택된 채널의 메시지 불러오기
        console.log('Fetching messages for channel:', channelUrl);
         // createMessageListQuery도 groupChannel 모듈의 메소드입니다.
        const messageListQuery = channel.createMessageListQuery({
          limit: 100,
           reverse: true, // 최신 메시지부터 가져오려면 true
        });
        const messages = await messageListQuery.next();
        console.log('Fetched messages:', messages);

        // 가져온 Sendbird 메시지 객체를 ChatMessage 인터페이스에 맞게 변환하여 상태에 저장
        const formattedMessages: ChatMessage[] = messages.map(msg => {
           const baseMessage: ChatMessage = {
              // Sendbird 메시지 객체 (BaseMessage 또는 하위 타입)에는 sender 속성이 있습니다.
              sender: msg.sender?.userId || 'Unknown',
              // UserMessage 타입일 경우 message 속성 사용, 아니면 빈 문자열
              message: (msg as UserMessage).message || '',
              messageId: msg.messageId,
              createdAt: msg.createdAt,
              messageType: msg.messageType,
              customType: msg.customType,
              data: msg.data,
              // paymentInfo, isPaymentComplete 등은 data 파싱 후 추가
            };

             // 안전결제 메시지 데이터 파싱
            try {
              // customType과 data 속성은 BaseMessage에 있습니다.
              if (msg.customType === 'payment_request' && msg.data) {
                const customData = JSON.parse(msg.data);
                 if (customData.paymentInfo) {
                  baseMessage.paymentInfo = customData.paymentInfo;
                 }
                 if (customData.isPaymentComplete !== undefined) {
                    baseMessage.isPaymentComplete = customData.isPaymentComplete;
                 }
                 if (customData.isPaymentFormVisible !== undefined) {
                    baseMessage.isPaymentFormVisible = customData.isPaymentFormVisible;
                 } else {
                   baseMessage.isPaymentFormVisible = false; // 기본값 설정
                 }
              }
            } catch (e) {
              console.error("Failed to parse message data:", e);
            }
            return baseMessage;
        });

        // 기존 messagesByUser 상태 업데이트 (선택된 채널의 메시지로 교체)
        // 불러온 메시지가 최신순이면 reverse()로 순서 뒤집기 필요
        setMessagesByUser(prev => ({ ...prev, [channel.url]: formattedMessages.reverse() }));


      } catch (messageError: any) { // 에러 타입을 any로 캐스팅
        console.error('Failed to get channel or fetch messages:', messageError);
         setError(`채널 메시지 로딩 실패: ${messageError.message || '알 수 없는 오류 발생'}`);
      }
    } else {
      console.error('Sendbird SDK not initialized.');
       setError('채팅 시스템이 초기화되지 않았습니다.');
      // TODO: Sendbird 초기화 실패 알림 또는 재시도 로직
    }
  };

  const handleCloseListModal = () => {
    setIsListModalVisible(false);
  };

  const handleExitClick = () => {
    setIsChatModalVisible(false);
    // setCurrentUser(null); // Sendbird User ID는 연결 해제 시까지 유지될 수 있습니다.
    setCurrentChannel(null); // 현재 선택된 채널 상태 초기화
    setIsListModalVisible(true);
    setCardNumber("");
    // TODO: 필요 시 메시지 상태 초기화 setMessagesByUser({});
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentChannel || !sbInstance.current) return;

    // v4 UserMessage 생성 파라미터 사용
    const params: UserMessageCreateParams = {
        message: newMessage,
        // TODO: 커스텀 타입이나 데이터가 필요하다면 추가
        // customType: 'text',
        // data: '...',
    };


    // 클라이언트 화면 먼저 갱신 (임시 메시지 추가)
    // 실제 Sendbird 메시지 객체와 유사한 형태로 구성
    const tempMessage: ChatMessage = {
      messageId: Date.now(), // 임시 ID
      // SendbirdChat 인스턴스의 currentUser 속성 접근
      sender: sbInstance.current.currentUser?.userId || 'Me', // 현재 사용자 정보 활용
      message: newMessage, // newMessage 사용
      messageType: 'user', // 사용자 메시지 타입
      createdAt: Date.now(), // 임시 생성 시간
      // TODO: 안전결제 메시지 등 커스텀 타입 메시지 처리는 나중에 구현 시 customType, data 추가
      // tempMessage에 customType과 data를 추가하여 UI에서 즉시 반영할 수도 있습니다.
      customType: params.customType, // params에서 customType 사용
      data: params.data // params에서 data 사용
    };

    // 기존 messagesByUser 상태 업데이트 (선택된 채널의 메시지 목록에 추가)
    setMessagesByUser(prev => ({
      ...prev,
      [currentChannel.url]: [...(prev[currentChannel.url] || []), tempMessage]
    }));

    setNewMessage("");

    // Sendbird 메시지 전송 (v4 비동기 방식)
     currentChannel.sendUserMessage(params)
      .onSucceeded((message) => { // Sendbird UserMessage 타입 (또는 BaseMessage)
        console.log('Message sent successfully:', message);
        // 실제 전송된 메시지 객체로 UI 업데이트 (임시 메시지 교체)
        setMessagesByUser(prev => ({
          ...prev,
          [currentChannel.url]: prev[currentChannel.url].map(msg =>
            // 임시 메시지의 messageId와 실제 전송된 메시지의 messageId를 비교하여 찾습니다.
            // 임시 messageId는 클라이언트에서 생성하므로 중복 가능성이 있습니다.
            // 실제로는 임시 메시지에 고유한 클라이언트 측 ID를 부여하고,
            // 전송 성공 후 서버에서 받은 messageId와 매핑하는 로직이 더 견고합니다.
            // 여기서는 간단히 임시 messageId로 찾습니다.
            msg.messageId === tempMessage.messageId ? {
              ...msg, // 기존 임시 메시지 정보 유지
              messageId: message.messageId, // 실제 ID로 업데이트
              createdAt: message.createdAt, // 실제 시간으로 업데이트
              messageType: message.messageType, // 실제 타입
              customType: message.customType, // 실제 customType 업데이트
              data: message.data, // 실제 data 업데이트
              // TODO: 필요에 따라 message 객체의 다른 속성 업데이트
            } : msg
          )
        }));
      })
      .onFailed((error) => { // 실패 콜백
        console.error('Message send failed:', error);
        // 메시지 전송 실패 시 처리 (예: 오류 메시지 표시, 재전송 옵션 제공)
        // UI에서 임시 메시지를 오류 상태로 표시하거나 제거할 수 있습니다.
        setMessagesByUser(prev => ({
          ...prev,
          [currentChannel.url]: prev[currentChannel.url].filter(msg => msg.messageId !== tempMessage.messageId) // 임시 메시지 제거
        }));
         setError(`메시지 전송 실패: ${error.message || '알 수 없는 오류 발생'}`);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSecurePaymentRequest = () => {
    if (!currentChannel || !sbInstance.current) return;

    const paymentInfo = {
      itemImage: "/images/파스타.jpg",
      itemName: "디지털 아트워크",
      price: 50000,
    };

    // Sendbird 커스텀 타입 메시지로 안전결제 요청 전송 (v4 UserMessageCreateParams 사용)
    const params: UserMessageCreateParams = {
        message: "안전결제 요청이 도착했습니다.", // 실제 전송할 텍스트 메시지 내용 (선택 사항)
        customType: 'payment_request', // 커스텀 타입으로 메시지 구분
        data: JSON.stringify({ // paymentInfo와 초기 UI 상태(예: isPaymentComplete)를 string으로 변환하여 data에 저장
            paymentInfo: paymentInfo,
            isPaymentComplete: false, // 초기 상태
            isPaymentFormVisible: false, // 초기 상태 (UI 상태지만 메시지에 저장하여 수신 측에서 활용 가능)
        }),
    };


    // 클라이언트 화면 먼저 갱신 (임시 메시지 추가)
     const tempMessage: ChatMessage = {
      messageId: Date.now(), // 임시 ID
      // SendbirdChat 인스턴스의 currentUser 속성 접근
      sender: sbInstance.current.currentUser?.userId || 'Me', // 현재 사용자 정보 활용
      message: params.message || '', // 실제 전송될 텍스트 메시지 내용
      messageType: 'user', // Sendbird에서는 커스텀 메시지도 user message type으로 전송
      createdAt: Date.now(), // 임시 생성 시간
      paymentInfo: paymentInfo, // UI 표시를 위한 paymentInfo (data에서 파싱될 내용)
      isPaymentFormVisible: false, // 초기 UI 상태 (data에서 파싱될 내용)
      isPaymentComplete: false, // 초기 UI 상태 (data에서 파싱될 내용)
      // customType, data 등 Sendbird 메시지 객체의 다른 속성은 전송 성공 후 업데이트
      // tempMessage에 customType과 data를 추가하여 UI에서 즉시 반영할 수도 있습니다.
      customType: params.customType, // params에서 customType 사용
      data: params.data // params에서 data 사용
    };

     setMessagesByUser(prev => ({
        ...prev,
        [currentChannel.url]: [...(prev[currentChannel.url] || []), tempMessage]
      }));


    currentChannel.sendUserMessage(params)
      .onSucceeded((message) => { // Sendbird UserMessage 타입 (또는 BaseMessage)
          console.log('Payment request message sent successfully:', message);
           // 실제 전송된 메시지 객체로 UI 업데이트 (임시 메시지 교체)
           // 전송 성공 시 반환되는 메시지 객체에는 customType과 data가 포함됩니다.
            setMessagesByUser(prev => ({
              ...prev,
              [currentChannel.url]: prev[currentChannel.url].map(msg => {
                if (msg.messageId === tempMessage.messageId) { // 임시 ID 비교
                  const updatedMsg: ChatMessage = {
                     ...msg,
                     messageId: message.messageId, // 실제 ID로 업데이트
                     createdAt: message.createdAt, // 실제 시간으로 업데이트
                     messageType: message.messageType, // 실제 타입
                     customType: message.customType, // 실제 customType 업데이트
                     data: message.data, // 실제 data 업데이트
                     // 실제 메시지 객체의 data를 파싱하여 paymentInfo, isPaymentComplete 등 업데이트
                  };
                   try {
                    // 실제 메시지 객체의 customType과 data를 확인
                    if (message.customType === 'payment_request' && message.data) {
                      const actualData = JSON.parse(message.data);
                       if (actualData.paymentInfo) {
                        updatedMsg.paymentInfo = actualData.paymentInfo;
                       }
                       if (actualData.isPaymentComplete !== undefined) {
                          updatedMsg.isPaymentComplete = actualData.isPaymentComplete;
                       }
                       if (actualData.isPaymentFormVisible !== undefined) {
                          updatedMsg.isPaymentFormVisible = actualData.isPaymentFormVisible;
                       }
                    }
                  } catch (e) {
                    console.error("Failed to parse sent message data:", e);
                  }
                  return updatedMsg;

                } else {
                  return msg;
                }
              })
            }));
        })
      .onFailed((error) => { // 실패 콜백
        console.error('Payment request message send failed:', error);
         // UI에서 임시 메시지를 오류 상태로 표시하거나 제거할 수 있습니다.
          setMessagesByUser(prev => ({
            ...prev,
            [currentChannel.url]: prev[currentChannel.url].filter(msg => msg.messageId !== tempMessage.messageId) // 임시 메시지 제거
          }));
         setError(`안전결제 메시지 전송 실패: ${error.message || '알 수 없는 오류 발생'}`);
        });
  };

  // TODO: 메시지 ID를 사용하여 특정 메시지의 UI 상태를 변경하도록 수정 필요
  const togglePaymentForm = (messageId: number | undefined) => {
    if (!currentChannel || messageId === undefined) return;
    setMessagesByUser((prev) => ({
      ...prev,
      [currentChannel.url]: prev[currentChannel.url].map((msg) => {
         // 메시지 ID로 찾아서 isPaymentFormVisible 상태 토글
        if (msg.messageId === messageId) {
           // Sendbird 메시지 객체의 data를 업데이트하는 API 호출이 필요할 수 있습니다. (권장)
           // UI 상태만 변경하는 경우 아래와 같이 상태 업데이트
           return { ...msg, isPaymentFormVisible: !msg.isPaymentFormVisible };
        }
        return msg;
      }),
    }));
  };

   // TODO: 메시지 ID를 사용하여 특정 메시지의 UI 상태를 변경하도록 수정 필요
   // 실제 결제 처리 후 Sendbird 메시지 업데이트 API를 호출하여 isPaymentComplete 등을 변경해야 합니다.
  const handlePaymentSubmit = (messageId: number | undefined) => {
    if (cardNumber.length !== 12) {
      alert("카드 번호는 12자리여야 합니다.");
      return;
    }

    alert("결제가 완료되었습니다.");
    setIsPaymentCompleted(true);

    if (!currentChannel || messageId === undefined || !sbInstance.current) return;

    // TODO: 백엔드에 실제 결제 처리 요청
    // TODO: 결제 성공 시 Sendbird 메시지 업데이트 API를 호출하여 해당 메시지의 data 필드에
    // isPaymentComplete = true 상태를 반영하도록 해야 합니다.
    // Sendbird Chat SDK에는 메시지 업데이트 API가 있습니다. (Channel.updateUserMessage)
    // 업데이트된 메시지는 모든 참여자에게 onMessageUpdated 이벤트를 통해 전달됩니다.

    // 임시: UI에서 즉시 결제 상태 반영 및 결제 완료 메시지 추가
    const paymentSuccessMessage: ChatMessage = {
      // SendbirdChat 인스턴스의 currentUser 속성 접근
      sender: sbInstance.current.currentUser?.userId || 'Me', // 현재 사용자
      message: "결제가 완료되었습니다.",
      hidden: false, // 항상 보이도록 설정
      isPaymentComplete: true, // UI 상태 업데이트
      messageId: Date.now(), // 임시 ID 또는 새로운 메시지 ID
      messageType: 'user',
      createdAt: Date.now(),
    };

    setMessagesByUser((prev) => ({
      ...prev,
      [currentChannel.url]: prev[currentChannel.url]
        .map((msg) => {
          // 해당 메시지의 isPaymentFormVisible를 false, isPaymentComplete를 true로 업데이트
          if (msg.messageId === messageId) {
             return { ...msg, isPaymentFormVisible: false, isPaymentComplete: true };
          }
          return msg;
        })
        .concat(paymentSuccessMessage), // 결제 완료 메시지 추가
    }));

    setCardNumber("");

    // TODO: 백엔드에 결제 완료 및 Sendbird 메시지 업데이트 요청 로직 추가
  };


  return (
    <div className="chat-page">
      {/* 로딩 및 오류 상태 표시 */}
      {loading && <div className="loading">Sendbird 로딩 중...</div>}
      {error && <div className="error">오류: {error}</div>}

      {!loading && !error && isListModalVisible && ( // 로딩 중, 오류 시 목록 숨김
        <div className="modal-overlay">
          <div className="chat-list-modal">
            <div className="chat-list-header">
              <h2>채팅 목록</h2>
              <button className="exit-btn" onClick={handleCloseListModal}>
                닫기
              </button>
            </div>
            <ul className="chat-list">
              {channels.map((channel) => {
                // isGroupChannel 속성이 함수인지 확인하고 호출하도록 수정 (린터 오류 해결)
                // Sendbird v4 문서에 따르면 isGroupChannel은 Boolean 속성이지만,
                // 린터가 함수로 인식하는 경우를 대비하여 이전처럼 함수 호출 및 any 캐스팅 사용
                const isOneToOne = (channel as any).isGroupChannel && (channel as any).isGroupChannel() && channel.memberCount === 2;
                // Sendbird SDK에서 제공하는 User 타입 사용 (import 제거)
                let otherUser: import('@sendbird/chat').User | null = null;
                 // sbInstance.current가 존재하고, 현재 사용자가 로그인되어 있으며, 채널 멤버가 있을 때
                 // Sendbird User 타입을 가져오기 위해 members 배열 사용
                if (isOneToOne && channel.members && sbInstance.current?.currentUser) {
                  otherUser = channel.members.find(
                    // 현재 사용자의 userId와 다른 멤버 찾기
                    // SendbirdChat 인스턴스의 currentUser 속성 접근
                    (member) => member.userId !== sbInstance.current?.currentUser?.userId
                  ) || null; // 찾지 못하면 null
                }

                // 표시할 이름과 이미지 결정
                // 1:1 채널이면 상대방 닉네임, 아니면 채널 이름, 둘 다 없으면 채널 URL
                const displayName = otherUser?.nickname || channel.name || channel.url;
                // 1:1 채널이면 상대방 프로필 이미지, 아니면 채널 커버 이미지, 둘 다 없으면 기본 이미지
                const displayImage = otherUser?.profileUrl || channel.coverUrl || "/profile-placeholder.jpg";

                return (
                  <li
                    key={channel.url} // 채널 URL을 key로 사용
                    onClick={() => handleOpenChatModal(channel.url)} // 채널 URL 전달
                  >
                    <img src={displayImage} alt={displayName} />
                    <div className="chat-info">
                      <strong>{displayName}</strong>
                      <p>
                        {/* Sendbird 채널 객체에서 최신 메시지 정보 가져오기 */}
                         {/* lastMessage가 UserMessage 타입인지 확인 후 message 속성 접근 */}
                        {channel.lastMessage && (channel.lastMessage as UserMessage).message ? (channel.lastMessage as UserMessage).message : "대화 시작"} {/* 최신 메시지 */}
                      </p>
                    </div>
                  </li>
                );
              })}
              {/* 채널 목록이 비어 있을 경우 메시지 표시 */}
              {channels.length === 0 && <p>채널이 없습니다.</p>}
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && isChatModalVisible && currentChannel && currentUser && ( // 로딩 중, 오류 시 채팅 모달 숨김
        <div className="modal-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <div className="chat-header-left">
                 {/* TODO: currentChannel의 멤버 정보를 사용하여 상대방 프로필 이미지/닉네임 표시 */}
                 {/* 현재는 임시로 currentUser(본인 Sendbird User ID)만 표시 */}
                {/* <img
                  src={
                    // TODO: currentChannel.members 에서 상대방 찾아서 profileUrl 사용
                    'profile-placeholder.jpg'
                  }
                  alt={currentUser}
                /> */}
                 {/* 임시: 현재 채팅 중인 채널 이름 또는 상대방 닉네임 표시 */}
                 {/* currentChannel이 1:1 채널이고 currentUser가 있다면 상대방 정보 표시 */}
                 {/* isGroupChannel 속성이 함수인지 확인하고 호출하도록 수정 (린터 오류 해결) */}
                 {(currentChannel as any).isGroupChannel && (currentChannel as any).isGroupChannel() && currentChannel.memberCount === 2 && currentChannel.members && sbInstance.current?.currentUser ?
                   currentChannel.members.find(member => member.userId !== sbInstance.current?.currentUser?.userId)?.nickname || currentChannel.name || currentChannel.url // 타입 캐스팅
                   : currentChannel.name || currentChannel.url // 1:1 채널이 아니거나 사용자 정보 없으면 채널 이름/URL 표시
                 }
              </div>
              <button className="exit-btn" onClick={handleExitClick}>
                나가기
              </button>
            </div>

            <div className="chat-messages">
              {/* Sendbird 메시지 객체를 사용하여 메시지 표시 */}
              {/* currentChannel?.url이 안전하게 접근되도록 합니다. */}
              {/* messagesByUser[currentChannel.url]가 undefined일 수 있으므로 ?. 연산자 사용 */}
              {messagesByUser[currentChannel.url]?.map(
                (msg, index) =>
                  // msg.hidden 상태를 직접 사용
                  !msg.hidden && (
                    <div
                      key={msg.messageId || index} // Sendbird 메시지 ID 또는 인덱스를 key로 사용
                      className={`message-row ${msg.sender === currentUser ? 'me' : 'you'}`} // msg.sender (Sendbird User ID)와 currentUser (본인 Sendbird User ID) 비교
                    >
                      {/* msg.sender (Sendbird User ID)와 현재 로그인 사용자 ID 비교하여 프로필 이미지 표시 */}
                      {/* 메시지 보낸 사람이 현재 사용자가 아닐 때만 프로필 이미지 표시 */}
                      {(msg.sender !== currentUser) && (
                        <img
                          src={/* TODO: 상대방 프로필 이미지 URL (채널 멤버 정보에서 가져와야 함) */ 'profile-placeholder.jpg'}
                          alt="상대방"
                          className="profile-icon"
                        />
                      )}
                      <div
                        className={`message ${msg.sender === currentUser ? 'me-message' : 'you-message'}`} // msg.sender (Sendbird User ID)와 currentUser (본인 Sendbird User ID) 비교
                      >
                        {/* ChatMessage 타입은 message 속성이 string이므로 바로 사용 */}
                        {/* 메시지 내용이 있을 때만 split */}
                        {msg.message?.split("\n").map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}

                        {/* msg.paymentInfo 존재 여부로 결제 카드 표시 */}
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

                            {/* msg.isPaymentFormVisible 및 msg.isPaymentComplete 상태 사용 */}
                            {!msg.isPaymentFormVisible &&
                              !msg.isPaymentComplete && (
                                <button
                                  onClick={() => togglePaymentForm(msg.messageId)} // 메시지 ID 전달
                                  className="payment-btn"
                                >
                                  결제하기
                                </button>
                              )}

                            {msg.isPaymentFormVisible && (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handlePaymentSubmit(msg.messageId); // 메시지 ID 전달
                                }}
                                className="payment-form"
                              >
                                <input
                                  type="text"
                                  placeholder="카드 번호 12자리"
                                  value={cardNumber}
                                  onChange={(e) =>
                                    setCardNumber(e.target.value)
                                  }
                                  maxLength={12}
                                />
                                <button type="submit">결제 완료</button>
                              </form>
                            )}

                            {msg.isPaymentComplete && (
                              <p>결제가 완료되었습니다.</p>
                            )}
                          </div>

                          {!msg.isPaymentFormVisible &&
                            !msg.isPaymentComplete && (
                              <button
                                onClick={() => togglePaymentForm(index)}
                                className="payment-btn"
                                disabled={isPaymentCompleted}
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
                ) : null
              )}
              {/* 메시지 목록이 비어 있을 경우 메시지 표시 */}
              {messagesByUser[currentChannel.url]?.length === 0 && <p>메시지가 없습니다.</p>} {/* currentChannel.url 안전하게 사용 */}
            </div>

            <div className="chat-action-bar">
              <button
                onClick={handleSecurePaymentRequest}
                className="secure-payment-btn"
                disabled={isPaymentCompleted}
              >
                안전결제 요청
              </button>
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
