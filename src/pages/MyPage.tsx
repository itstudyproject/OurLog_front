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

interface MyPostItem extends PostDTO {
  liked?: boolean;
  imageUrl?: string;
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

  useEffect(() => {
    if (userId === null) return; // 로그인 안했으면 데이터 로드 안함

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
          const res = await fetch(`${baseUrl}/followers/getPost/${userId}`, {
            method: "GET",
            headers: headers,
          });
          if (!res.ok) throw new Error("내 게시글 불러오기 실패");
          const allUserPosts: PostDTO[] = await res.json();
          fetchedPosts = allUserPosts.filter(post => post.boardNo === 5);

        } else if (activeTab === 'bookmark') {
          // 북마크 목록 가져오기 (API 가정: /favorites/getFavorites/{userId})
           // ✅ 중요: 백엔드에 북마크 목록을 가져오는 명시적인 API가 있는지 확인 필요. 없을 시 구현 방식 변경 필요.
           // 현재는 `/ourlog/favorites/getFavorites/{userId}`가 게시글 목록을 반환한다고 가정합니다.
          const res = await fetch(`${baseUrl}/favorites/getFavorites/${userId}`, {
             method: "GET",
             headers: headers,
           });
           if (!res.ok) {
               // 404 등 오류 발생 시 빈 배열 반환 또는 에러 처리
               if (res.status === 404) {
                   console.warn(`북마크 목록 API가 존재하지 않거나 해당 유저의 북마크가 없음: ${res.status}`);
                   fetchedPosts = [];
               } else {
                   throw new Error(`북마크 목록 불러오기 실패: ${res.status}`);
               }
           } else {
               fetchedPosts = await res.json(); // API 응답이 PostDTO 배열이라고 가정
           }

        } else {
          setLoadingList(false);
          return; // 구매/입찰, 판매 목록은 여기서 처리하지 않음
        }

        // 각 게시글에 이미지 URL, 최신 좋아요 수, 사용자의 좋아요 상태 추가
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

            // 최신 좋아요 수 가져오기
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

               // 사용자의 좋아요 상태 가져오기
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
                   userLiked = statusData === true; // API 응답 형태에 따라 조정
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

    fetchPosts();

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

   // ✅ 좋아요 토글 함수 (ArtList/WorkerPage 참고)
   const handleLikeToggle = async (post: MyPostItem) => {
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
         // 북마크 탭에서 좋아요 취소 시 목록에서 제거 (선택 사항)
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

  const handleCardClick = (postId: number | undefined | null) => {
    if (postId !== undefined && postId !== null) {
      navigate(`/Art/${postId}`);
    } else {
      console.warn("Invalid postId for navigation");
    }
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
            src={profile?.thumbnailImagePath || "/images/mypage/default.png"}
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
         {/* ✅ '나의 글/아트' 탭 추가 */}
        <button
          className={`mp-sub-tab ${activeTab === 'my-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-posts')}
        >
          나의 글/아트
        </button>
        {/* ✅ '북마크' 탭 활성화 */}
        <button
          className={`mp-sub-tab ${activeTab === 'bookmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmark')}
        >
          북마크
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

  {location.pathname === '/mypage/account/edit' && userId && <AccountEdit userId={userId} />}
  {location.pathname === '/mypage/account/edit' && !userId && <p>로그인이 필요합니다.</p>}

  {location.pathname === '/mypage/account/delete' && userId && <AccountDelete userId={userId} />}
   {location.pathname === '/mypage/account/delete' && !userId && <p>로그인이 필요합니다.</p>}

  {!hideMenu && !isProfileEditRoute && (
    <>
      {activeTab === 'purchase-bid' && userId && <BidHistory userId={userId} />}
      {activeTab === 'purchase-bid' && !userId && <p>로그인이 필요합니다.</p>}

      {activeTab === 'sale' && <p>판매목록/현황 내용 (추후 구현)</p>}

      {(activeTab === 'my-posts' || activeTab === 'bookmark') && (
        loadingList ? (
          <div className="mp-loading"><p>목록을 불러오는 중...</p></div>
        ) : (activeTab === 'my-posts' && myPosts.length === 0) || (activeTab === 'bookmark' && bookmarkedPosts.length === 0) ? (
          <div className="mp-no-content"><p>{activeTab === 'my-posts' ? '작성한 글/아트가 없습니다.' : '북마크한 글/아트가 없습니다.'}</p></div>
        ) : (
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
      )}

    </>
  )}
   {!userId && hideMenu && <p>로그인이 필요합니다.</p>} {/* 숨겨진 메뉴 상태에서도 로그인 필요 메시지 */}
</div>

    </div>
  );
};

export default MyPage;