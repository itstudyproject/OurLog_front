import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";
import { getToken } from "../utils/auth";
import SendbirdChat from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule, GroupChannel, GroupChannelListQuery, PublicGroupChannelListQuery, MessageCollection, MessageCollectionInitPolicy, MessageCollectionEventHandler, GroupChannelEventContext } from '@sendbird/chat/groupChannel';
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

  const [isSendbirdInitialized, setIsSendbirdInitialized] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<{
    [key: string]: ChatMessage[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [channels, setChannels] = useState<GroupChannel[]>([]);

  // 공개 채널 목록 상태 추가
  const [publicChannels, setPublicChannels] = useState<GroupChannel[]>([]);
  const [publicChannelsLoading, setPublicChannelsLoading] = useState(false);
  const [publicChannelsError, setPublicChannelsError] = useState<string | null>(null);

  // 채널 생성 모달 상태 추가
  const [isCreateChannelModalVisible, setIsCreateChannelModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');


  const [currentChannel, setCurrentChannel] = useState<GroupChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchedUserId, setSearchedUserId] = useState<string>("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 사용자 ID별 프로필 정보를 저장할 상태 추가
  const [userProfiles, setUserProfiles] = useState<{ [userId: string]: UserProfileDTO }>({});


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

        // 채널 목록 로드 후 각 채널의 상대방 프로필 정보를 가져옵니다.
        const profilePromises = channels.map(async channel => {
             if (channel.isGroupChannel && channel.members && user) {
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
                 if (channel.isGroupChannel) {
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
                 if (channel.isGroupChannel) {
                     const groupChannel = channel as GroupChannel;
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
                    setCurrentChannel(null);
                    setIsChatModalVisible(false);
                    setMessagesByUser(prev => {
                      const newState = { ...prev };
                      delete newState[channelUrl];
                      return newState;
                    });
                     if (messageCollectionRef.current?.channel.url === channelUrl) {
                        messageCollectionRef.current.dispose();
                        messageCollectionRef.current = null;
                        console.log(`MessageCollection disposed for deleted channel: ${channelUrl}`);
                    }
                }
              },
               onMessageUpdated: (channel: BaseChannel, message: BaseMessage) => {
                   console.log('Message updated:', channel, message);
                    if (channel.isGroupChannel) {
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
    };
  }, [navigate]);

  useEffect(() => {
      const fetchOtherUserProfile = async () => {
          if (currentChannel && currentChannel.isGroupChannel && (currentChannel as GroupChannel).members && currentUser) {
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


  const handleOpenChatModal = async (channelUrl: string) => {
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

        console.log('Initializing MessageCollection for channel:', channelUrl);

        const collection = channel.createMessageCollection({
          limit: 100,
        });

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
            if (error && (error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error))) {
              console.error(`[${channel.url}] MessageCollection: Error loading messages from API`, error);
              setError(`채널 메시지 로딩 실패: ${error.message || '알 수 없는 API 오류 발생'}`);
            } else if (Array.isArray(messages) && messages.length >= 0) { // API 결과가 메시지 배열인 경우 (비어 있을 수도 있음)
                console.log(`[${channel.url}] MessageCollection: API returned ${messages.length} messages successfully.`);
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
                    console.error("Failed to parse API message data in collection handler:", e);
                  }
                  return baseMessage;
                });
                setMessagesByUser(prev => ({
                    ...prev,
                    [channel.url]: formattedMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
                }));
                console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에 API 메시지 설정 완료.`, messagesByUser);
            } else if (Array.isArray(error) && error.length > 0) { // error 객체에 메시지 배열이 담겨온 경우 처리
                console.log(`[${channel.url}] MessageCollection: API returned ${error.length} messages unexpectedly in error parameter. Processing.`);
                 const formattedMessages = error.map((msg: BaseMessage) => { // error 배열의 요소가 메시지 타입인지 확인
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
                     console.error("Failed to parse API message data in collection handler (error param):", e);
                   }
                   return baseMessage;
                 });
                  setMessagesByUser(prev => ({
                     ...prev,
                     [channel.url]: formattedMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
                 }));
                 console.log(`[${channel.url}] MessageCollection: messagesByUser 상태에 API 메시지 (오류 매개변수) 설정 완료.`, messagesByUser);
            }
            else { // 그 외 예상치 못한 경우
              console.log(`[${channel.url}] MessageCollection: Received unexpected API result. Messages: ${messages}, Error: ${error}`);
              // 필요에 따라 여기서 추가 오류 처리 또는 로깅 가능
            }
          });


        messageCollectionRef.current = collection;


      } catch (messageError: any) {
        console.error('Failed to get channel or initialize MessageCollection:', messageError);
         setError(`채널 메시지 로딩 실패: ${messageError.message || '알 수 없는 오류 발생'}`);
         if (messageCollectionRef.current) {
             messageCollectionRef.current.dispose();
             messageCollectionRef.current = null;
             console.log("MessageCollection disposed due to error.");
         }
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
         setCardNumber("");
         alert("결제가 완료되었습니다.");
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

       const newChannel: GroupChannel = await sbInstance.current.groupChannel.createChannel(params);

      console.log('Channel created or retrieved successfully:', newChannel);

      setChannels(prevChannels => {
          if (!prevChannels.find(ch => ch.url === newChannel.url)) {
              return [newChannel, ...prevChannels];
          }
          return prevChannels;
      });

      // 새 채널 생성 또는 조회 후 해당 채널의 상대방 프로필 가져오기
      if (newChannel.isGroupChannel && (newChannel as GroupChannel).members && currentUser) {
         const groupChannel = newChannel as GroupChannel; // Cast to GroupChannel
         if (groupChannel.memberCount === 2) { // Now safe to access memberCount
            const otherUser = groupChannel.members.find(member => member.userId !== currentUser.userId);
         if (otherUser && !userProfiles[otherUser.userId]) {
              const backendUserId = parseInt(otherUser.userId, 10);
             if (!isNaN(backendUserId)) {
                 fetchProfile(backendUserId)
                    .then(profile => setUserProfiles(prev => ({ ...prev, [otherUser.userId]: profile })))
                    .catch(profileError => console.error(`Failed to fetch profile for user ${otherUser.userId} after starting chat:`, profileError));
             }
         }
      }
      }


      await handleOpenChatModal(newChannel.url);

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

  return (
    <div className="chat-page">
      {loading && <div className="loading">Sendbird 로딩 중...</div>}
      {error && <div className="error">오류: {error}</div>}

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
                      <li key={channel.url} className={channels.some(ch => ch.url === channel.url) ? 'joined' : ''}>
                           {/* 공개 채널 커버 이미지 또는 기본 이미지 표시 */}
                          <img className="channel-cover-image" src={channel.coverUrl || "/profile-placeholder.jpg"} alt={channel.name || channel.url} />
                          <div className="channel-info">
                              <strong>{channel.name || channel.url}</strong>
                              <p>{channel.memberCount} 명 참여 중</p>
                          </div>
                           {channels.some(ch => ch.url === channel.url) ? (
                               <button className="join-channel-btn" disabled>참여함</button>
                           ) : (
                               <button className="join-channel-btn" onClick={() => handleJoinPublicChannel(channel)} disabled={loading}>참여</button>
                           )}
                      </li>
                  ))}
              </ul>
           </div>


          <div className="my-chat-list-section">
              <h3>내 채팅 목록</h3>
              <ul className="chat-list">
              {channels.map((channel) => {
                  // Linter Error Fix applied here: ensure currentUser exists and use channel.isGroupChannel directly
                  const isOneToOne = currentUser && channel.isGroupChannel && (channel as GroupChannel).memberCount === 2;
                  let otherUser: User | null = null;
                  let otherUserProfile: UserProfileDTO | undefined = undefined;

                  if (isOneToOne && channel.isGroupChannel && (channel as GroupChannel).members) {
                    otherUser = (channel as GroupChannel).members.find(
                      (member) => currentUser && member.userId !== currentUser.userId // Check currentUser existence
                    ) || null;
                     // 상대방 사용자의 프로필 정보 가져오기
                     if(otherUser) {
                         otherUserProfile = userProfiles[otherUser.userId];
                     }
                  }

                  const displayName = otherUser?.nickname || channel.name || channel.url;
                  // 상대방 프로필 이미지 URL이 있으면 사용, 없으면 Sendbird 프로필 URL 또는 기본 이미지 사용
                  const displayImage = otherUserProfile?.thumbnailImagePath || otherUser?.profileUrl || channel.coverUrl || "/profile-placeholder.jpg";


                  return (
                    <li
                      key={channel.url}
                      onClick={() => handleOpenChatModal(channel.url)}
                    >
                      <img className="channel-cover-image" src={displayImage} alt={displayName} />
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

      {/* 채팅방 모달 섹션 - isChatModalVisible 상태에 따라 표시 */}
      {!loading && !error && isChatModalVisible && currentChannel && currentUser && (
        <div className="modal-overlay"> {/* 기존 modal-overlay 유지 */}
          <div className="chat-modal"> {/* 기존 chat-modal 유지 */}
            <div className="chat-header">
              <div className="chat-header-left">
                 {/* Linter Error Fix applied here: ensure currentUser exists and use currentChannel.isGroupChannel directly */}
                 {currentUser && currentChannel.isGroupChannel && (currentChannel as GroupChannel).memberCount === 2 && (currentChannel as GroupChannel).members ? // Check isGroupChannel property
                   // 현재 채널의 상대방 프로필 정보 가져오기
                   (currentChannel as GroupChannel).members.find(member => currentUser && member.userId !== currentUser.userId)?.nickname || currentChannel.name || currentChannel.url // Cast to GroupChannel
                   : currentChannel.name || currentChannel.url
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
    </div>
  );
};

export default ChatPage;
