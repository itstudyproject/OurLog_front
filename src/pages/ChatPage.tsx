import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";
import { getToken } from "../utils/auth";
import SendbirdChat from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule, GroupChannel, GroupChannelListQuery } from '@sendbird/chat/groupChannel';
import { UserMessage, BaseMessage, MessageListParams, UserMessageCreateParams, UserMessageUpdateParams } from '@sendbird/chat/message';
import { OpenChannelModule } from '@sendbird/chat/openChannel';
import { BaseChannel } from '@sendbird/chat';
import { User } from '@sendbird/chat';

// Sendbird SDK v4 인스턴스 타입을 정확히 선언합니다.
// 초기화 시 사용된 모듈 타입을 포함하여 선언합니다.
// SendbirdChat.init의 반환 타입은 초기화 시 전달된 모듈에 따라 동적으로 결정됩니다.
// 명시적인 타입 정의를 통해 타입 안전성을 확보합니다.
// SendbirdChat 인스턴스 자체에 createApplicationUserListQuery가 있습니다.
type SendbirdChatInstanceType = SendbirdChat & {
  groupChannel: GroupChannelModule;
  openChannel: OpenChannelModule;
  createApplicationUserListQuery: (params?: any) => any; // UserListQuery 대신 any 사용
};

interface UserProfile {
  nickname: string;
  profileImage: string;
}

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

  const [isSendbirdInitialized, setIsSendbirdInitialized] = useState(false);
  const [isListModalVisible, setIsListModalVisible] = useState(true);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<GroupChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchedUserId, setSearchedUserId] = useState<string>("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const channelHandlerId = useRef<string>(`CHANNEL_HANDLER_ID_${Date.now()}`).current;

  const sbInstance = useRef<SendbirdChatInstanceType | null>(null);

  // MessageCollection 인스턴스를 관리할 useRef 추가 (채널별로 관리할 수도 있습니다)
  // 여기서는 현재 채널의 MessageCollection을 저장하도록 합니다.
  const messageCollectionRef = useRef<any | null>(null); // Change type to any for now

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
      if (isSendbirdInitialized) {
        console.log("Sendbird already initialized. Skipping.");
        setLoading(false);
        return;
      }

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

        console.log('Fetching channel list');
        const channelListQuery: GroupChannelListQuery = sbInstance.current.groupChannel.createMyGroupChannelListQuery({
          limit: 100,
        });

        const channels = await channelListQuery.next();
        console.log('Fetched channels:', channels);
        setChannels(channels);

        console.log('Adding Sendbird channel handler');
        const channelHandler = new GroupChannelHandler({
            onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
                console.log('Message received:', channel, message);
                // @ts-ignore
                if (channel.isGroupChannel) {
                  const groupChannel = channel as GroupChannel;
                  if (message.messageType === 'user') {
                    const userMessage = message as UserMessage;

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

                    setMessagesByUser(prev => ({
                      ...prev,
                      [groupChannel.url]: [...(prev[groupChannel.url] || []), formattedMessage]
                    }));
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
                      setMessagesByUser(prev => ({
                        ...prev,
                        [groupChannel.url]: [...(prev[groupChannel.url] || []), formattedMessage]
                      }));
                   }
                } else {
                  console.warn("Received message from a non-group channel:", channel);
                }
              },
              onChannelChanged: (channel: BaseChannel) => {
                console.log('Channel changed:', channel);
                // @ts-ignore
                if (channel.isGroupChannel) {
                     setChannels(prevChannels => prevChannels.map(ch => ch.url === channel.url ? channel as GroupChannel : ch));
                }
              },
              onChannelDeleted: (channelUrl: string, channelType: string) => {
                console.log(`Channel deleted: ${channelUrl} (${channelType})`);
                setChannels(prevChannels => prevChannels.filter(ch => ch.url !== channelUrl));
                if (currentChannel?.url === channelUrl) {
                    setCurrentChannel(null);
                    setIsChatModalVisible(false);
                    setIsListModalVisible(true);
                }
              },
               onMessageUpdated: (channel: BaseChannel, message: BaseMessage) => {
                   console.log('Message updated:', channel, message);
                    // @ts-ignore
                   if (channel.isGroupChannel) {
                     const groupChannel = channel as GroupChannel;
                     if (message.messageType === 'user') {
                       const userMessage = message as UserMessage;

                       const formattedUpdatedMsg: ChatMessage = {
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

                        setMessagesByUser(prev => ({
                          ...prev,
                          [groupChannel.url]: prev[groupChannel.url].map(msg =>
                             msg.messageId === formattedUpdatedMsg.messageId ? formattedUpdatedMsg : msg
                          )
                        }));
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
      // MessageCollection dispose 추가
      if (messageCollectionRef.current) {
          messageCollectionRef.current.dispose();
          messageCollectionRef.current = null;
          console.log("MessageCollection disposed on unmount.");
      }
    };
  }, [navigate]);

  const handleOpenChatModal = async (channelUrl: string) => {
    console.log("채널 선택:", channelUrl);
    if (sbInstance.current) {
      try {
         const channel: GroupChannel = await sbInstance.current.groupChannel.getChannel(channelUrl);
        console.log('Selected channel:', channel);

        // 기존 채널의 MessageCollection이 있다면 정리합니다. (이 부분은 MessageCollection을 사용하지 않아도 유지할 수 있습니다.)
        if (messageCollectionRef.current) {
            messageCollectionRef.current.dispose();
            messageCollectionRef.current = null;
            console.log("Previous MessageCollection disposed.");
        }

        setCurrentChannel(channel);
        setIsListModalVisible(false);
        setIsChatModalVisible(true);

        console.log('Fetching messages for channel using getMessagesByTimestamp:', channelUrl);

        // MessageCollection 대신 getMessagesByTimestamp 사용
        const messageListParams: MessageListParams = {
          prevResultSize: 100, // 시작점 이전 메시지 100개 가져오기
          nextResultSize: 0, // 시작점 이후 메시지는 가져오지 않음
          reverse: true, // 최신 메시지부터 가져오기 위해 true 설정
        };

        // startingPoint를 지정하지 않으면 최신 메시지부터 가져옵니다.
        // 특정 시점(예: 현재 시간)을 기준으로 이전 메시지를 가져오려면 startingPoint를 설정합니다.
         // const latestMessages = await channel.getMessagesByTimestamp(Date.now(), messageListParams);
        const latestMessages = await channel.getMessagesByTimestamp(0, messageListParams); // 0을 startingPoint로 하면 최신 메시지부터 가져옵니다.


        console.log('Fetched messages using getMessagesByTimestamp:', latestMessages);

        // 가져온 Sendbird 메시지 객체를 ChatMessage 인터페이스에 맞게 변환하여 상태에 저장
        // getMessagesByTimestamp(0, { prevResultSize: 100, reverse: true })는 최신 메시지부터 가져옵니다.
        const formattedMessages: ChatMessage[] = latestMessages.map(msg => {
           const baseMessage: ChatMessage = {
              sender: (msg as UserMessage).sender?.userId || 'Unknown', // BaseMessage에는 sender 속성이 없으므로 UserMessage로 형변환 후 접근
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
              console.error("Failed to parse message data:", e);
            }
            return baseMessage;
        });

         // reverse: true 로 이미 최신순이므로 reverse() 제거
        setMessagesByUser(prev => ({ ...prev, [channel.url]: formattedMessages }));


      } catch (messageError: any) {
        console.error('Failed to get channel or fetch messages using getMessagesByTimestamp:', messageError);
         setError(`채널 메시지 로딩 실패: ${messageError.message || '알 수 없는 오류 발생'}`);
         // 오류 발생 시 MessageCollection 정리 (사용하지 않으므로 필요 없을 수 있지만 혹시 몰라 유지)
         if (messageCollectionRef.current) {
             messageCollectionRef.current.dispose();
             messageCollectionRef.current = null;
         }
      }
    } else {
      console.error('Sendbird SDK not initialized.');
       setError('채팅 시스템이 초기화되지 않았습니다.');
    }
  };

  const handleCloseListModal = () => {
    setIsListModalVisible(false);
    setSearchedUserId("");
    setFoundUser(null);
    setSearchError(null);
  };

  const handleExitClick = () => {
    setIsChatModalVisible(false);
    setCurrentChannel(null);
    setIsListModalVisible(true);
    setCardNumber("");
     if(currentChannel) {
        setMessagesByUser(prev => {
            const newState = { ...prev };
            delete newState[currentChannel.url];
            return newState;
        });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentChannel || !sbInstance.current || !currentUser) return;

    const params: UserMessageCreateParams = {
        message: newMessage,
    };

    const tempMessageId = Date.now() + Math.random();
    const tempMessage: ChatMessage = {
      messageId: tempMessageId,
      sender: currentUser.userId,
      message: newMessage,
      messageType: 'user',
      createdAt: Date.now(),
      customType: params.customType,
      data: params.data
    };

    setMessagesByUser(prev => ({
      ...prev,
      [currentChannel.url]: [...(prev[currentChannel.url] || []), tempMessage]
    }));

    setNewMessage("");

     currentChannel.sendUserMessage(params)
      .onSucceeded((message) => {
        console.log('Message sent successfully:', message);
        setMessagesByUser(prev => ({
          ...prev,
          [currentChannel.url]: prev[currentChannel.url].map(msg =>
            msg.messageId === tempMessageId ? {
              ...msg,
              messageId: message.messageId,
              createdAt: message.createdAt,
              messageType: message.messageType,
              customType: message.customType,
              data: message.data,
            } : msg
          )
        }));
      })
      .onFailed((error) => {
        console.error('Message send failed:', error);
        setMessagesByUser(prev => ({
          ...prev,
          [currentChannel.url]: prev[currentChannel.url].filter(msg => msg.messageId !== tempMessageId)
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

    const tempMessageId = Date.now() + Math.random();
     const tempMessage: ChatMessage = {
      messageId: tempMessageId,
      sender: currentUser.userId,
      message: params.message || '',
      messageType: 'user',
      createdAt: Date.now(),
      paymentInfo: paymentInfo,
      isPaymentFormVisible: false,
      isPaymentComplete: false,
      customType: params.customType,
      data: params.data
    };

     setMessagesByUser(prev => ({
        ...prev,
        [currentChannel.url]: [...(prev[currentChannel.url] || []), tempMessage]
      }));

    currentChannel.sendUserMessage(params)
      .onSucceeded((message) => {
          console.log('Payment request message sent successfully:', message);
            setMessagesByUser(prev => ({
              ...prev,
              [currentChannel.url]: prev[currentChannel.url].map(msg => {
                if (msg.messageId === tempMessageId) {
                  const updatedMsg: ChatMessage = { ...msg,
                     messageId: message.messageId,
                     createdAt: message.createdAt,
                     messageType: message.messageType,
                     customType: message.customType,
                     data: message.data,
                  };
                   try {
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
      .onFailed((error) => {
        console.error('Payment request message send failed:', error);
          setMessagesByUser(prev => ({
            ...prev,
            [currentChannel.url]: prev[currentChannel.url].filter(msg => msg.messageId !== tempMessageId)
          }));
         setError(`안전결제 메시지 전송 실패: ${error.message || '알 수 없는 오류 발생'}`);
        });
  };

  const togglePaymentForm = async (messageId: number | undefined) => {
    if (!currentChannel || messageId === undefined || !sbInstance.current) {
        console.error("Cannot toggle payment form: Channel or SDK not ready.");
        setError("결제 폼 상태 업데이트 실패: 시스템 오류");
        // Attempt to toggle state locally even if Sendbird update fails immediately
         setMessagesByUser((prev) => ({
            ...prev,
            [currentChannel!.url]: prev[currentChannel!.url].map((msg) => {
               if (msg.messageId === messageId) {
                 return { ...msg, isPaymentFormVisible: !msg.isPaymentFormVisible };
              }
              return msg;
            }),
          }));
        return;
    }

    const messageToUpdate = messagesByUser[currentChannel!.url]?.find(msg => msg.messageId === messageId);
    if (!messageToUpdate || messageToUpdate.customType !== 'payment_request' || !messageToUpdate.data) {
        console.warn("Message not found or is not a payment request message for toggle.");
         setMessagesByUser((prev) => ({ // Keep local state update attempt
            ...prev,
            [currentChannel!.url]: prev[currentChannel!.url].map((msg) => {
               if (msg.messageId === messageId) {
                 return { ...msg, isPaymentFormVisible: !msg.isPaymentFormVisible };
              }
              return msg;
            }),
          }));
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
        // Sendbird handler (onMessageUpdated) will receive this update and modify state,
        // so explicit state update here might cause a flicker or be redundant depending on handler implementation.
        // However, including it provides immediate feedback if the handler is slow or absent for local user updates.
         setMessagesByUser((prev) => ({
             ...prev,
            [currentChannel!.url]: prev[currentChannel!.url].map((msg) => {
                if (msg.messageId === updatedMessage.messageId) {
                   const formattedUpdatedMsg: ChatMessage = {
                        ...msg,
                        messageId: updatedMessage.messageId,
                        createdAt: updatedMessage.createdAt,
                        messageType: updatedMessage.messageType,
                        customType: updatedMessage.customType,
                        data: updatedMessage.data,
                   };
                    try {
                        // Re-parse data from the actual updated message from Sendbird
                        if (updatedMessage.customType === 'payment_request' && updatedMessage.data) {
                                const actualData = JSON.parse(updatedMessage.data);
                                if (actualData.paymentInfo) {
                                  formattedUpdatedMsg.paymentInfo = actualData.paymentInfo;
                                }
                                if (actualData.isPaymentComplete !== undefined) {
                                   formattedUpdatedMsg.isPaymentComplete = actualData.isPaymentComplete;
                                }
                                if (actualData.isPaymentFormVisible !== undefined) {
                                   formattedUpdatedMsg.isPaymentFormVisible = actualData.isPaymentFormVisible;
                                }
                             }
                          } catch (e) {
                             console.error("Failed to parse updated message data from Sendbird response:", e);
                          }
                       return formattedUpdatedMsg;
                    } else {
                       return msg;
                    }
                 })
            }));
        } catch (error: any) {
             console.error('Failed to update payment form visibility:', error);
              setError(`결제 폼 상태 업데이트 실패: ${error.message || '알 수 없는 오류 발생'}`);
              // Revert local state if update failed, using existingData from outside try block
              if (existingData !== undefined) { // Check if existingData was successfully parsed
                  setMessagesByUser((prev) => ({
                      ...prev,
                      [currentChannel!.url]: prev[currentChannel!.url].map((msg) => {
                        if (msg.messageId === messageId) {
                             // Revert the toggle attempt using the original visibility state
                            return { ...msg, isPaymentFormVisible: existingData.isPaymentFormVisible };
                        }
                        return msg;
                      })
                  }));
              } else {
                   // If existingData was not parsed, we can't revert accurately, maybe just log or handle differently
                   console.warn("Could not revert local state for payment form visibility due to parsing error.");
              }
        }
  };

  const handlePaymentSubmit = async (messageId: number | undefined) => {
    if (cardNumber.length !== 12) {
      alert("카드 번호는 12자리여야 합니다.");
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
         // Sendbird handler (onMessageUpdated) will receive this update and modify state
          setMessagesByUser((prev) => ({
              ...prev,
              [currentChannel.url]: prev[currentChannel.url].map((msg) => {
                if (msg.messageId === updatedMessage.messageId) {
                   const formattedUpdatedMsg: ChatMessage = {
                      ...msg,
                      messageId: updatedMessage.messageId,
                      createdAt: updatedMessage.createdAt,
                      messageType: updatedMessage.messageType,
                      customType: updatedMessage.customType,
                      data: updatedMessage.data,
                   };
                    try {
                     // Re-parse data from the actual updated message from Sendbird
                     if (updatedMessage.customType === 'payment_request' && updatedMessage.data) {
                       const actualData = JSON.parse(updatedMessage.data);
                        if (actualData.paymentInfo) {
                         formattedUpdatedMsg.paymentInfo = actualData.paymentInfo;
                        }
                        if (actualData.isPaymentComplete !== undefined) {
                           formattedUpdatedMsg.isPaymentComplete = actualData.isPaymentComplete;
                        }
                        if (actualData.isPaymentFormVisible !== undefined) {
                           formattedUpdatedMsg.isPaymentFormVisible = actualData.isPaymentFormVisible;
                        }
                     }
                   } catch (e) {
                     console.error("Failed to parse updated message data from Sendbird response:", e);
                   }
                   return formattedUpdatedMsg;
                 } else {
                   return msg;
                 }
               })
             }));
             setCardNumber("");
             alert("결제가 완료되었습니다.");
         }
        catch (error: any) {
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
      const userListQuery = sbInstance.current.createApplicationUserListQuery({
         userIdsFilter: [searchedUserId],
         limit: 1,
      });

      const users = await userListQuery.next();
      console.log("Search results:", users);

      if (users && users.length > 0) {
        setFoundUser(users[0]);
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

  const handleStartNewChat = async (targetUserId: string) => {
    if (!sbInstance.current || !currentUser || !targetUserId) {
      console.error("Cannot start chat: SDK not initialized or target user ID missing.");
      setError("채팅 시작 실패: 시스템 오류");
      return;
    }
     if (currentUser.userId === targetUserId) {
        setError("자신과 채팅을 시작할 수 없습니다.");
        return;
     }

    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting to create or get channel with user ID: ${targetUserId}`);
      const params = {
        invitedUserIds: [targetUserId],
        isDistinct: true,
      };

       const newChannel: GroupChannel = await sbInstance.current.groupChannel.createChannel(params);

      console.log('Channel created or retrieved successfully:', newChannel);

      setChannels(prevChannels => {
          if (!prevChannels.find(ch => ch.url === newChannel.url)) {
              return [newChannel, ...prevChannels];
          }
          return prevChannels;
      });

      await handleOpenChatModal(newChannel.url);

    } catch (e: any) {
      console.error("Failed to create or get channel:", e);
      setError(`채팅 시작 실패: ${e.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      {loading && <div className="loading">Sendbird 로딩 중...</div>}
      {error && <div className="error">오류: {error}</div>}

      {!loading && !error && isListModalVisible && (
        <div className="modal-overlay">
          <div className="chat-list-modal">
            <div className="chat-list-header">
              <h2>채팅 목록</h2>
              <button className="exit-btn" onClick={handleCloseListModal}>
                닫기
              </button>
            </div>

            <div className="new-chat-section">
                <h3>새로운 채팅 시작</h3>
                <input
                    type="text"
                    placeholder="사용자 ID 입력"
                    value={searchedUserId}
                    onChange={(e) => setSearchedUserId(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchUser(); }}
                />
                <button onClick={handleSearchUser} disabled={isSearching || !isSendbirdInitialized}>
                    {isSearching ? '검색 중...' : '사용자 검색'}
                </button>
                {searchError && <p className="search-error">{searchError}</p>}

                {foundUser && (
                    <div className="found-user">
                        <img
                           src={foundUser.profileUrl || "/profile-placeholder.jpg"}
                           alt={foundUser.nickname || foundUser.userId}
                           className="profile-icon"
                        />
                        <span>{foundUser.nickname || foundUser.userId}</span>
                        <button
                            onClick={() => handleStartNewChat(foundUser.userId)}
                            disabled={currentUser?.userId === foundUser.userId || loading || !isSendbirdInitialized}
                        >
                            채팅 시작
                        </button>
                    </div>
                )}
            </div>

            <ul className="chat-list">
              {channels.map((channel) => {
                const isOneToOne = channel.isGroupChannel && channel.memberCount === 2;
                let otherUser: User | null = null;
                if (isOneToOne && channel.members && currentUser) {
                  otherUser = channel.members.find(
                    (member) => member.userId !== currentUser.userId
                  ) || null;
                }

                const displayName = otherUser?.nickname || channel.name || channel.url;
                const displayImage = otherUser?.profileUrl || channel.coverUrl || "/profile-placeholder.jpg";

                return (
                  <li
                    key={channel.url}
                    onClick={() => handleOpenChatModal(channel.url)}
                  >
                    <img src={displayImage} alt={displayName} />
                    <div className="chat-info">
                      <strong>{displayName}</strong>
                      <p>
                         {channel.lastMessage && (channel.lastMessage as UserMessage).message ? (channel.lastMessage as UserMessage).message : "대화 시작"}
                      </p>
                    </div>
                  </li>
                );
              })}
              {channels.length === 0 && !loading && !error && <p>채널이 없습니다.</p>}
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && isChatModalVisible && currentChannel && currentUser && (
        <div className="modal-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <div className="chat-header-left">
                 {currentChannel.isGroupChannel && currentChannel.memberCount === 2 && currentChannel.members && currentUser ?
                   currentChannel.members.find(member => member.userId !== currentUser.userId)?.nickname || currentChannel.name || currentChannel.url
                   : currentChannel.name || currentChannel.url
                 }
              </div>
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
                      {(msg.sender !== currentUser.userId) && (
                        <img
                          src={'/profile-placeholder.jpg'}
                          alt="상대방"
                          className="profile-icon"
                        />
                      )}
                      <div
                        className={`message ${msg.sender === currentUser.userId ? 'me-message' : 'you-message'}`}
                      >
                        {msg.message?.split("\n").map((line, i) => (
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
                                <button type="submit">결제 완료</button>
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
              <button onClick={handleSendMessage} disabled={loading || !currentChannel}>전송</button>
              <button onClick={handleSecurePaymentRequest} disabled={loading || !currentChannel}>
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
