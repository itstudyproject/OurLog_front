// src/pages/MyPage.tsx

import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import "../styles/WorkerPage.css";
import "../styles/PurchaseBidPage.css";
import "../styles/MyPage.css";
// BidHistory 컴포넌트 임포트
import BidHistory from "./Art/BidHistory";

import {
  fetchProfile,
  updateProfile,
  UserProfileDTO,
} from "../hooks/profileApi";
import AccountEdit from "./AccountEdit";
import ProfileEdit from "./ProfileEdit";
import AccountDelete from "./AccountDelete";
import { PostDTO } from "../types/postTypes";
import { getAuthHeaders, hasToken } from "../utils/auth"; // 인증 헤더 가져오기 함수 임포트

interface MyPostItem extends PostDTO {
  liked?: boolean;
  imageUrl?: string;
}

// ✅ 판매 목록 항목에 대한 인터페이스 수정: tradeStatus 타입을 boolean으로 변경
// 백엔드 API 응답에 맞춰 수정 필요
interface SaleEntry {
  tradeId: number; // 거래 ID
  postId: number; // 게시글 ID (판매되는 아트의 ID)
  postTitle?: string; // 게시글 제목
  postImage?: string; // 게시글 대표 이미지 경로
  startPrice: number; // 시작가
  highestBid: number; // 현재 최고 입찰가 (판매 진행 중인 경우) 또는 낙찰가 (판매 완료된 경우)
  nowBuy: number | null; // 즉시 구매가
  tradeStatus: boolean; // 거래 상태 (true: 종료, false: 진행 중) - ✅ boolean으로 수정
  lastBidTime?: string; // 마지막 입찰 시간 또는 경매 종료 시간
  bidderId?: number; // 현재 최고 입찰자 ID
  bidderNickname?: string; // 현재 최고 입찰자 닉네임
  startBidTime?: string; // 경매 시작 시간
  sellerId: number; // 판매자 ID
}


// ✅ 이미지 서빙을 위한 백엔드 베이스 URL 추가 (필요에 따라 수정하세요)
const imageBaseUrl = `http://localhost:8080/ourlog/picture/display/`; // 예시 경로, 실제 백엔드 경로에 맞게 수정 필요
const baseUrl = "http://localhost:8080/ourlog";

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stored = localStorage.getItem("user");
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [activeTab, setActiveTab] = useState<'purchase-bid' | 'sale' | 'bookmark' | 'my-posts'>('purchase-bid');
  const [myPosts, setMyPosts] = useState<MyPostItem[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<MyPostItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  // ✅ 판매 목록 상태 추가
  const [sellingPosts, setSellingPosts] = useState<SaleEntry[]>([]);
  const [soldPosts, setSoldPosts] = useState<SaleEntry[]>([]);
  const [loadingSales, setLoadingSales] = useState(false); // 판매 목록 로딩 상태
  const [currentTime, setCurrentTime] = useState(new Date()); // 남은 시간 계산용

  useEffect(() => {
    console.log("stored:" + stored);
    console.log("userId:" + userId);
    if (userId === null) { // userId가 null이면 프로필 로드 시도 안함
       setProfile(null);
       return;
    }
    console.log(Boolean(userId));
    fetchProfile(userId)
      .then(setProfile)
      .catch((err) => console.error(err));
  }, [userId]);

  // ✅ activeTab이 'sale'일 때 판매 목록을 가져오는 effect 추가
  useEffect(() => {
    if (userId === null) {
      setSellingPosts([]);
      setSoldPosts([]);
      return;
    }

    const fetchSales = async () => {
      setLoadingSales(true);
      try {
        const headers = getAuthHeaders();
         if (!headers) {
           console.error("인증 헤더 없음. 로그인 필요.");
           setSellingPosts([]);
           setSoldPosts([]);
           setLoadingSales(false);
           // navigate("/login"); // 필요하다면 로그인 페이지로 리다이렉트
           return;
         }

        // ✅ 판매 목록 API 호출 (가정된 경로)
        const res = await fetch(`${baseUrl}/profile/sales/${userId}`, {
          method: "GET",
          headers: headers,
        });

        if (!res.ok) {
            if (res.status === 404) {
                 console.warn(`판매 목록 API가 존재하지 않거나 해당 유저의 판매글이 없음: ${res.status}`);
                 setSellingPosts([]);
                 setSoldPosts([]);
            } else {
               throw new Error(`판매 목록 불러오기 실패: ${res.status}`);
            }
        } else {
            // ✅ API 응답이 SaleEntry 배열이라고 가정하고 처리
            const data: SaleEntry[] = await res.json();
            console.log("판매 목록 API 응답 데이터:", data); // API 응답 데이터 로깅 추가

            // 응답이 배열인지 확인하고 tradeStatus로 목록 분리
            if (Array.isArray(data)) {
                // ✅ tradeStatus가 boolean 값에 맞게 필터링 로직 수정
                const selling = data.filter(item => item.tradeStatus === false); // false: 진행 중 (백엔드 boolean 기준)
                const expired = data.filter(item => item.tradeStatus === true); // true: 기간 만료 (판매 완료 또는 유찰)
                setSellingPosts(selling);
                setSoldPosts(expired);
                console.log("판매 목록 상태 업데이트 - sellingPosts:", selling);
                console.log("판매 목록 상태 업데이트 - expiredPosts:", expired);
            } else {
                 console.error("Unexpected sales API response structure:", data); // 이 메시지가 다시 뜨면 다른 구조임
                 alert("판매 목록 데이터 형식이 올바르지 않습니다.");
                 setSellingPosts([]);
                 setSoldPosts([]);
            }
        }

      } catch (err) {
        console.error("❌ 판매 목록 불러오기 실패:", err);
        setSellingPosts([]);
        setSoldPosts([]);
      } finally {
        setLoadingSales(false);
      }
    };

    // 'sale' 탭일 때만 판매 목록을 가져옴
    if (activeTab === 'sale') {
      fetchSales();
    } else {
      // 다른 탭으로 이동 시 판매 목록 상태 초기화 (선택 사항)
      setSellingPosts([]);
      setSoldPosts([]);
    }

  }, [userId, activeTab]); // userId 또는 activeTab 변경 시 데이터 다시 로드

  // ✅ 남은 시간 표시를 위한 현재 시간 업데이트 (판매 중인 경매 목록이 있을 때만)
   useEffect(() => {
    if (activeTab === 'sale' && sellingPosts.length > 0) {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }
   }, [activeTab, sellingPosts]); // activeTab 또는 sellingPosts 변경 시 타이머 재설정


  useEffect(() => {
    if (userId === null) return; // 로그인 안했으면 데이터 로드 안함

    // 판매 목록은 별도의 effect에서 처리하므로, 여기서는 'my-posts'와 'bookmark'만 처리
    if (activeTab !== 'my-posts' && activeTab !== 'bookmark') {
       setMyPosts([]);
       setBookmarkedPosts([]);
       setLoadingList(false);
       return;
    }

    setLoadingList(true);

    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        let fetchedPosts: PostDTO[] = [];

        if (activeTab === 'my-posts') {
          // 내 글 목록 가져오기 (boardNo 5 필터링 포함)
          // ✅ 기존 내 글/아트 로직 유지
          const res = await fetch(`${baseUrl}/followers/getPost/${userId}`, {
            method: "GET",
            headers: headers,
          });
          if (!res.ok) throw new Error("내 게시글 불러오기 실패");
          const allUserPosts: PostDTO[] = await res.json();
          fetchedPosts = allUserPosts.filter(post => post.boardNo === 5); // boardNo 5만 필터링

        } else if (activeTab === 'bookmark') {
           // 관심목록 목록 가져오기 (백엔드에서 PostDTO[] 반환)
           // ✅ 기존 관심목록 로직 유지
           const res = await fetch(`${baseUrl}/favorites/user/${userId}`, {
              method: "GET",
              headers: headers,
            });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn(`관심목록 목록 API가 존재하지 않거나 해당 유저의 관심목록가 없음: ${res.status}`);
                    fetchedPosts = [];
                } else {
                    throw new Error(`관심목록 목록 불러오기 실패: ${res.status}`);
                }
            } else {
                fetchedPosts = await res.json();
            }

        }

        // 각 게시글에 이미지 URL, 최신 좋아요 수, 사용자의 좋아요 상태 추가
        // ✅ 좋아요 관련 로직은 내 글 목록, 관심목록에만 적용되도록 유지
        const postsWithDetails = await Promise.all(
          fetchedPosts.map(async (post) => {
            const imagePath = post.pictureDTOList && post.pictureDTOList.length > 0
              ? post.pictureDTOList[0].resizedImagePath ||
                post.pictureDTOList[0].thumbnailImagePath ||
                post.pictureDTOList[0].originImagePath
              : null;

            const imageUrl = imagePath ? `${imageBaseUrl}${imagePath}` : "/default-image.png";

            let latestFavoriteCnt = post.favoriteCnt ?? 0; // 초기값
            let userLiked = false; // 초기값

            // 최신 좋아요 수 가져오기 (my-posts 및 bookmark에만 해당)
             if (post.postId !== undefined && post.postId !== null) {
               try {
                 const countResponse = await fetch(
                   `${baseUrl}/favorites/count/${post.postId}`,
                   {
                     method: "GET",
                     headers: headers,
                   }
                 );
                 if (countResponse.ok) {
                   const countData = await countResponse.json();
                   if (typeof countData === "number") {
                     latestFavoriteCnt = countData;
                   } else if (countData && typeof countData.count === "number") {
                      latestFavoriteCnt = countData.count;
                   }
                 }
               } catch (countError) {
                 console.error(`❌ ${activeTab} 좋아요 수 불러오기 오류: post ${post.postId}`, countError);
               }

                // 사용자의 좋아요 상태 가져오기 (my-posts 및 bookmark에만 해당)
                try {
                  const likeStatusResponse = await fetch(
                    `${baseUrl}/favorites/${userId}/${post.postId}`,
                    {
                      method: "GET",
                      headers: headers,
                    }
                  );
                  if (likeStatusResponse.ok) {
                    const statusData = await likeStatusResponse.json();
                    userLiked = statusData === true;
                  } else {
                    console.warn(`❌ ${activeTab} 사용자 좋아요 상태 불러오기 실패 (${likeStatusResponse.status}) for post ${post.postId}`);
                  }
                } catch (likeError) {
                  console.error(`❌ ${activeTab} 사용자 좋아요 상태 불러오기 오류: post ${post.postId}`, likeError);
                }
             }


            return { ...post, favoriteCnt: latestFavoriteCnt, liked: userLiked, imageUrl: imageUrl };
          })
        );

        if (activeTab === 'my-posts') {
          setMyPosts(postsWithDetails);
        } else if (activeTab === 'bookmark') {
          setBookmarkedPosts(postsWithDetails);
        }

      } catch (err) {
        console.error(`❌ ${activeTab} 목록 불러오기 실패:`, err);
        if (activeTab === 'my-posts') {
           setMyPosts([]);
         } else if (activeTab === 'bookmark') {
           setBookmarkedPosts([]);
         }
      } finally {
        setLoadingList(false);
      }
    };

    // 'my-posts' 또는 'bookmark' 탭일 때만 게시글 목록을 가져옴
    if (activeTab === 'my-posts' || activeTab === 'bookmark') {
       fetchPosts();
    }


  }, [userId, activeTab]); // userId 또는 activeTab 변경 시 데이터 다시 로드

  const hideMenu = [
    "/mypage/account/edit",
    "/mypage/account/delete",
  ].some((path) => location.pathname.startsWith(path));

  const isProfileEditRoute = location.pathname === '/mypage/edit';

  const handleBackFromEdit = () => {
    navigate('/mypage');
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfileDTO>) => {
    if (userId === null) {
      alert("유저 정보가 없습니다.");
      return Promise.reject("유저 정보 없음");
    }
    try {
      await updateProfile(userId, updatedData);
      await fetchProfile(userId).then(setProfile);
      console.log("프로필 업데이트 성공");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
      return Promise.reject(error);
    }
  };

   // ✅ 좋아요 토글 함수 (ArtList/WorkerPage 참고) - my-posts 및 bookmark 탭에서만 사용
   const handleLikeToggle = async (post: MyPostItem) => {
    // ✅ 좋아요 로직이 판매 목록에 영향 주지 않도록 분리
    if (activeTab !== 'my-posts' && activeTab !== 'bookmark') {
        console.warn("좋아요 토글은 내 글 목록 또는 관심목록 탭에서만 가능합니다.");
        return;
    }

    if (userId === null || post.postId === undefined || post.postId === null) {
      alert("로그인이 필요하거나 작품 정보가 없습니다.");
      navigate("/login"); // 로그인 필요 시 이동
      return;
    }

    const token = localStorage.getItem("token");

    // Optimistic UI 업데이트
    const updateList = activeTab === 'my-posts' ? setMyPosts : setBookmarkedPosts;

    updateList(prevList =>
      prevList.map(item => {
        if (item.postId === post.postId) {
          const newLiked = !(item.liked ?? false);
          const newFavoriteCnt = (item.favoriteCnt ?? 0) + (newLiked ? 1 : -1);
          return {
            ...item,
            liked: newLiked,
            favoriteCnt: newFavoriteCnt,
          };
        }
        return item;
      })
    );

    try {
      const result = await fetch(`${baseUrl}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          postId: post.postId,
        }),
      });

      if (!result.ok) throw new Error("서버 응답 오류");

      const data = await result.json();

      // 백엔드 응답으로 최종 상태 업데이트 (좋아요 상태 및 카운트)
      if (typeof data.favoriteCount === "number") {
         updateList(prevList =>
           prevList.map(item =>
             item.postId === post.postId
               ? {
                 ...item,
                 liked: data.favorited,
                 favoriteCnt: data.favoriteCount,
               }
               : item
           )
         );
         // 관심목록 탭에서 좋아요 취소 시 목록에서 제거 (선택 사항)
         if (activeTab === 'bookmark' && !data.favorited) {
            updateList(prevList => prevList.filter(item => item.postId !== post.postId));
         }
      }

    } catch (error) {
      console.error(`좋아요 처리 실패: ${post.postId}`, error);

      // 실패 시 optimistic rollback
      updateList(prevList =>
        prevList.map(item => {
          if (item.postId === post.postId) {
             // optimistic update 이전 상태로 롤백 (좋아요 상태와 카운트)
            const rolledBackLiked = !(item.liked ?? false);
            const rolledBackFavoriteCnt = (item.favoriteCnt ?? 0) + (rolledBackLiked ? 1 : -1);
            return {
              ...item,
              liked: rolledBackLiked,
              favoriteCnt: rolledBackFavoriteCnt,
            };
          }
          return item;
        })
      );
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // ✅ 작품 상세 페이지 이동 함수 (postId 사용) - 모든 탭에서 재활용 가능
  const handleCardClick = (postId: number | undefined | null) => {
    if (postId !== undefined && postId !== null) {
      navigate(`/Art/${postId}`);
    } else {
      console.warn("Invalid postId for navigation");
    }
  };

  // ✅ 남은 시간 계산 및 포맷팅 함수 (판매 목록용)
   const getRemainingTime = (endTimeString: string | undefined) => {
    if (!endTimeString) return "시간 정보 없음";

    const endTime = new Date(endTimeString);
    const now = new Date(currentTime);

    const durationMs = endTime.getTime() - now.getTime();

    if (durationMs <= 0) {
      return "경매 종료";
    }

    const seconds = Math.floor(durationMs / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let timeString = "";
    if (days > 0) timeString += `${days}일 `;
    if (hours > 0 || days > 0) timeString += `${hours}시간 `;
    if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}분 `;
    timeString += `${remainingSeconds}초`;

    return `남은 시간: ${timeString.trim()}`;
  };

  // ✅ 원본 이미지 다운로드 함수 (판매 완료 항목용)
   const handleDownloadOriginal = (e: React.MouseEvent, item: SaleEntry) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    if (!item.postImage) {
      alert("다운로드할 이미지가 없습니다.");
      return;
    }

    // postImage 경로가 이미 /ourlog/picture/display/ 를 포함하고 있는지 확인
    const imageUrl = item.postImage.startsWith('/ourlog')
        ? `http://localhost:8080${item.postImage}`
        : `${imageBaseUrl}${item.postImage}`; // 포함하지 않으면 base url 추가

    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', `${item.postTitle || item.postId}_original.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="mp-container">
      <div className="mp-page-title">
        <h2>마이페이지</h2>
      </div>

      <div className="mp-profile-section">
        <div
          className="mp-profile-image"
        >
          <img
            src={profile?.thumbnailImagePath || "/images/mypage.png"}
            alt="프로필"
          />
        </div>
        <div className="mp-profile-details">
          <h3>{profile?.nickname || "로딩 중..."}</h3>
          <div className="mp-follow-stats">
            <p>팔로워: {profile?.followCnt ?? 0}</p>
            <p>팔로잉: {profile?.followingCnt ?? 0}</p>
          </div>
          <div className="mp-profile-actions">
            <button
              className="mp-button primary"
              onClick={() => navigate("/mypage/edit")}
            >
              프로필수정
            </button>
            <button
              className="mp-button primary"
              onClick={() => navigate("/mypage/account/edit")}
            >
              회원정보수정
            </button>
            {userId !== null && (
              <button
                className="mp-button primary"
                onClick={() => navigate("/chat")}
              >
                채팅 목록
              </button>
            )}
            <button
              className="mp-button danger"
              onClick={() => navigate("/mypage/account/delete")}
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

       {!hideMenu && !isProfileEditRoute && (
        <>
      <div className="mp-section-title">
        <h2>메뉴</h2>
      </div>

      <div className="mp-sub-tab-nav">
        <button
          className={`mp-sub-tab ${activeTab === 'purchase-bid' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase-bid')}
        >
          구매/입찰목록
        </button>
        <button
          className={`mp-sub-tab ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('sale')}
        >
          판매목록/현황
        </button>
         {/* ✅ '내 글 목록' 탭 추가 */}
        <button
          className={`mp-sub-tab ${activeTab === 'my-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-posts')}
        >
          내 글 목록
        </button>
        {/* ✅ '관심목록' 탭 활성화 */}
        <button
          className={`mp-sub-tab ${activeTab === 'bookmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmark')}
        >
          관심목록
        </button>
      </div>
      </>
       )}

<div className="mp-tab-content">
  {isProfileEditRoute && (
    <ProfileEdit
      profile={profile}
      onBack={handleBackFromEdit}
      onSave={handleSaveProfile}
    />
  )}

  {location.pathname === '/mypage/account/edit' && userId && <AccountEdit />}
  {location.pathname === '/mypage/account/edit' && !userId && <p>로그인이 필요합니다.</p>}

  {location.pathname === '/mypage/account/delete' && userId && <AccountDelete />}
   {location.pathname === '/mypage/account/delete' && !userId && <p>로그인이 필요합니다.</p>}

  {!hideMenu && !isProfileEditRoute && (
    <>
      {/* ✅ 구매/입찰 목록 탭 내용 - BidHistory 컴포넌트 사용 */}
      {activeTab === 'purchase-bid' && userId && <BidHistory userId={userId} />}
      {activeTab === 'purchase-bid' && !userId && <p>로그인이 필요합니다.</p>}

      {/* ✅ 판매목록/현황 탭 내용 */}
      {activeTab === 'sale' && (
        userId ? (
          loadingSales ? (
            <div className="mp-loading"><p>판매 목록을 불러오는 중...</p></div>
          ) : sellingPosts.length === 0 && soldPosts.length === 0 ? (
             <div className="mp-no-content"><p>판매 내역이 없습니다.</p></div>
          ) : (
            <div className="mp-sale-trade-lists-wrapper">
              {/* 현재 진행 중인 경매 목록 */}
              <div className="mp-list-section mp-current-sales-section">
                <h3>현재 판매 중인 경매</h3>
                <div className="mp-list">
                  {sellingPosts.length > 0 ? (
                    sellingPosts.map((item) => (
                      <div
                         key={item.tradeId}
                         className="mp-item data"
                         onClick={() => handleCardClick(item.postId)}
                         style={{ cursor: "pointer" }}
                      >
                         <div className="mp-item-thumbnail">
                           {item.postImage ? (
                             <img
                               src={item.postImage.startsWith('/ourlog') ? `http://localhost:8080${item.postImage}` : `${imageBaseUrl}${item.postImage}`}
                               alt={item.postTitle || "Artwork"}
                             />
                           ) : (
                             <div className="mp-no-image-placeholder-small">🖼️</div>
                           )}
                         </div>
                         <div className="mp-item-details">
                           <div className="mp-item-title">{item.postTitle || "제목 없음"}</div>
                           <div className="mp-item-price">현재 최고 입찰가: {item.highestBid != null ? item.highestBid.toLocaleString() : "입찰 없음"}원</div>
                           <div className="mp-item-time">
                             {getRemainingTime(item.lastBidTime)}
                           </div>
                         </div>
                         <div className="mp-item-status">판매 중</div>
                      </div>
                    ))
                  ) : (
                    <div className="mp-no-bids">현재 판매 중인 경매가 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 기간 만료된 경매 목록 */}
              <div className="mp-list-section mp-expired-sales-section">
                 <h3>기간 만료된 경매</h3>
                 <div className="mp-list">
                   {soldPosts.length > 0 ? (
                     soldPosts.map((item) => (
                       <div
                         key={item.tradeId}
                         className={`mp-item data ${item.bidderId ? 'sold' : 'failed'}`}
                         onClick={() => handleCardClick(item.postId)}
                         style={{ cursor: "pointer" }}
                       >
                          <div className="mp-item-thumbnail">
                            {item.postImage ? (
                              <img
                                src={item.postImage.startsWith('/ourlog') ? `http://localhost:8080${item.postImage}` : `${imageBaseUrl}${item.postImage}`}
                                alt={item.postTitle || "Artwork"}
                              />
                            ) : (
                              <div className="mp-no-image-placeholder-small">🖼️</div>
                            )}
                          </div>
                          <div className="mp-item-details">
                            <div className="mp-item-title">{item.postTitle || "제목 없음"}</div>
                            <div className="mp-item-price">
                              {item.bidderId ? (
                                <>판매가: {item.highestBid != null ? item.highestBid.toLocaleString() : "가격 정보 없음"}원</>
                              ) : (
                                <>최고 입찰가: {item.highestBid != null ? item.highestBid.toLocaleString() : "입찰 없음"}원</>
                              )}
                            </div>
                            <div className="mp-item-time">
                              {item.bidderId ? (
                                item.bidderNickname ? `구매자: ${item.bidderNickname}` : '구매자 정보 없음'
                              ) : (
                                item.lastBidTime
                                  ? "경매 종료 시간: " + new Date(item.lastBidTime).toLocaleString()
                                  : "시간 정보 없음"
                              )}
                            </div>
                          </div>
                           <div className="mp-item-status-container">
                             <div className={`mp-item-status ${item.bidderId ? 'sold' : 'failed'}`}>
                               {item.bidderId ? "판매 완료" : "유찰"}
                             </div>
                             {/* 판매자가 올린 글이므로 다운로드 버튼 제거 */}
                           </div>
                       </div>
                     ))
                   ) : (
                     <div className="mp-no-bids">기간 만료된 경매가 없습니다.</div>
                   )}
                 </div>
              </div>
            </div>
          )
        ) : (
           <p>로그인이 필요합니다.</p>
        )
      )}

      {/* ✅ 내 글 목록 또는 관심목록 탭 내용 */}
      {(activeTab === 'my-posts' || activeTab === 'bookmark') && (
        userId ? ( // userId가 있을 때만 내용 표시
        loadingList ? (
          <div className="mp-loading"><p>목록을 불러오는 중...</p></div>
        ) : (activeTab === 'my-posts' && myPosts.length === 0) || (activeTab === 'bookmark' && bookmarkedPosts.length === 0) ? (
          <div className="mp-no-content"><p>{activeTab === 'my-posts' ? '작성한 글/아트가 없습니다.' : '관심목록한 글/아트가 없습니다.'}</p></div>
        ) : (
          // ✅ 기존 그리드 레이아웃 유지
          <div className="mp-tab-content-grid worker-gallery"> {/* WorkerPage의 Grid 스타일 재활용 */}
            {(activeTab === 'my-posts' ? myPosts : bookmarkedPosts).map(post => (
               <div
                key={post.postId}
                className="mp-card worker-card" // WorkerPage의 카드 스타일 재활용
                onClick={() => handleCardClick(post.postId)}
                style={{ cursor: "pointer", position: "relative" }} // 필요한 인라인 스타일 유지
              >
                <figure className="mp-card-image-wrapper worker-card-image-wrapper"> {/* 이미지 wrapper 스타일 재활용 */}
                  <img
                    src={post.imageUrl || "/default-image.png"}
                    alt={`작품 ${post.postId}`}
                    className="mp-card-image worker-card-image" // 이미지 스타일 재활용
                  />
                  {/* ✅ 좋아요 버튼 추가 (WorkerPage 참고) */}
                   {userId !== null && post?.postId !== undefined && post?.postId !== null && (
                    <button
                      className={`mp-like-button worker-like-button ${post.liked ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 div의 클릭 이벤트 방지
                        handleLikeToggle(post);
                      }}
                    >
                      {post.liked ? "🧡" : "🤍"} <span>{post.favoriteCnt ?? 0}</span>
                    </button>
                   )}
                </figure>
                <div className="mp-card-body worker-card-body"> {/* 카드 바디 스타일 재활용 */}
                  <h2 className="mp-card-title worker-card-title">{post.title || '제목 없음'}</h2>
                </div>
              </div>
            ))}
          </div>
        )
        ) : ( // userId가 없을 때
           <p>로그인이 필요합니다.</p>
        )
      )}

    </>
  )}
   {!userId && hideMenu && <p>로그인이 필요합니다.</p>} {/* 숨겨진 메뉴 상태에서도 로그인 필요 메시지 */}
</div>

    </div>
  );
};

export default MyPage;