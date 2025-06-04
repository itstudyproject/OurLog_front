import React, { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ChatPage.css";
import { getToken } from "../utils/auth";
import SendbirdChat from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule, GroupChannel, GroupChannelListQuery, PublicGroupChannelListQuery, MessageCollection, MessageCollectionInitPolicy, MessageCollectionEventHandler, GroupChannelEventContext, MessageFilter } from '@sendbird/chat/groupChannel';
import { PushTriggerOption } from '@sendbird/chat'; // PushTriggerOption을 @sendbird/chat에서 import
import { UserMessage, BaseMessage, MessageListParams, UserMessageCreateParams, UserMessageUpdateParams } from '@sendbird/chat/message';
import { OpenChannelModule } from '@sendbird/chat/openChannel';
import { BaseChannel } from '@sendbird/chat';
import { User } from '@sendbird/chat';

// UserProfileDTO 타입을 profileApi.ts에서 가져옵니다.
import { UserProfileDTO, fetchProfile } from "../hooks/profileApi"; // Import fetchProfile and UserProfileDTO


// Sendbird SDK v4 인스턴스 타입을 정확히 선언합니다.
// 초기화 시 사용된 모듈 타입을 포함하여 선언합니다.
// SendbirdChat.init의 반환 타입은 초기화 시 전달된 모듈에 따라 동적으로 결정됩니다.
// 명시적인 타입 정의를 통해 타입 안전성을 확보합니다.
// SendbirdChat 인스턴스 자체에 createApplicationUserListQuery가 있습니다.
type SendbirdChatInstanceType = SendbirdChat & {
  groupChannel: GroupChannelModule;
  openChannel: OpenChannelModule;
  createApplicationUserListQuery: (params?: any) => any; // UserListQuery 대신 any 사용
  // ✅ SDK v4에서 deleteChannel은 SendbirdChat 인스턴스 자체에 있습니다.
  deleteChannel: (channelUrl: string) => Promise<void>; // <-- 이 라인을 유지하고 sbInstance.current에서 직접 호출합니다.
};

interface ChatMessage {
  sender: string;
  receiver?: string;
  message: string;
  paymentInfo?: {
    itemImage: string;
    itemName: string;
    price: number;
  };
  isPaymentFormVisible?: boolean;
  hidden?: boolean;
  isPaymentComplete?: boolean;
  messageId?: number; // Sendbird messageId는 number 또는 string일 수 있습니다.
  createdAt?: number;
  messageType?: string;
  customType?: string;
  data?: string;
}

const APP_ID = 'C13DF699-49C2-474D-A2B4-341FBEB354EE';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSendbirdInitialized, setIsSendbirdInitialized] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [channels, setChannels] = useState<GroupChannel[]>([]);

  // ✅ URL state에서 전달받은 targetUserId를 저장할 상태 추가
  const [initialTargetUserId, setInitialTargetUserId] = useState<string | null>(null);

  // 공개 채널 목록 상태 추가
  const [publicChannels, setPublicChannels] = useState<GroupChannel[]>([]);
  const [publicChannelsLoading, setPublicChannelsLoading] = useState(false);
  const [publicChannelsError, setPublicChannelsError] = useState<string | null>(null);

  // 채널 생성 모달 상태 추가
  const [isCreateChannelModalVisible, setIsCreateChannelModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  // ✅ 사이드 메뉴 가시성 관리를 위한 상태 추가 (열려있는 채널 URL 저장)
  const [openMenuChannelUrl, setOpenMenuChannelUrl] = useState<string | null>(null);

  // ✅ 메뉴 위치 상태 추가 (이전 단계에서 복원됨)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // ✅ 보류 중인 채널 작업 상태 추가 (삭제, 나가기, 이름 변경 등)
  const [pendingAction, setPendingAction] = useState<{
    channelUrl: string;
    type: 'leave' | 'delete' | 'rename';
    newName?: string; // 이름 변경 시 사용
  } | null>(null);


  const [currentChannel, setCurrentChannel] = useState<GroupChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchedUserId, setSearchedUserId] = useState<string>("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 사용자 ID별 프로필 정보를 저장할 상태 추가
  const [userProfiles, setUserProfiles] = useState<{ [userId: string]: UserProfileDTO }>({});

  // ✅ 인앱 알림 상태 추가
  const [showChatNotification, setShowChatNotification] = useState(false);
  const [chatNotification, setChatNotification] = useState<{
      senderId: string;
      senderNickname: string;
      senderProfileImage: string;
      message: string;
      channelUrl: string;
      channelName: string;
  } | null>(null);


  const channelHandlerId = useRef<string>(`CHANNEL_HANDLER_ID_${Date.now()}`).current;

  const sbInstance = useRef<SendbirdChatInstanceType | null>(null);

  // MessageCollection 인스턴스를 관리할 useRef 추가 (채널별로 관리할 수도 있습니다)
  // 여기서는 현재 채널의 MessageCollection을 저장하도록 합니다.
  const messageCollectionRef = useRef<MessageCollection | null>(null); // Change type to MessageCollection

  if (typeof global === "undefined") {
    (window as any).global = window;
  }

  const fetchSendbirdAuthInfo = async () => {
    console.log("fetchSendbirdAuthInfo called...");
    const tokenWithPrefix = getToken();

    if (!tokenWithPrefix) {
      console.error("JWT token not found. Cannot fetch Sendbird auth info.");
      navigate('/login');
      return null;
    }

    const token = tokenWithPrefix.startsWith('Bearer ') ? tokenWithPrefix.substring(7) : tokenWithPrefix;
    console.log("Extracted token for backend:", token);

    try {
      console.log("Fetching Sendbird auth info from backend...");
      const response = await fetch('http://localhost:8080/ourlog/chat/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': crypto.randomUUID(),
        },
      });

      if (!response.ok) {
        const errorData = response.headers.get('Content-Type')?.includes('application/json')
          ? await response.json()
          : { message: await response.text(), error: response.statusText };

        console.error("Failed to fetch Sendbird auth info:", response.status, errorData);
        const errorMessage = errorData.message || errorData.error || response.statusText || `HTTP error! status: ${response.status}`;
        throw new Error(`Failed to fetch Sendbird auth info: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Received Sendbird auth info:", data);

      if (!data.accessToken) {
        throw new Error("Sendbird accessToken not received from backend.");
      }

      const userString = localStorage.getItem("user");
      let backendUserId: string | null = null;
      if (userString) {
        try {
          const user = JSON.parse(userString);
          // 백엔드 userId는 숫자이지만, Sendbird userId는 문자열로 사용하므로 변환
          backendUserId = String(user.userId);
        } catch (e) {
          console.error("Failed to parse user info from localStorage for userId", e);
        }
      }

      if (!backendUserId) {
        throw new Error("Could not determine Sendbird User ID (backend userId).");
      }

      return {
        userId: backendUserId,
        sendbirdAccessToken: data.accessToken,
      };

    } catch (e: any) {
      console.error("Error fetching Sendbird auth info:", e);
      setError(`채팅 시스템 초기화 실패: ${e.message || '알 수 없는 오류 발생'}`);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const initializeAndConnectSendbird = async () => {
      setLoading(true);
      setError(null);

      const userInfo = await fetchSendbirdAuthInfo();

      if (!userInfo || !userInfo.userId || !userInfo.sendbirdAccessToken) {
        setLoading(false);
        return;
      }

      try {
        console.log('Initializing Sendbird SDK (v4)');
        const sendbirdChatInstance = await SendbirdChat.init({
          appId: APP_ID,
          modules: [new GroupChannelModule(), new OpenChannelModule()],
        });
        sbInstance.current = sendbirdChatInstance as SendbirdChatInstanceType;

        console.log('Sendbird SDK initialized successfully. Connecting...');
        const user = await sbInstance.current.connect(userInfo.userId, userInfo.sendbirdAccessToken);
        console.log('Sendbird connection successful:', user);
        setCurrentUser(user);

        setIsSendbirdInitialized(true);

        // ✅ Sendbird 연결 성공 후 알림 권한 요청
        if ('Notification' in window && Notification.permission !== 'granted') {
            console.log('Requesting notification permission...');
            Notification.requestPermission().then(permission => {
                console.log('Notification permission status:', permission);
            });
        }

        console.log('Fetching channel list');
        const channelListQuery: GroupChannelListQuery = sbInstance.current.groupChannel.createMyGroupChannelListQuery({
          limit: 100,
        });

        const channels = await channelListQuery.next();
        console.log('Fetched channels:', channels);
        setChannels(channels);

        // 채널 목록 로드 후 각 채널의 상대방 프로필 정보를 가져옵니다.
        const profilePromises = channels.map(async channel => {
          // ✅ channel.isGroupChannel() 함수 호출
          if (channel.isGroupChannel() && (channel as GroupChannel).members && user) {
            const groupChannel = channel as GroupChannel; // Cast to GroupChannel
            if (groupChannel.memberCount === 2) {
              const otherUser = groupChannel.members.find(member => member.userId !== user.userId);
              if (otherUser) {
                try {
                  // Sendbird userId는 문자열이지만, 백엔드 fetchProfile 함수는 숫자를 기대할 수 있으므로 변환 필요
                  // UserProfileDTO의 userId 타입이 number | { userId: number } 이므로, fetchProfile은 number를 받아야 함
                  const backendUserId = parseInt(otherUser.userId, 10);
                  if (!isNaN(backendUserId)) {
                    const profile = await fetchProfile(backendUserId);
                    return { userId: otherUser.userId, profile };
                  } else {
                    console.warn("Failed to parse Sendbird userId to integer for fetching profile:", otherUser.userId);
                    return null;
                  }
                } catch (profileError) {
                  console.error(`Failed to fetch profile for user ${otherUser.userId}:`, profileError);
                  return null;
                }
              }
            }
          }
          return null;
        });

        const fetchedProfiles = await Promise.all(profilePromises.filter(p => p !== null)); // Filter out nulls before Promise.all
        const profilesMap: { [userId: string]: UserProfileDTO } = {};
        fetchedProfiles.forEach(item => {
          if (item) {
            profilesMap[item.userId] = item.profile;
          }
        });
        setUserProfiles(profilesMap);


        console.log('Adding Sendbird channel handler');
        const channelHandler = new GroupChannelHandler({
          onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
            console.log('Message received:', channel, message);
            // ✅ channel.isGroupChannel() 함수 호출
            if (channel.isGroupChannel()) {
              const groupChannel = channel as GroupChannel;
              if (message.messageType === 'user') {
                const userMessage = message as UserMessage;

                console.log(`[${groupChannel.url}] onMessageReceived: 새 메시지 수신 - ${userMessage.messageId}`, userMessage);

                const formattedMessage: ChatMessage = {
                  sender: userMessage.sender?.userId || 'Unknown',
                  message: userMessage.message,
                  messageId: userMessage.messageId,
                  createdAt: userMessage.createdAt,
                  messageType: userMessage.messageType,
                  customType: userMessage.customType,
                  data: userMessage.data,
                };

                try {
                  if (userMessage.customType === 'payment_request' && userMessage.data) {
                    const customData = JSON.parse(userMessage.data);
                    if (customData.paymentInfo) {
                      formattedMessage.paymentInfo = customData.paymentInfo;
                    }
                    if (customData.isPaymentComplete !== undefined) {
                      formattedMessage.isPaymentComplete = customData.isPaymentComplete;
                    }
                    if (customData.isPaymentFormVisible !== undefined) {
                      formattedMessage.isPaymentFormVisible = customData.isPaymentFormVisible;
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse message data:", e);
                }

                // ✅ 새 메시지 수신 시 브라우저 알림 표시 로직 추가
                // 현재 사용자가 보낸 메시지가 아니고, 알림 권한이 허용되었으며, 현재 채널이 수신된 메시지의 채널이 아닌 경우
                // if (userMessage.sender?.userId !== currentUser?.userId && Notification.permission === 'granted' && currentChannel?.url !== groupChannel.url) {
                //    const senderNickname = userProfiles[userMessage.sender?.userId || '']?.nickname || userMessage.sender?.nickname || userMessage.sender?.userId || '알 수 없는 사용자';
                //    const notificationTitle = `${senderNickname} (${groupChannel.name || '새 메시지'})`;
                //    const notificationBody = userMessage.message;

                //    try {
                //        const notification = new Notification(notificationTitle, {
                //            body: notificationBody,
                //            // icon: userProfiles[userMessage.sender?.userId || '']?.thumbnailImagePath || userMessage.sender?.profileUrl || '/profile-placeholder.jpg', // 상대방 프로필 이미지
                //            // 클릭 시 해당 채널로 이동하는 로직은 추가 구현 필요
                //        });

                //        // 알림 클릭 시 이벤트 리스너 (선택 사항)
                //        // notification.onclick = () => {
                //        //   // TODO: 해당 채널로 이동하는 로직 구현
                //        //   // window.focus(); // 브라우저 창 활성화
                //        //   // navigate('/chat', { state: { channelUrl: groupChannel.url } }); // 예시: 채널 URL을 state로 전달하여 페이지 이동
                //        // };

                //    } catch (e) {
                //        console.error("Failed to show browser notification:", e);
                //    }
                // } else {
                //     console.log("Notification conditions not met:", {
                //         isSenderCurrentUser: userMessage.sender?.userId === currentUser?.userId,
                //         notificationPermission: Notification.permission,
                //         isCurrentChannelSame: currentChannel?.url === groupChannel.url,
                //         channelUrl: groupChannel.url,
                //         currentChannelUrl: currentChannel?.url
                //     });
                // }

                // ✅ 인앱 알림 표시 로직으로 대체
                if (userMessage.sender?.userId !== currentUser?.userId && currentChannel?.url !== groupChannel.url) {
                    const senderProfile = userProfiles[userMessage.sender?.userId || ''];
                    const senderNickname = senderProfile?.nickname || userMessage.sender?.nickname || userMessage.sender?.userId || '알 수 없는 사용자';
                    const channelName = groupChannel.name || '새 메시지';

                    setChatNotification({
                        senderId: userMessage.sender?.userId || 'Unknown',
                        senderNickname: senderNickname,
                        senderProfileImage: senderProfile?.thumbnailImagePath || userMessage.sender?.profileUrl || '/profile-placeholder.jpg',
                        message: userMessage.message,
                        channelUrl: groupChannel.url,
                        channelName: channelName,
                    });
                    setShowChatNotification(true);

                    // 5초 후 알림 숨기기
                    setTimeout(() => {
                        setShowChatNotification(false);
                    }, 5000);
                }

              } else {
                console.log(`Received non-user message of type: ${message.messageType}`);
                const formattedMessage: ChatMessage = {
                  sender: 'System',
                  message: message.message || `[${message.messageType}] System message`,
                  messageId: message.messageId,
                  createdAt: message.createdAt,
                  messageType: message.messageType,
                  customType: message.customType,
                  data: message.data,
                };
              }
            } else {
              console.warn("Received message from a non-group channel:", channel);
            }
          },
          onChannelChanged: (channel: BaseChannel) => {
            console.log('Channel changed:', channel);
            // ✅ channel.isGroupChannel() 함수 호출
            if (channel.isGroupChannel()) {
              const groupChannel = channel as GroupChannel;
              // ✅ 채널 목록 상태를 업데이트하여 UI에 반영 (예: 알림 상태 변경)
              setChannels(prevChannels => prevChannels.map(ch => ch.url === channel.url ? groupChannel : ch));
              if (groupChannel.memberCount === 2 && groupChannel.members && currentUser) {
                const otherUser = groupChannel.members.find(member => member.userId !== currentUser.userId);
                if (otherUser && !userProfiles[otherUser.userId]) {
                  const backendUserId = parseInt(otherUser.userId, 10);
                  if (!isNaN(backendUserId)) {
                    fetchProfile(backendUserId)
                      .then(profile => setUserProfiles(prev => ({ ...prev, [otherUser.userId]: profile })))
                      .catch(profileError => console.error(`Failed to fetch profile for user ${otherUser.userId} on channel change:`, profileError));
                  }
                }
              }
            }
          },
          onChannelDeleted: (channelUrl: string, channelType: string) => {
            console.log(`Channel deleted: ${channelUrl} (${channelType})`);
            setChannels(prevChannels => prevChannels.filter(ch => ch.url !== channelUrl));
            if (currentChannel?.url === channelUrl) {
              handleExitClick(); // MessageCollection dispose 및 모달 상태 초기화 포함
            }
            // ✅ 삭제된 채널의 사이드 메뉴가 열려있었다면 닫기 및 보류 작업 취소
            if (openMenuChannelUrl === channelUrl) {
              setOpenMenuChannelUrl(null);
            }
            if (pendingAction?.channelUrl === channelUrl) {
              setPendingAction(null); // 보류 작업 취소
            }
          },
          onMessageUpdated: (channel: BaseChannel, message: BaseMessage) => {
            console.log('Message updated:', channel, message);
            // ✅ channel.isGroupChannel() 함수 호출
            if (channel.isGroupChannel()) {
              const groupChannel = channel as GroupChannel;
              if (message.messageType === 'user') {
                const userMessage = message as UserMessage;

                console.log(`[${groupChannel.url}] onMessageUpdated: 메시지 업데이트 - ${userMessage.messageId}`, userMessage);

                const formattedUpdatedMsg: ChatMessage = {
                  sender: userMessage.sender?.userId || 'Unknown',
                  message: userMessage.message,
                  messageId: userMessage.messageId,
                  createdAt: userMessage.createdAt,
                  messageType: userMessage.messageType,
                  customType: userMessage.customType,
                  data: message.data,
                };

                try {
                  if (userMessage.customType === 'payment_request' && userMessage.data) {
                    const customData = JSON.parse(userMessage.data);
                    if (customData.paymentInfo) {
                      formattedUpdatedMsg.paymentInfo = customData.paymentInfo;
                    }
                    if (customData.isPaymentComplete !== undefined) {
                      formattedUpdatedMsg.isPaymentComplete = customData.isPaymentComplete;
                    }
                    if (customData.isPaymentFormVisible !== undefined) {
                      formattedUpdatedMsg.isPaymentFormVisible = customData.isPaymentFormVisible;
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse updated message data in handler:", e);
                }

              }
            }
          }
        });

        if (sbInstance.current) {
          sbInstance.current.groupChannel.addGroupChannelHandler(channelHandlerId, channelHandler);
          console.log('Sendbird channel handler added with ID:', channelHandlerId);
        }

      } catch (error: any) {
        console.error('Sendbird initialization or connection failed:', error);
        setError(`채팅 시스템 초기화 실패: ${error.message || '알 수 없는 오류 발생'}`);
      } finally {
        setLoading(false);
      }
    };

    initializeAndConnectSendbird();

    return () => {
      console.log("ChatPage unmounting. Cleaning up Sendbird.");
      if (sbInstance.current) {
        sbInstance.current.groupChannel.removeGroupChannelHandler(channelHandlerId);
        console.log('Sendbird channel handler removed with ID:', channelHandlerId);

        if (typeof sbInstance.current.disconnect === 'function') {
          console.log("Disconnecting from Sendbird");
          sbInstance.current.disconnect();
          console.log("Sendbird disconnected.");
        } else {
          console.warn("Sendbird disconnect method not found on sbInstance.current.");
        }
      }
      if (messageCollectionRef.current) {
        messageCollectionRef.current.dispose();
        messageCollectionRef.current = null;
        console.log("MessageCollection disposed on unmount.");
      }
      // 컴포넌트 언마운트 시 document 이벤트 리스너 제거 (메뉴 닫기 핸들러)
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [navigate, location]);

  // ✅ 컴포넌트 마운트 시 location.state에서 targetUserId를 읽어와 상태에 저장하고 state 초기화
  useEffect(() => {
    const state = location.state as { targetUserId?: string } | undefined;
    if (state?.targetUserId) {
      console.log(`Detected targetUserId in state: ${state.targetUserId}. Setting initialTargetUserId state.`);
      setInitialTargetUserId(state.targetUserId);
      // state 사용 후 초기화하여 새로고침 시 중복 실행 방지
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      console.log("No targetUserId found in location state on mount.");
      setInitialTargetUserId(null); // 혹시 모를 잔여 상태 초기화
    }
    // 이 useEffect는 컴포넌트 마운트 시 한 번만 실행되도록 의존성 배열을 비웁니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // location, navigate는 내부적으로 안정적이므로 의존성에 추가하지 않아도 됩니다.

  // ✅ Sendbird 초기화 및 사용자 연결 상태, 그리고 initialTargetUserId 상태 변경 감지 후 채팅 시작
  useEffect(() => {
    console.log("Checking conditions for starting chat from initialTargetUserId state...");
    console.log("initialTargetUserId:", initialTargetUserId);
    console.log("isSendbirdInitialized:", isSendbirdInitialized);
    console.log("currentUser:", currentUser);

    if (isSendbirdInitialized && currentUser && initialTargetUserId) {
      console.log(`Conditions met: isSendbirdInitialized=${isSendbirdInitialized}, currentUser=${!!currentUser}, initialTargetUserId=${initialTargetUserId}. Attempting to start chat.`);
      handleStartNewChat(initialTargetUserId);
      // 채팅 시작 후 initialTargetUserId 상태 초기화하여 중복 실행 방지
      setInitialTargetUserId(null);
    } else {
      console.log("Conditions not met for starting chat from initialTargetUserId state.", { isSendbirdInitialized, currentUser: !!currentUser, initialTargetUserId });
    }

  }, [isSendbirdInitialized, currentUser, initialTargetUserId]); // 의존성 배열에 상태들 추가 (navigate, location.state 불필요)

  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      // ✅ currentChannel이 GroupChannel인지 확인 후 members 속성 접근
      if (currentChannel?.isGroupChannel() && (currentChannel as GroupChannel).members && currentUser) {
        const groupChannel = currentChannel as GroupChannel;
        if (groupChannel.memberCount === 2) {
          const otherUser = groupChannel.members.find(member => member.userId !== currentUser.userId);
          if (otherUser && !userProfiles[otherUser.userId]) {
            try {
              const backendUserId = parseInt(otherUser.userId, 10);
              if (!isNaN(backendUserId)) {
                const profile = await fetchProfile(backendUserId);
                setUserProfiles(prev => ({ ...prev, [otherUser.userId]: profile }));
              } else {
                console.warn("Failed to parse Sendbird userId to integer for fetching profile:", otherUser.userId);
              }
            } catch (profileError) {
              console.error(`Failed to fetch profile for user ${otherUser.userId}:`, profileError);
            }
          }
        }
      }
    };
    fetchOtherUserProfile();
  }, [currentChannel, currentUser, userProfiles]);

  useEffect(() => {
    const fetchPublicChannels = async () => {
      if (!isSendbirdInitialized || !sbInstance.current) {
        return;
      }

      setPublicChannelsLoading(true);
      setPublicChannelsError(null);

      try {
        console.log("Fetching public group channels...");
        const publicChannelListQuery: PublicGroupChannelListQuery = sbInstance.current.groupChannel.createPublicGroupChannelListQuery({
          limit: 20,
          includeEmpty: true,
        });

        const channels = await publicChannelListQuery.next();
        console.log("Fetched public channels:", channels);
        setPublicChannels(channels);

      } catch (e: any) {
        console.error("Failed to fetch public channels:", e);
        setPublicChannelsError(`공개 채널 목록 로딩 실패: ${e.message || '알 수 없는 오류'}`);
      } finally {
        setPublicChannelsLoading(false);
      }
    };

    if (isSendbirdInitialized) {
      fetchPublicChannels();
    }


  }, [isSendbirdInitialized]);


  const handleOpenChatModal = async (channelUrl: string): Promise<void> => {
    console.log("채널 선택:", channelUrl);
    if (sbInstance.current) {
      try {
        const channel: GroupChannel = await sbInstance.current.groupChannel.getChannel(channelUrl);
        console.log('Selected channel:', channel);

        if (messageCollectionRef.current) {
          messageCollectionRef.current.dispose();
          messageCollectionRef.current = null;
          console.log("Previous MessageCollection disposed.");
        }

        setCurrentChannel(channel);
        setIsChatModalVisible(true);
        // ✅ 채팅 모달 열 때 사이드 메뉴 닫기 및 보류 작업 취소
        setOpenMenuChannelUrl(null);
        setPendingAction(null); // 보류 작업 취소


        console.log('Initializing MessageCollection for channel:', channelUrl);

        const collection = channel.createMessageCollection({
          limit: 100,
          startingPoint: 0,   // 또는 0으로 전체 로드
        });

        return new Promise<void>((resolve, reject) => {

          const collectionHandler: MessageCollectionEventHandler = {
            onMessagesAdded: (context, channel, messages) => {
              console.log(`[${channel.url}] MessageCollection: Messages added`, messages);
              const formattedMessages = messages.map(msg => {
                const baseMessage: ChatMessage = {
                  sender: (msg as UserMessage).sender?.userId || 'Unknown',
                  message: (msg as UserMessage).message || '',
                  messageId: msg.messageId,
                  createdAt: msg.createdAt,
                  messageType: msg.messageType,
                  customType: msg.customType,
                  data: msg.data,
                };
                try {
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
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse message data in collection handler:", e);
                }
                return baseMessage;
              });

              setMessagesByUser(prev => ({
                ...prev,
                [channel.url]: [...(prev[channel.url] || []), ...formattedMessages].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
              }));
              console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에 추가 완료.`, messagesByUser);
            },
            onMessagesUpdated: (context, channel, messages) => {
              console.log(`[${channel.url}] MessageCollection: Messages updated`, messages);
              const formattedMessages = messages.map(msg => {
                const baseMessage: ChatMessage = {
                  sender: (msg as UserMessage).sender?.userId || 'Unknown',
                  message: (msg as UserMessage).message || '',
                  messageId: msg.messageId,
                  createdAt: msg.createdAt,
                  messageType: msg.messageType,
                  customType: msg.customType,
                  data: msg.data,
                };
                try {
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
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse updated message data in collection handler:", e);
                }
                return baseMessage;
              });


              setMessagesByUser(prev => ({
                ...prev,
                [channel.url]: (prev[channel.url] || []).map(msg => {
                  const updatedMsg = formattedMessages.find(updated => updated.messageId === msg.messageId);
                  return updatedMsg ? updatedMsg : msg;
                }),
              }));
              console.log(`[${channel.url}] MessageCollection: messagesByUser 상태 업데이트 완료.`, messagesByUser);
            },
            onMessagesDeleted: (context, channel, messageIds) => {
              console.log(`[${channel.url}] MessageCollection: Messages deleted`, messageIds);
              setMessagesByUser(prev => ({
                ...prev,
                [channel.url]: (prev[channel.url] || []).filter(msg => {
                  const messageIdToRemove = msg.messageId!;
                  return !messageIds.map(String).includes(String(messageIdToRemove));
                }),
              }));
              console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에서 삭제 완료.`, messagesByUser);
            },
            onChannelUpdated: (context: GroupChannelEventContext, channel: GroupChannel) => {
              console.log(`[${channel.url}] MessageCollection: Channel updated`, channel);
              setChannels(prevChannels => prevChannels.map(ch => ch.url === channel.url ? channel : ch));
              // ✅ 채널 이름이 변경되었다면 UI에도 반영되도록 추가 처리 (channels 상태 업데이트로 자동 반영됨)
            },
            onChannelDeleted: (context: GroupChannelEventContext, channelUrl: string) => {
              console.log(`[${channelUrl}] MessageCollection: Channel deleted`, channelUrl);
            }
          };

          collection.setMessageCollectionHandler(collectionHandler);

          collection.initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
            .onCacheResult((messages, error) => {
              console.log(`[${channel.url}] MessageCollection: Initial messages from cache`, messages, error);
              if (Array.isArray(messages) && messages.length > 0) {
                const formattedMessages = messages.map(msg => {
                  const baseMessage: ChatMessage = {
                    sender: (msg as UserMessage).sender?.userId || 'Unknown',
                    message: (msg as UserMessage).message || '',
                    messageId: msg.messageId,
                    createdAt: msg.createdAt,
                    messageType: msg.messageType,
                    customType: msg.customType,
                    data: msg.data,
                  };
                  try {
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
                      }
                    } else if (msg.customType === 'system_message') {
                      // 시스템 메시지 처리 로직 추가 (필요하다면)
                      console.log("Received system message:", msg.message);
                    }
                  } catch (e) {
                    console.error("Failed to parse cached message data:", e);
                  }
                  return baseMessage;
                });
                setMessagesByUser(prev => ({ ...prev, [channel.url]: formattedMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)) }));
                console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에 캐시 메시지 설정 완료.`, messagesByUser);
              } else if (Array.isArray(messages)) { // 캐시 결과가 없거나 비어있는 경우에도 상태를 초기화합니다.
                setMessagesByUser(prev => ({ ...prev, [channel.url]: [] }));
                console.log(`[${channel.url}] MessageCollection: 캐시 메시지 없음 또는 비어있음. 상태 초기화.`, messagesByUser);
              }
            })
            .onApiResult((messages, error) => {
              // ✅ API 결과로 받은 메시지 목록과 error 매개변수를 출력하는 로그 추가
              console.log(`[${channel.url}] MessageCollection: Initial API load result - messages:`, messages, "error:", error);

              // ✅ 오류 판단 로직 개선: error가 실제 Sendbird 오류 객체 형태인지 확인.
              // Sendbird 오류 객체는 일반적으로 code(number)와 message(string) 속성을 가집니다.
              const isSendbirdError = (err: any): boolean => {
                return typeof err === 'object' && err !== null && typeof err.code === 'number' && typeof err.message === 'string';
              };

              if (error && isSendbirdError(error)) { // error가 존재하고 실제 Sendbird 오류 객체 형태인 경우
                console.error(`[${channel.url}] MessageCollection: Initial API load failed with Sendbird Error. Rejecting Promise.`, error);
                reject(error); // 실제 오류이므로 Promise reject
              } else { // 실제 Sendbird 오류가 아닌 경우 (메시지 목록이 error로 온 경우 포함)
                let apiMessages: BaseMessage[] = []; // API 결과를 저장할 배열 초기화

                if (Array.isArray(messages) && messages.length > 0) {
                  // 메시지 목록이 messages 매개변수에 정상적으로 전달된 경우
                  console.log(`[${channel.url}] MessageCollection: API loaded messages found in messages parameter.`, messages);
                  // messages를 BaseMessage 배열로 타입 단언하여 사용
                  apiMessages = messages as BaseMessage[];
                } else if (messages === null && Array.isArray(error)) {
                  // messages가 null이고 error가 배열인 경우 (Sendbird 버그 가능성)
                  // error가 메시지 목록일 가능성이 높다고 판단 (로그에서 확인된 패턴 기반)
                  // error 배열의 첫 번째 요소가 메시지 객체의 형태인지 추가 확인
                  const looksLikeMessage = error.length > 0 &&
                    typeof (error[0] as any)?.messageId !== 'undefined' &&
                    typeof (error[0] as any)?.message !== 'undefined';

                  if (looksLikeMessage) {
                    console.log(`[${channel.url}] MessageCollection: API loaded messages found in error parameter. Using error as messages.`, error);
                    // error를 BaseMessage 배열로 타입 단언하여 사용
                    apiMessages = error as BaseMessage[];
                  } else if (error.length > 0) {
                    // error가 배열이지만 메시지 형태가 아닌 다른 정보일 경우 (예: 사용자 목록)
                    console.info(`[${channel.url}] MessageCollection: onApiResult received non-message array in error parameter. Ignoring as messages.`, error);
                  }
                } else if (messages !== null && !Array.isArray(messages)) {
                  // messages 매개변수가 null도 아니고 배열도 아닌 경우 (예상치 못한 상황)
                  console.warn(`[${channel.url}] MessageCollection: Initial API load result messages parameter is not an array or null.`, messages);
                }
                // messages 배열이 비어있는 경우는 apiMessages가 빈 배열로 유지됨.

                // ✅ apiMessages 배열이 유효하다면 onMessagesAdded와 유사하게 상태 업데이트를 시도
                if (apiMessages.length > 0) {
                  console.log(`[${channel.url}] MessageCollection: Processing API loaded messages (${apiMessages.length} messages). Manually adding to state.`);
                  const formattedMessages = apiMessages.map(msg => {
                    const baseMessage: ChatMessage = {
                      sender: (msg as UserMessage).sender?.userId || 'Unknown',
                      message: (msg as UserMessage).message || '',
                      messageId: msg.messageId,
                      createdAt: msg.createdAt,
                      messageType: msg.messageType,
                      customType: msg.customType,
                      data: msg.data,
                    };
                    try {
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
                        }
                      } else if (msg.customType === 'system_message') {
                        // 시스템 메시지 처리 로직 추가 (필요하다면)
                        console.log("Received system message:", msg.message);
                      }
                    } catch (e) {
                      console.error("Failed to parse API loaded message data:", e);
                    }
                    return baseMessage;
                  });
                  // 기존 메시지 위에 API 로드 메시지를 추가/정렬 (onMessagesAdded와 동일하게 처리)
                  // onCacheResult에서 이미 메시지를 설정했을 수 있으므로, 기존 메시지와 합쳐서 중복 제거 및 정렬
                  setMessagesByUser(prev => {
                    const existingMessages = prev[channel.url] || [];
                    const allMessages = [...existingMessages, ...formattedMessages];
                    // messageId를 기준으로 중복 제거 (고유한 메시지만 남김)
                    const uniqueMessages = Array.from(new Map(allMessages.map(item => [item.messageId, item])).values());
                    // 생성 시간 순으로 정렬
                    return { ...prev, [channel.url]: uniqueMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)) };
                  });
                  console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에 API 로드 메시지 추가/업데이트 및 정렬 완료.`);

                } else { // apiMessages 배열이 비어있는 경우
                  console.log(`[${channel.url}] MessageCollection: Initial API load resulted in no messages.`);
                }


                resolve(); // 실제 오류가 아니므로 Promise resolve.
              }
            });

          messageCollectionRef.current = collection;

        });

      } catch (err: any) {
        console.error('handleOpenChatModal failed to get channel or initialize MessageCollection:', err);
        const errorMessage = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || '알 수 없는 오류';
        setError(`채널 메시지 로딩 실패: ${errorMessage}`);
        if (messageCollectionRef.current) {
          messageCollectionRef.current.dispose();
          messageCollectionRef.current = null;
          console.log("MessageCollection disposed due to error.");
        }
        // Promise를 reject하여 handleStartNewChat의 catch 블록으로 오류 전달
        throw err; // 오류를 다시 던져서 상위 catch에서 처리되게 함
      }
    } else {
      console.error('Sendbird SDK not initialized.');
      setError('채팅 시스템이 초기화되지 않았습니다.');
    }
  };

  const fetchPublicChannelsList = async () => {
    if (!isSendbirdInitialized || !sbInstance.current) {
      return;
    }

    setPublicChannelsLoading(true);
    setPublicChannelsError(null);

    try {
      console.log("Refetching public group channels...");
      const publicChannelListQuery: PublicGroupChannelListQuery = sbInstance.current.groupChannel.createPublicGroupChannelListQuery({
        limit: 20,
        includeEmpty: true,
      });

      const channels = await publicChannelListQuery.next();
      console.log("Refetched public channels:", channels);
      setPublicChannels(channels);

    } catch (e: any) {
      console.error("Failed to refetch public channels:", e);
      setPublicChannelsError(`공개 채널 목록 로딩 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setPublicChannelsLoading(false);
    }
  };


  const handleExitClick = () => {
    console.log("Exiting chat modal. Disposing MessageCollection.");
    setIsChatModalVisible(false);
    setCurrentChannel(null);
    setCardNumber("");
    if (messageCollectionRef.current) {
      messageCollectionRef.current.dispose();
      messageCollectionRef.current = null;
      console.log("MessageCollection disposed on exiting modal.");
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentChannel || !sbInstance.current || !currentUser) return;

    const params: UserMessageCreateParams = {
      message: newMessage,
    };

    setNewMessage("");

    currentChannel.sendUserMessage(params)
      .onSucceeded((message) => {
        console.log('Message sent successfully:', message);
      })
      .onFailed((error) => {
        console.error('Message send failed:', error);
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
    if (!currentChannel || !sbInstance.current || !currentUser) return;

    const paymentInfo = {
      itemImage: "/images/파스타.jpg",
      itemName: "디지털 아트워크",
      price: 50000,
    };

    const params: UserMessageCreateParams = {
      message: "안전결제 요청이 도착했습니다.",
      customType: 'payment_request',
      data: JSON.stringify({
        paymentInfo: paymentInfo,
        isPaymentComplete: false,
        isPaymentFormVisible: false,
      }),
    };

    currentChannel.sendUserMessage(params)
      .onSucceeded((message) => {
        console.log('Payment request message sent successfully:', message);
      })
      .onFailed((error) => {
        console.error('Payment request message send failed:', error);
        setError(`안전결제 메시지 전송 실패: ${error.message || '알 수 없는 오류 발생'}`);
      });
  };

  const togglePaymentForm = async (messageId: number | undefined) => {
    if (!currentChannel || messageId === undefined || !sbInstance.current) {
      console.error("Cannot toggle payment form: Channel or SDK not ready.");
      setError("결제 폼 상태 업데이트 실패: 시스템 오류");
      return;
    }

    const messageToUpdate = messagesByUser[currentChannel!.url]?.find(msg => msg.messageId === messageId);
    if (!messageToUpdate || messageToUpdate.customType !== 'payment_request' || !messageToUpdate.data) {
      console.warn("Message not found or is not a payment request message for toggle.");
      return;
    }

    let existingData; // Declare existingData outside try block

    try {
      existingData = JSON.parse(messageToUpdate.data);
      const updatedData = {
        ...existingData,
        isPaymentFormVisible: !existingData.isPaymentFormVisible
      };

      console.log("Attempting to update message:", messageId, "with data:", updatedData);

      const updatedMessage = await currentChannel!.updateUserMessage(messageId, {
        message: messageToUpdate.message,
        customType: messageToUpdate.customType,
        data: JSON.stringify(updatedData),
      });

      console.log("Payment form visibility updated via Sendbird message update:", updatedMessage);
    } catch (error: any) {
      console.error('Failed to update payment form visibility:', error);
      setError(`결제 폼 상태 업데이트 실패: ${error.message || '알 수 없는 오류 발생'}`);
    }
  };

  const handlePaymentSubmit = async (messageId: number | undefined) => {
    if (cardNumber.length !== 12) {
      alert("카드 번호는 12자리여야 합니다."); // 이 alert는 그대로 유지
      return;
    }

    if (!currentChannel || messageId === undefined || !sbInstance.current) {
      console.error("Cannot complete payment: Channel or SDK not ready.");
      setError("결제 완료 실패: 시스템 오류");
      setCardNumber("");
      return;
    }

    const messageToComplete = messagesByUser[currentChannel.url]?.find(msg => msg.messageId === messageId);
    if (!messageToComplete || messageToComplete.customType !== 'payment_request' || !messageToComplete.data) {
      console.warn("Message not found or is not a payment request message for completion.");
      setCardNumber("");
      setError("결제 완료 실패: 유효하지 않은 메시지");
      return;
    }

    let existingData; // Declare existingData outside try block

    try {
      existingData = JSON.parse(messageToComplete.data);
      const updatedData = {
        ...existingData,
        isPaymentComplete: true,
        isPaymentFormVisible: false,
      };

      console.log("Attempting to update payment status for message:", messageId, "with data:", updatedData);

      const updatedMessage = await currentChannel.updateUserMessage(messageId, {
        message: messageToComplete.message,
        customType: messageToComplete.customType,
        data: JSON.stringify(updatedData),
      });

      console.log("Payment status updated via Sendbird message update:", updatedMessage);
      setCardNumber("");
      alert("결제가 완료되었습니다."); // 이 alert는 그대로 유지
    } catch (error: any) {
      console.error("Failed to update payment status:", error);
      setError(`결제 완료 상태 업데이트 실패: ${error.message || '알 수 없는 오류 발생'}`);
      setCardNumber("");
    }
  };

  const handleSearchUser = async () => {
    if (!searchedUserId || !sbInstance.current) {
      setSearchError("사용자 ID를 입력해주세요.");
      setFoundUser(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setFoundUser(null);

    try {
      console.log(`Searching for user with ID: ${searchedUserId}`);
      // Sendbird User ID는 문자열입니다. 검색 시에도 문자열로 전달
      const userListQuery = sbInstance.current.createApplicationUserListQuery({
        userIdsFilter: [searchedUserId],
        limit: 1,
      });

      const users = await userListQuery.next();
      console.log("Search results:", users);

      if (users && users.length > 0) {
        const foundSendbirdUser = users[0];
        // 검색된 사용자의 프로필 정보도 미리 가져와서 상태에 저장 (선택 사항)
        const backendUserId = parseInt(foundSendbirdUser.userId, 10);
        if (!isNaN(backendUserId)) {
          try {
            const profile = await fetchProfile(backendUserId);
            setUserProfiles(prev => ({ ...prev, [foundSendbirdUser.userId]: profile }));
            // Sendbird User 객체에 추가 필드를 직접 추가하는 대신,
            // Sendbird User 객체와 백엔드 프로필 정보를 함께 관리하거나
            // 필요한 정보만 합쳐서 사용할 수 있습니다. 여기서는 별도 상태에 저장
          } catch (profileError) {
            console.error(`Failed to fetch profile for found user ${foundSendbirdUser.userId}:`, profileError);
          }
        } else {
          console.warn("Failed to parse Sendbird userId to integer for fetching profile:", foundSendbirdUser.userId);
        }
        setFoundUser(foundSendbirdUser); // Sendbird User 객체를 그대로 저장
      } else {
        setSearchError("일치하는 사용자를 찾을 수 없습니다.");
      }

    } catch (e: any) {
      console.error("User search failed:", e);
      setSearchError(`사용자 검색 실패: ${e.message || '알 수 없는 오류'}`);
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartNewChat = async (targetSendbirdUserId: string) => {
    if (!sbInstance.current || !currentUser || !targetSendbirdUserId) {
      console.error("Cannot start chat: SDK not initialized or target user ID missing.");
      setError("채팅 시작 실패: 시스템 오류");
      return;
    }
    if (currentUser.userId === targetSendbirdUserId) {
      setError("자신과 채팅을 시작할 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting to create or get channel with user ID: ${targetSendbirdUserId}`);
      const params = {
        invitedUserIds: [targetSendbirdUserId],
        isDistinct: true,
      };

      // 채널 생성 또는 가져오기 (여기서는 완료될 때까지 기다립니다)
      const newChannel: GroupChannel = await sbInstance.current.groupChannel.createChannel(params);

      console.log('Channel created or retrieved successfully:', newChannel);

      // 채널 목록 상태 업데이트
      setChannels(prevChannels => {
        if (!prevChannels.find(ch => ch.url === newChannel.url)) {
          // 새 채널을 목록 맨 앞으로 추가
          return [newChannel, ...prevChannels];
        }
        // 이미 목록에 있는 채널이면 순서만 맨 앞으로 이동 (선택 사항)
        return [newChannel, ...prevChannels.filter(ch => ch.url !== newChannel.url)];
      });

      // 새 채널 생성 또는 조회 후 해당 채널의 상대방 프로필 가져오기 (비동기 처리, 결과 기다리지 않음)
      // 새 채널이 GroupChannel이고 멤버가 있을 때만 처리
      // ✅ newChannel.isGroupChannel() 함수 호출
      if (newChannel.isGroupChannel() && (newChannel as GroupChannel).members && currentUser) {
        const groupChannel = newChannel as GroupChannel; // Cast to GroupChannel
        if (groupChannel.memberCount === 2) { // Now safe to access memberCount
          const otherUser = groupChannel.members.find(member => member.userId !== currentUser.userId);
          if (otherUser) {
            const backendUserId = parseInt(otherUser.userId, 10);
            if (!isNaN(backendUserId)) {
              fetchProfile(backendUserId)
                .then(profile => setUserProfiles(prev => ({ ...prev, [otherUser.userId]: profile })))
                .catch(profileError => console.error(`Failed to fetch profile for user ${otherUser.userId} after starting chat:`, profileError));
            }
          }
        }
      }

      // ✅ 채널 객체를 상태에 설정합니다.
      setCurrentChannel(newChannel);

      // ✅ handleOpenChatModal의 비동기 작업이 완료될 때까지 기다립니다.
      await handleOpenChatModal(newChannel.url);
      console.log(`handleOpenChatModal completed for channel: ${newChannel.url}. Proceeding with navigation.`);

      // targetUserId 사용 후 state 클리어
      // 네비게이션 히스토리를 오염시키지 않기 위해 replace 사용
      navigate(location.pathname, { replace: true, state: {} });

    } catch (e: any) {
      console.error("Failed to create or get channel:", e);
      setError(`채팅 시작 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 공개 채널 생성 처리 함수
  const handleCreatePublicChannel = async () => {
    if (!newChannelName.trim() || !sbInstance.current || !currentUser) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Creating public channel with name: ${newChannelName}`);
      const params = {
        name: newChannelName,
        isPublic: true, // 공개 채널로 설정
        isDistinct: false, // 고유 채널 아님 (같은 멤버로 여러 채널 가능)
        channelUrl: `public_${newChannelName.replace(/\s+/g, '-')}_${Date.now()}`, // 고유 URL 생성
        // 여기에 커버 이미지, 데이터 등을 추가할 수 있습니다.
      };

      const newChannel = await sbInstance.current.groupChannel.createChannel(params);

      console.log('Public channel created successfully:', newChannel);

      // 새로 생성된 채널을 공개 채널 목록과 내 채널 목록에 추가
      setPublicChannels(prev => [newChannel, ...prev]);
      setChannels(prev => [newChannel, ...prev]);

      // 모달 닫기 및 상태 초기화
      setIsCreateChannelModalVisible(false);
      setNewChannelName('');

      // 공개 채널 목록 갱신 (생성된 채널이 바로 보이도록)
      fetchPublicChannelsList();


    } catch (e: any) {
      console.error('Failed to create public channel:', e);
      setError(`공개 채널 생성 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 공개 채널 참여 처리 함수
  const handleJoinPublicChannel = async (channel: GroupChannel) => {
    if (!sbInstance.current || !currentUser || !channel) {
      return;
    }

    // 이미 참여한 채널인지 확인
    if (channels.some(ch => ch.url === channel.url)) {
      console.log("Already a member of this channel.", channel.url);
      handleOpenChatModal(channel.url); // 이미 참여했으면 바로 채팅 모달 열기
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting to join public channel: ${channel.url}`);
      await channel.join();
      console.log('Successfully joined channel:', channel.url);

      // 참여한 채널을 내 채널 목록에 추가
      setChannels(prevChannels => [channel, ...prevChannels]);

      // 채널 참여 후 해당 채널의 상대방 프로필 가져오기 (필요시, 공개 채널은 1:1이 아님)
      // 공개 채널에서는 멤버들의 프로필을 미리 로드하지 않고, 필요에 따라 메시지 보낸 유저 등의 프로필을 가져옴

      // 채널 참여 후 채팅 모달 열기
      handleOpenChatModal(channel.url);

    } catch (e: any) {
      console.error('Failed to join public channel:', e);
      setError(`공개 채널 참여 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 채널 닫기 (삭제) 처리 함수 - 이제 window.confirm 대신 pendingAction 사용
  const handleCloseChannel = async (channelUrl: string) => {
    if (!sbInstance.current || !currentUser) {
      console.error("Cannot close channel: SDK not initialized or user not found.");
      setError("채널 닫기 실패: 시스템 오류");
      return;
    }

    const channelToClose = channels.find(ch => ch.url === channelUrl);

    // 채널이 존재하고, 현재 사용자가 개설자인지 다시 한번 확인
    // ✅ channelToClose가 GroupChannel 타입인지 확인하고 creator 속성에 접근
    // ✅ creator?.userId 로 안전하게 접근
    if (!channelToClose || !(channelToClose as GroupChannel).creator || (channelToClose as GroupChannel).creator?.userId !== currentUser.userId) {
      console.warn("Attempted to close channel without being the creator or channel not found.");
      setError("채널 닫기 실패: 채널을 닫을 권한이 없습니다.");
      setOpenMenuChannelUrl(null); // 메뉴 닫기
      return;
    }

    console.log(`Setting pending delete action for channel: ${channelUrl}`);
    setPendingAction({ channelUrl, type: 'delete' });
    setOpenMenuChannelUrl(null); // 메뉴 닫기
  };

  // ✅ 사이드 메뉴 토글 함수 수정
  const toggleSideMenu = (channelUrl: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 부모 요소 클릭 이벤트 방지

    // 보류 중인 작업이 있으면 메뉴를 열지 않고 종료 (혹시 모를 충돌 방지)
    if (pendingAction) {
      console.log("Pending action exists. Not toggling menu.");
      return;
    }


    if (openMenuChannelUrl === channelUrl) {
      // 이미 열려있는 메뉴를 다시 클릭하면 닫기
      console.log(`Closing menu for channel: ${channelUrl}`); // 디버그 로그
      setOpenMenuChannelUrl(null);
      setMenuPosition(null); // 위치 상태도 초기화
    } else {
      // 다른 메뉴를 클릭하면 해당 메뉴 열기 및 위치 설정
      console.log(`Opening menu for channel: ${channelUrl}`); // 디버그 로그
      setOpenMenuChannelUrl(channelUrl);

      // 클릭된 버튼의 화면상 위치 정보 가져오기
      const buttonRect = event.currentTarget.getBoundingClientRect();
      console.log("Button position:", buttonRect); // 디버그 로그

      // 메뉴가 나타날 위치 계산
      // 버튼의 오른쪽 상단에 메뉴의 왼쪽 상단을 맞추도록 설정
      const position = {
        top: buttonRect.top, // 버튼의 상단 Y 좌표
        left: buttonRect.right, // 버튼의 오른쪽 X 좌표
        // 필요에 따라 스크롤 위치 보정: window.scrollY + buttonRect.top
      };
      setMenuPosition(position);
      console.log("Setting menu position:", position); // 디버그 로그
    }
  };

  // ✅ 메뉴 외부 클릭 시 메뉴 닫기 핸들러 수정
  const handleDocumentClick = (event: MouseEvent) => {
    // 보류 중인 작업 상태에서는 메뉴를 닫지 않음 (확인/취소 버튼 클릭은 메뉴 외부로 간주될 수 있으므로)
    if (pendingAction) {
      console.log("Pending action exists. Not closing menu on document click.");
      return;
    }

    // 클릭된 요소가 메뉴 자체인지 확인
    const menuElement = document.querySelector('.channel-side-menu.menu-open');
    // 클릭된 요소가 메뉴 버튼인지 확인
    const menuButtonElement = (event.target as HTMLElement).closest('.channel-menu-button');
    // 클릭된 요소가 보류 작업 확인/취소 버튼인지 확인
    const actionButtonElement = (event.target as HTMLElement).closest('.action-confirm-button, .action-cancel-button');

    // 만약 클릭된 요소가 메뉴 버튼 또는 액션 버튼이라면, 메뉴를 닫지 않고 바로 종료
    if (menuButtonElement || actionButtonElement) {
      console.log("Click originated from menu button or action button. Not closing menu.");
      return;
    }


    // 열려있는 메뉴가 있고, 열린 메뉴 요소가 존재하며, 클릭된 요소가 메뉴 내부가 아닌 경우 닫기
    if (openMenuChannelUrl && menuElement && !menuElement.contains(event.target as Node)) {
      console.log("Click outside menu detected. Closing menu."); // 디버그 로그
      setOpenMenuChannelUrl(null);
      setMenuPosition(null);
    } else {
      // 메뉴가 닫혀있거나 (openMenuChannelUrl), 열린 메뉴 요소가 없거나 (menuElement),
      // 클릭이 메뉴 버튼 또는 액션 버튼에서 시작되었거나 (위에서 처리됨),
      // 클릭된 요소가 메뉴 내부인 경우 (menuElement.contains)
      console.log("Click inside menu, menu is closed, or click on action buttons."); // 디버그 로그
    }
  };

  // ✅ 채널 나가기 함수 (Sendbird SDK groupChannel.leave() 사용) - window.confirm 대신 pendingAction 사용
  const handleLeaveChannel = async (channelUrl: string) => {
    if (!sbInstance.current || !currentUser) {
      console.error("Cannot leave channel: SDK not initialized or user not found.");
      setError("채널 나가기 실패: 시스템 오류");
      setOpenMenuChannelUrl(null); // 메뉴 닫기
      return;
    }

    const channelToLeave = channels.find(ch => ch.url === channelUrl);

    if (!channelToLeave) {
      console.warn("Attempted to leave channel that does not exist in state:", channelUrl);
      setError("채널 나가기 실패: 채널을 찾을 수 없습니다.");
      setOpenMenuChannelUrl(null); // 메뉴 닫기
      return;
    }

    console.log(`Setting pending leave action for channel: ${channelUrl}`);
    setPendingAction({ channelUrl, type: 'leave' });
    setOpenMenuChannelUrl(null); // 메뉴 닫기
  };

  // ✅ 채널 알림 설정 토글 함수 (기존 로직 유지, alert 제거)
  const handleToggleMuteNotifications = async (channelUrl: string) => {
    if (!sbInstance.current || !currentUser) {
      console.error("Cannot toggle notifications: SDK not initialized or user not found.");
      setError("알림 설정 변경 실패: 시스템 오류");
      return;
    }

    const channelToToggle = channels.find(ch => ch.url === channelUrl);

    if (!channelToToggle) {
      console.warn("Attempted to toggle notifications for channel that does not exist in state:", channelUrl);
      setError("알림 설정 변경 실패: 채널을 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);
    setOpenMenuChannelUrl(null); // 메뉴 닫기


    try {
      console.log(`Attempting to toggle notifications for channel: ${channelUrl}`);
      const groupChannel = channelToToggle as GroupChannel; // GroupChannel으로 캐스팅

      // 현재 알림 설정 상태 가져오기
      const currentOption = groupChannel.myPushTriggerOption;
      // ✅ PushTriggerOption enum 값을 사용하도록 수정
      const newOption = currentOption === PushTriggerOption.DEFAULT || currentOption === PushTriggerOption.ALL ? PushTriggerOption.OFF : PushTriggerOption.DEFAULT;

      console.log(`Current push trigger option: ${currentOption}. Setting to: ${newOption}`);

      await groupChannel.setMyPushTriggerOption(newOption);

      console.log('Successfully toggled notifications for channel:', channelUrl, 'New option:', newOption);

      // UI 상태 업데이트 (channels 목록 업데이트) - Sendbird 핸들러에 의해 자동 업데이트될 가능성이 높지만,
      // 명시적으로 업데이트하는 경우 아래와 같이 할 수 있습니다.
      // setChannels(prevChannels => prevChannels.map(ch => ch.url === channelUrl ? { ...ch, myPushTriggerOption: newOption } as GroupChannel : ch));


      // ✅ 알림 설정 변경 완료 시 alert 제거
      // alert(`채널 알림 설정이 "${newOption === PushTriggerOption.OFF ? '꺼짐' : '켜짐'}"으로 변경되었습니다.`);

    } catch (e: any) {
      console.error('Failed to toggle notifications:', e);
      setError(`알림 설정 변경 실패: ${e.message || '알 수 없는 오류 발생'}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 채널 이름 바꾸기 함수 - window.confirm 대신 pendingAction 사용 및 prompt 유지
  const handleRenameChannel = async (channelUrl: string) => {
    if (!sbInstance.current || !currentUser) {
      console.error("Cannot rename channel: SDK not initialized or user not found.");
      setError("채널 이름 변경 실패: 시스템 오류");
      setOpenMenuChannelUrl(null); // 메뉴 닫기
      return;
    }

    const channelToRename = channels.find(ch => ch.url === channelUrl);

    // 채널이 존재하고, 현재 사용자가 개설자인지 다시 한번 확인
    // channelToRename가 GroupChannel 타입인지 확인하고 creator 속성에 접근
    // ✅ creator?.userId 로 안전하게 접근
    if (!channelToRename || !(channelToRename as GroupChannel).creator || (channelToRename as GroupChannel).creator?.userId !== currentUser.userId) {
      console.warn("Attempted to rename channel without being the creator or channel not found.");
      setError("채널 이름 변경 실패: 채널 이름을 변경할 권한이 없습니다.");
      setOpenMenuChannelUrl(null); // 메뉴 닫기
      return;
    }

    setOpenMenuChannelUrl(null); // 메뉴 닫기

    // 사용자로부터 새 이름을 입력받는 로직 (prompt 사용)
    const newName = prompt("새 채널 이름을 입력하세요:");

    if (!newName || newName.trim() === "") {
      console.log("Channel rename cancelled or new name is empty.");
      return; // 사용자가 취소하거나 빈 문자열 입력 시 종료
    }

    console.log(`Setting pending rename action for channel: ${channelUrl} with new name: "${newName}"`);
    setPendingAction({ channelUrl, type: 'rename', newName: newName.trim() });
  };

  // ✅ 보류 중인 작업 실행 함수 (확인 버튼 클릭 시 호출, alert 제거)
  const handleConfirmAction = async () => {
    if (!pendingAction || !sbInstance.current || !currentUser) {
      console.error("No pending action or SDK/user not ready.");
      setError("작업 실행 실패: 시스템 오류");
      setPendingAction(null); // 상태 초기화
      return;
    }

    setLoading(true);
    setError(null);

    const { channelUrl, type, newName } = pendingAction;
    const channel = channels.find(ch => ch.url === channelUrl) as GroupChannel | undefined;

    if (!channel) {
      console.error(`Channel not found for pending action: ${channelUrl}`);
      setError("작업 실행 실패: 채널을 찾을 수 없습니다.");
      setPendingAction(null); // 상태 초기화
      setLoading(false);
      return;
    }

    try {
      console.log(`Executing pending action: ${type} for channel: ${channelUrl}`);
      switch (type) {
        case 'leave':
          await channel.leave();
          console.log('Successfully left channel:', channelUrl);
          // UI 상태 업데이트: 채널 목록에서 나간 채널 제거
          setChannels(prevChannels => prevChannels.filter(ch => ch.url !== channelUrl));
          // 만약 현재 열려있는 채널이 나간 채널이면 모달 닫기
          if (currentChannel?.url === channelUrl) {
            handleExitClick();
          }
          // ✅ 완료 알림 제거
          // alert("채널에서 성공적으로 나왔습니다.");
          break;
        case 'delete':
          // ✅ SendbirdChat 인스턴스에서 deleteChannel 메소드 사용
          await sbInstance.current.deleteChannel(channelUrl);
          console.log('Channel deleted successfully:', channelUrl);
          // UI 상태 업데이트는 onChannelDeleted 핸들러에 의해 처리됨
          // ✅ 완료 알림 제거
          // alert("채널이 성공적으로 닫혔습니다.");
          break;
        case 'rename':
          if (!newName) {
            console.error("New name is missing for rename action.");
            setError("채널 이름 변경 실패: 새 이름이 유효하지 않습니다.");
            break; // switch 탈출
          }
          const params = { name: newName };
          const updatedChannel = await channel.updateChannel(params);
          console.log('Successfully renamed channel:', channelUrl, 'New name:', updatedChannel.name);
          // UI 상태 업데이트는 onChannelChanged 핸들러에 의해 처리됨
          // ✅ 완료 알림 제거
          // alert(`채널 이름이 "${updatedChannel.name}"으로 변경되었습니다.`);
          break;
        default:
          console.error("Unknown pending action type:", type);
          setError("알 수 없는 작업 유형입니다.");
          break; // switch 탈출
      }
    } catch (e: any) {
      console.error(`Failed to execute pending action (${type}):`, e);
      setError(`작업 실행 실패 (${type}): ${e.message || '알 수 없는 오류 발생'}`);
    } finally {
      setPendingAction(null); // 작업 완료 또는 실패 시 상태 초기화
      setLoading(false);
    }
  };

  // ✅ 보류 중인 작업 취소 함수
  const handleCancelAction = () => {
    console.log(`Cancelling pending action for channel: ${pendingAction?.channelUrl}`);
    setPendingAction(null); // 상태 초기화
    setError(null); // 오류 상태도 초기화
  };


  // ✅ 메뉴 항목 표시 여부를 결정하는 헬퍼 함수들 (기존 로직 유지)
  const showRenameAndDeleteMenu = (channel: GroupChannel | null, user: User | null): boolean => {
    // 채널이 있고 GroupChannel이며 사용자가 채널 생성자이고 1:1 채널이 아닐 때 true 반환
    // channel?.isGroupChannel() 로 안전하게 접근
    return !!(channel?.isGroupChannel() && (channel as GroupChannel).creator?.userId === user?.userId && (channel as GroupChannel).memberCount !== 2);
  };

  // ✅ 채널 나가기 메뉴 표시 여부를 결정하는 헬퍼 함수 (기존 로직 유지)
  const showLeaveMenu = (channel: GroupChannel | null, user: User | null): boolean => {
    // 채널이 있고 GroupChannel이며 1:1 채널이 아닐 때 true 반환
    // channel?.isGroupChannel() 로 안전하게 접근
    return !!(channel?.isGroupChannel());
  };


  return (
    <div className="chat-page">
      {loading && <div className="loading">Sendbird 로딩 중...</div>}
      {error && <div className="error">오류: {error}</div>}

      {/* ✅ 채팅 알림 UI */}
      {showChatNotification && chatNotification && (
        <div className="chat-notification" onClick={() => handleOpenChatModal(chatNotification.channelUrl)}>
            <div className="notification-content">
                <img
                    src={chatNotification.senderProfileImage}
                    alt="프로필"
                    className="notification-profile"
                />
                <div className="notification-text">
                    <p className="notification-welcome">새 메시지 도착!</p>
                    <p className="notification-info">
                         <span className="notification-label">채널:</span> {chatNotification.channelName}
                    </p>
                    <p className="notification-info">
                        <span className="notification-label">{chatNotification.senderNickname}:</span> {chatNotification.message}
                    </p>
                </div>
                <button
                    className="notification-close"
                    onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트가 부모로 전파되지 않도록 방지
                        setShowChatNotification(false);
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
      )}

      {/* 채팅 목록 섹션 - 항상 표시 */}
      {!loading && !error && (
        <div className="chat-list-section"> {/* 기존 chat-list-modal 클래스명 변경 */}
          <div className="chat-list-header">
            <h2>채팅 목록</h2>
            {/* 채널 만들기 버튼 추가 */}
            <button className="create-channel-button" onClick={() => setIsCreateChannelModalVisible(true)} disabled={!isSendbirdInitialized}>
              채널 만들기
            </button>
          </div>

          {/* 채널 생성 모달/폼 */}
          {isCreateChannelModalVisible && (
            <div className="create-channel-modal">
              <h3>새 공개 채널 만들기</h3>
              <input
                type="text"
                placeholder="채널 이름"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
              <button className="create-channel-submit-button" onClick={handleCreatePublicChannel} disabled={loading || !newChannelName.trim()}>만들기</button>
              <button className="create-channel-cancel-button" onClick={() => setIsCreateChannelModalVisible(false)}>취소</button>
            </div>
          )}

          <div className="new-chat-section">
            <h3>새로운 채팅 시작 (1:1)</h3>
            <input
              type="text"
              placeholder="사용자 ID 입력"
              value={searchedUserId}
              onChange={(e) => setSearchedUserId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchUser(); }}
            />
            <button className="search-user-btn" onClick={handleSearchUser} disabled={isSearching || !isSendbirdInitialized}>
              {isSearching ? '검색 중...' : '사용자 검색'}
            </button>
            {searchError && <p className="search-error">{searchError}</p>}

            {foundUser && (
              <div className="found-user">
                {/* 검색된 사용자의 프로필 이미지를 표시 */}
                <img
                  src={userProfiles[foundUser.userId]?.thumbnailImagePath || foundUser.profileUrl || "/profile-placeholder.jpg"}
                  alt={foundUser.nickname || foundUser.userId}
                  className="profile-icon"
                />
                <span>{foundUser.nickname || foundUser.userId}</span>
                <button
                  className="start-chat-btn"
                  onClick={() => handleStartNewChat(foundUser.userId)}
                  disabled={currentUser?.userId === foundUser.userId || loading || !isSendbirdInitialized}
                >
                  채팅 시작
                </button>
              </div>
            )}
          </div>

          {/* 공개 채널 목록 섹션 */}
          <div className="public-channels-section">
            <h3>참여 가능한 공개 채널</h3>
            {publicChannelsLoading && <p>공개 채널 로딩 중...</p>}
            {publicChannelsError && <p className="error">{publicChannelsError}</p>}
            {!publicChannelsLoading && publicChannels.length === 0 && !publicChannelsError && (
              <p>참여 가능한 공개 채널이 없습니다.</p>
            )}
            <ul className="channel-list"> {/* 기존 .chat-list와 구분 */}
              {publicChannels.map(channel => (
                // 이미 참여한 채널은 목록에 표시하지 않거나 비활성화
                // ✅ channel.isGroupChannel() 함수 호출
                <li key={channel.url} className={(channel.isGroupChannel() && channels.some(ch => ch.url === channel.url)) ? 'joined' : ''}>
                  {/* 공개 채널 커버 이미지 또는 기본 이미지 표시 */}
                  <img className="channel-cover-image" src={channel.coverUrl || "/profile-placeholder.jpg"} alt={channel.name || channel.url} />
                  <div className="channel-info">
                    <strong>{channel.name || channel.url}</strong>
                    <p>{(channel as GroupChannel).memberCount} 명 참여 중</p> {/* memberCount는 GroupChannel에만 있음 */}
                  </div>
                  {/* ✅ channel.isGroupChannel() 함수 호출 후 채널 참여 로직 실행 */}
                  {(channel.isGroupChannel() && channels.some(ch => ch.url === channel.url)) ? (
                    <button className="join-channel-btn" disabled>참여함</button>
                  ) : (channel.isGroupChannel() && ( // GroupChannel만 참여 가능하도록 조건 추가
                    <button className="join-channel-btn" onClick={() => handleJoinPublicChannel(channel as GroupChannel)} disabled={loading}>참여</button>
                  ))}
                </li>
              ))}
            </ul>
          </div>


          <div className="my-chat-list-section">
            <h3>내 채팅 목록</h3>
            <ul className="chat-list">
              {channels.map((channel) => {
                // 채널이 GroupChannel인 경우에만 1:1 여부 및 상대방 정보 확인
                // ✅ channel.isGroupChannel() 함수 호출
                const isGroup = channel.isGroupChannel();
                const isOneToOneChannel = isGroup && (channel as GroupChannel).memberCount === 2 && currentUser;
                const otherUser = isOneToOneChannel && (channel as GroupChannel).members // members 속성 안전 접근
                  ? (channel as GroupChannel).members.find(member => member.userId !== currentUser.userId) || null
                  : null;
                const otherUserProfile = otherUser ? userProfiles[otherUser.userId] : undefined;

                // 표시 이름 결정: 1:1 채널이면 상대방 이름, 아니면 채널 이름
                const displayName = isOneToOneChannel ? (otherUser?.nickname || otherUser?.userId || '알 수 없는 사용자') : (channel.name || channel.url);
                // 상대방 프로필 이미지 URL이 있으면 사용, 없으면 Sendbird 프로필 URL 또는 기본 이미지 사용
                const displayImage = otherUserProfile?.thumbnailImagePath || otherUser?.profileUrl || channel.coverUrl || "/profile-placeholder.jpg";

                // ✅ 현재 사용자가 채널 생성자인지 확인 (GroupChannel 타입에만 creator 속성 있음)
                // ✅ creator?.userId 로 안전하게 접근
                const isChannelCreator = currentUser && isGroup && (channel as GroupChannel).creator?.userId === currentUser.userId;

                // ✅ 1:1 채널에서는 이름 바꾸기 및 채널 닫기 메뉴를 표시하지 않음 - 헬퍼 함수 사용
                const canShowRenameAndDeleteMenu = showRenameAndDeleteMenu(channel, currentUser);
                // ✅ 1:1 채널에서는 나가기 메뉴를 표시하지 않음 - 헬퍼 함수 사용
                const canShowLeaveMenu = showLeaveMenu(channel, currentUser);

                // ✅ 현재 채널에 대해 보류 중인 작업이 있는지 확인
                const isPending = pendingAction?.channelUrl === channel.url;

                // ✅ 현재 채널의 알림 상태 확인 (GroupChannel인 경우에만 해당)
                // PushTriggerOption.OFF는 알림 꺼짐 상태를 나타냅니다.
                const isNotificationsMuted = isGroup && (channel as GroupChannel).myPushTriggerOption === PushTriggerOption.OFF;


                return (
                  <li
                    key={channel.url}
                    // 보류 중인 작업이 없을 때만 li 클릭 시 채팅방 열기
                    onClick={() => !isPending && handleOpenChatModal(channel.url)}
                    className={`${openMenuChannelUrl === channel.url ? 'menu-open' : ''} ${isPending ? 'pending-action' : ''}`} // 메뉴 열림 및 보류 작업 상태 클래스 추가
                  >
                    {/* ✅ 채널 정보 표시 영역 클릭 시 채팅 모달 열기 (보류 중이 아닐 때만) */}
                    <div className="channel-info-display" onClick={() => !isPending && handleOpenChatModal(channel.url)}> {/* onClick 추가 */}
                      <img className="channel-cover-image" src={displayImage} alt={displayName} />
                      <div className="chat-info">
                        <strong>{displayName}</strong>
                        <p>
                          {channel.lastMessage && (channel.lastMessage as UserMessage).message ? (channel.lastMessage as UserMessage).message : "대화 시작"}
                        </p>
                      </div>
                    </div>

                    {/* ✅ 알림 상태 아이콘 추가 (GroupChannel인 경우에만 표시) - 메뉴 버튼 옆으로 이동 */}
                    {isGroup && !isPending && (
                      <span className="notification-status-icon" title={isNotificationsMuted ? '알림 꺼짐' : '알림 켜짐'}>
                        {/* 알림 꺼짐 상태일 때만 이미지 표시 */}
                        {isNotificationsMuted && <img src="/images/chat-muted.png" alt="알림 꺼짐" style={{ width: '25px', height: '25px', marginRight: '5px' }} />} {/* 이미지 경로 및 스타일 조정 */}
                      </span>
                    )}

                    {/* ✅ 사이드 메뉴 버튼 또는 보류 작업 버튼 표시 */}
                    {isGroup && (
                      isPending ? (
                        // 보류 중인 작업이 있을 때 확인/취소 버튼 표시
                        <div className="action-buttons">
                          {/* 작업 유형에 따라 표시 텍스트 변경 가능 (선택 사항) */}
                          <button className="chat-action-confirm-button" onClick={handleConfirmAction} disabled={loading}>확인</button>
                          <button className="chat-action-cancel-button" onClick={handleCancelAction} disabled={loading}>취소</button>
                        </div>
                      ) : (
                        // 보류 중인 작업이 없을 때 메뉴 버튼 표시
                        <button className="channel-menu-button" onClick={(e) => toggleSideMenu(channel.url, e)}>
                          ⋮ {/* 점 3개 아이콘 */}
                        </button>
                      )
                    )}

                    {/* ✅ 사이드 메뉴 렌더링은 아래에서 단일 요소로 처리 */}
                  </li>
                );
              })}
              {channels.length === 0 && !loading && !error && <p>채널이 없습니다.</p>}
            </ul>
          </div>
        </div>
      )}

      {/* 채팅방 모달 섹션 - isChatModalVisible 상태에 따라 표시 */}
      {!loading && !error && isChatModalVisible && currentChannel && currentUser && (
        <div className="modal-overlay"> {/* 기존 modal-overlay 유지 */}
          <div className="chat-modal"> {/* 기존 chat-modal 유지 */}
            <div className="chat-header">
              <div className="chat-header-left">
                {/* Linter Error Fix applied here: ensure currentUser exists and use currentChannel.isGroupChannel directly */}
                {/* ✅ currentChannel?.isGroupChannel() 함수 호출 */}
                {(currentChannel as GroupChannel)?.isGroupChannel() && (currentChannel as GroupChannel).memberCount === 2 && currentUser && (currentChannel as GroupChannel).members ? // 현재 채널이 GroupChannel이고 1:1 채널이며 사용자 정보가 있을 때
                  // 현재 채널의 상대방 프로필 정보 가져오기
                  (currentChannel as GroupChannel).members.find(member => member.userId !== currentUser.userId)?.nickname || (currentChannel as GroupChannel).members.find(member => member.userId !== currentUser.userId)?.userId || '알 수 없는 사용자' // 상대방 닉네임 또는 ID
                  : currentChannel.name || currentChannel.url // 그룹 채널 또는 정보 없을 때 채널 이름/URL
                }
              </div>
              <button className="main-page-btn" onClick={() => navigate('/')}>
                메인 페이지로 이동
              </button>
              <button className="exit-btn" onClick={handleExitClick}>
                나가기
              </button>
            </div>

            <div className="chat-messages">
              {messagesByUser[currentChannel.url]?.map(
                (msg, index) =>
                  !msg.hidden && (
                    <div
                      key={msg.messageId || index}
                      className={`message-row ${msg.sender === currentUser.userId ? 'me' : 'you'}`}
                    >
                      {/* 메시지 보낸 사용자가 현재 사용자가 아닌 경우에만 프로필 사진 표시 */}
                      {(msg.sender !== currentUser.userId) && (
                        // 메시지 보낸 사용자의 프로필 사진을 표시
                        <img
                          src={userProfiles[msg.sender]?.thumbnailImagePath || '/profile-placeholder.jpg'}
                          alt="상대방"
                          className="profile-icon"
                        />
                      )}
                      <div
                        className={`message ${msg.sender === currentUser.userId ? 'me-message' : 'you-message'}`}
                      >
                        {msg.message?.split("\\n").map((line, i) => (
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
                                  onClick={() => togglePaymentForm(msg.messageId)}
                                  className="payment-btn"
                                >
                                  결제하기
                                </button>
                              )}

                            {msg.isPaymentFormVisible && (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handlePaymentSubmit(msg.messageId);
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
                                <button className="complete-payment-btn" type="submit">결제 완료</button>
                              </form>
                            )}

                            {msg.isPaymentComplete && (
                              <p>결제가 완료되었습니다.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
              )}
              {messagesByUser[currentChannel.url]?.length === 0 && !loading && !error && <p>메시지가 없습니다.</p>}
            </div>

            <div className="chat-input-area">
              <textarea
                placeholder="메시지를 입력하세요..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-message-btn" onClick={handleSendMessage} disabled={loading || !currentChannel}>전송</button>
              <button className="secure-payment-btn" onClick={handleSecurePaymentRequest} disabled={loading || !currentChannel}>
                안전결제 요청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 여기에 단 하나의 메뉴 요소를 렌더링합니다 */}
      {/* 메뉴가 열려있고, 메뉴 위치 정보가 있을 때만 렌더링 */}
      {openMenuChannelUrl && menuPosition && (
        <ul
          className="channel-side-menu menu-open" // 열려있는 메뉴에 menu-open 클래스 추가
          style={{
            position: 'fixed', // 뷰포트 기준으로 고정
            top: menuPosition.top,
            left: menuPosition.left,
            // 필요에 따라 메뉴 너비만큼 왼쪽으로 조정
            // transform: 'none', // 이전 변형 제거
          }}
        // 외부 클릭 감지를 위해 onBlur 등을 사용하거나 document 클릭 핸들러에서 메뉴 요소 참조
        >
          {/* 메뉴 항목들은 openMenuChannelUrl을 사용하여 결정 */}
          {/* openMenuChannelUrl에 해당하는 채널 정보를 찾아서 사용 */}
          {(() => {
            const targetChannel = channels.find(ch => ch.url === openMenuChannelUrl) || null;
            if (!targetChannel) {
              console.warn(`Could not find channel with URL: ${openMenuChannelUrl} to render menu items.`); // 디버그 로그
              return null; // 채널을 찾을 수 없으면 메뉴 항목을 렌더링하지 않음
            }
            const canShowLeave = showLeaveMenu(targetChannel, currentUser);
            const canShowRenameAndDelete = showRenameAndDeleteMenu(targetChannel, currentUser);

            return (
              <Fragment> {/* Fragment 사용 */}
                {/* 채널 나가기 메뉴: 1:1 채널이 아닐 때 표시 */}
                {canShowLeave && (
                  <li onClick={() => handleLeaveChannel(openMenuChannelUrl)}>
                    채널 나가기
                  </li>
                )}
                {/* 알림 끄기/켜기 메뉴: 모든 GroupChannel에서 표시 */}
                <li onClick={() => handleToggleMuteNotifications(openMenuChannelUrl)}>
                  알림 설정 변경
                </li>
                {/* 채널 이름 바꾸기 메뉴: 내가 개설자인 GroupChannel에서 표시 (1:1 채널 제외) */}
                {canShowRenameAndDelete && (
                  <li onClick={() => handleRenameChannel(openMenuChannelUrl)}>
                    채널 이름 바꾸기
                  </li>
                )}
                {/* 채널 닫기 (삭제) 메뉴: 내가 개설자인 GroupChannel에서 표시 (1:1 채널 제외) */}
                {canShowRenameAndDelete && (
                  <li onClick={() => handleCloseChannel(openMenuChannelUrl)}>
                    채널 닫기
                  </li>
                )}
              </Fragment>
            );
          })()}
        </ul>
      )}
    </div>
  );
};

export default ChatPage;
