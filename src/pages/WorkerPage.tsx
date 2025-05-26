import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WorkerPage.css";
import { fetchProfile, UserProfileDTO } from "../hooks/profileApi";

interface Post {
  postId: number;
  title: string;
  artist: string;
  highestBid: string;
  link: string;
  favoriteCnt?: number;
  liked?: boolean;
  isArtist?: boolean;
  originImagePath?: string;
  resizedImagePath?: string;
  thumbnailImagePath?: string;
  fileName?: string;
  pictureDTOList?: Array<{
    originImagePath?: string;
    resizedImagePath?: string;
    thumbnailImagePath?: string;
    fileName?: string;
  }> | null;
  boardNo?: number;
  imageUrl?: string;
}

const baseUrl = "http://localhost:8080/ourlog";

// ✅ 이미지 서빙을 위한 백엔드 베이스 URL 추가 (필요에 따라 수정하세요)
const imageBaseUrl = `http://localhost:8080/ourlog/picture/display/`; // 예시 경로, 실제 백엔드 경로에 맞게 수정 필요

const WorkerPage: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = Number(paramUserId);

  const rawLoggedInUserId = localStorage.getItem("user");
  let loggedInUserId: number = NaN;

  try {
    const parsedData = rawLoggedInUserId ? JSON.parse(rawLoggedInUserId) : null;
    if (parsedData && typeof parsedData.userId === "number") {
      loggedInUserId = parsedData.userId;
    }
  } catch (error) {
    console.error("❌ JSON 파싱 실패:", error);
  }

  const [cardData, setCardData] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [followCnt, setFollowCnt] = useState(0);
  const [followingCnt, setFollowingCnt] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  const navigate = useNavigate();

  const cardsPerPage = 6;
  const totalPages = Math.ceil(cardData.length / cardsPerPage);

  const currentCards = cardData.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => {
    if (isNaN(userId) || userId <= 0) return;

    const token = localStorage.getItem("token");

    // 프로필 가져오기
    fetchProfile(userId)
      .then((data) => {
        if ("nickname" in data) {
          setProfile(data);
          if (typeof data.followCnt === "number") setFollowCnt(data.followCnt);
          if (typeof data.followingCnt === "number")
            setFollowingCnt(data.followingCnt);
          if (typeof data.isFollowing === "boolean")
            setIsFollowing(data.isFollowing);
        } else {
          console.error("프로필 데이터 에러:", data);
          setProfile(null);
        }
      })
      .catch((err) => {
        console.error("fetchProfile 실패:", err);
        setProfile(null);
      });

    // 게시글과 좋아요 정보 가져오기
    const fetchPostsAndLikes = async () => {
      try {
        const res = await fetch(`${baseUrl}/followers/getPost/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("게시글 불러오기 실패");

        const posts: Post[] = await res.json();

        // ✅ 추가: boardNo가 5인 게시글만 필터링
        const artPosts = posts.filter(post => post.boardNo === 5);

        // ✅ 각 게시글에 이미지 URL 추가 (resizedImagePath 우선)
        const postsWithImageUrls = artPosts.map(post => {
          const imagePath = post.pictureDTOList && post.pictureDTOList.length > 0
            ? post.pictureDTOList[0].resizedImagePath ||
              post.pictureDTOList[0].thumbnailImagePath ||
              post.pictureDTOList[0].originImagePath
            : null; // 이미지 경로가 없는 경우 null

          // 백엔드 이미지 서빙 URL과 조합하여 최종 imageUrl 생성
          const imageUrl = imagePath ? `${imageBaseUrl}${imagePath}` : "/default-image.png";

          // 백엔드 응답에서 artist, highestBid, link, isArtist 필드를 확인하고 매핑해야 합니다.
          // 현재 Post 인터페이스에 정의되어 있지만, 백엔드 응답에 포함되어 있지 않다면 표시되지 않습니다.
          // 백엔드 응답 구조에 맞게 매핑 또는 제거가 필요합니다.
          return {
            ...post,
            imageUrl,
          };
        });

        const postsWithLikes = await Promise.all(
          // 필터링된 artPosts 배열을 사용합니다.
          postsWithImageUrls.map(async (post) => {
            try {
              const likedRes = await fetch(
                `${baseUrl}/favorites/${loggedInUserId}/${post.postId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  credentials: "include",
                }
              );
              const liked = JSON.parse(await likedRes.text());

              const countRes = await fetch(
                `${baseUrl}/favorites/count/${post.postId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  credentials: "include",
                }
              );
              const countData = await countRes.json();
              const count =
                typeof countData === "number"
                  ? countData
                  : countData.count || 0;

              return { ...post, liked, favoriteCnt: count };
            } catch (err) {
              console.error(
                `❌ Like data fetch 실패: post ${post.postId}`,
                err
              );
              return { ...post, liked: false, favoriteCnt: 0 };
            }
          })
        );

        setCardData(postsWithLikes);
      } catch (err) {
        console.error("❌ 게시글/좋아요 불러오기 실패:", err);
      }
    };

    fetchPostsAndLikes();
  }, [userId, loggedInUserId]);

  const handleFollowToggle = async () => {
    if (
      isNaN(loggedInUserId) ||
      isNaN(userId) ||
      loggedInUserId === 0 ||
      userId === 0 ||
      loggedInUserId === userId
    ) {
      console.warn("🔴 팔로우 조건 미충족", { loggedInUserId, userId });
      return;
    }

    const token = localStorage.getItem("token");
    const isNowFollowing = !isFollowing;
    const method = isNowFollowing ? "POST" : "DELETE";
    const url = isNowFollowing
      ? `${baseUrl}/followers/${loggedInUserId}/follow/${userId}`
      : `${baseUrl}/followers/${loggedInUserId}/unfollow/${userId}`;

    setIsFollowing(isNowFollowing);
    setFollowCnt((prev) => prev + (isNowFollowing ? 1 : -1));

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("팔로우 요청 실패");

      const data = await res.json();
      if (typeof data.followCnt === "number") setFollowCnt(data.followCnt);
      if (typeof data.followingCnt === "number")
        setFollowingCnt(data.followingCnt);
    } catch (err) {
      console.error("❌ 팔로우 토글 실패:", err);
      setIsFollowing(!isNowFollowing);
      setFollowCnt((prev) => prev + (isNowFollowing ? -1 : 1));
    }
  };

  const handleOpenChat = () => {
    navigate("/chat");
  };

  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  // ✅ Optimistic Update 적용한 좋아요 토글 함수
  const handleLikeToggle = async (postId: number) => {
    const token = localStorage.getItem("token");

    // Optimistic UI 업데이트
    setCardData((prev) =>
      prev.map((card) => {
        if (card.postId === postId) {
          const newLiked = !card.liked;
          const newFavoriteCnt = (card.favoriteCnt ?? 0) + (newLiked ? 1 : -1);
          return {
            ...card,
            liked: newLiked,
            favoriteCnt: newFavoriteCnt,
          };
        }
        return card;
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
          userId: loggedInUserId,
          postId: postId,
        }),
      });

      if (!result.ok) throw new Error("서버 응답 오류");

      const data = await result.json();

      if (typeof data.favoriteCount === "number") {
        setCardData((prev) =>
          prev.map((card) =>
            card.postId === postId
              ? {
                  ...card,
                  liked: data.favorited,
                  favoriteCnt: data.favoriteCount,
                }
              : card
          )
        );
      }
    } catch (error) {
      console.error("좋아요 처리 실패", error);

      // 실패 시 optimistic rollback
      setCardData((prev) =>
        prev.map((card) => {
          if (card.postId === postId) {
            const rolledBackLiked = !card.liked;
            const rolledBackFavoriteCnt =
              (card.favoriteCnt ?? 0) + (rolledBackLiked ? 1 : -1);
            return {
              ...card,
              liked: rolledBackLiked,
              favoriteCnt: rolledBackFavoriteCnt,
            };
          }
          return card;
        })
      );
    }
  };

  return (
    <div className="worker-container">
      <div className="worker-header">
        <img
          src={profile?.thumbnailImagePath || "/default-profile.png"}
          alt="프로필 이미지"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">
              {profile?.nickname || "닉네임 없음"}
            </div>
            <div className="worker-stats">
              <div className="stat">
                <span className="label">팔로우</span>
                <span>{followCnt}</span>
              </div>
              <div className="stat">
                <span className="label">팔로잉</span>
                <span>{followingCnt}</span>
              </div>
            </div>
          </div>
          <div className="worker-buttons">
            {!isNaN(loggedInUserId) && loggedInUserId !== userId && (
              <button onClick={handleFollowToggle} className="btn">
                {isFollowing ? "팔로잉" : "팔로우"}
              </button>
            )}
            {!isNaN(loggedInUserId) && loggedInUserId !== userId && (
              <button className="btn" onClick={handleOpenChat}>
                채팅창
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="worker-gallery">
        {currentCards.map((card) => (
          <div
            key={card.postId}
            className="worker-card"
            onClick={() => handleCardClick(card.postId)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <figure className="card-image-wrapper">
              <img
                src={card.imageUrl || "/default-image.png"}
                alt={`작품 ${card.postId}`}
                className="card-image"
              />
              <button
                className={`worker-like-button ${card.liked ? 'liked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeToggle(card.postId);
                }}
              >
                {card.liked ? "🧡" : "🤍"} <span>{card.favoriteCnt ?? 0}</span>
              </button>
            </figure>
            <div className="card-body">
              <h2 className="card-title">{card.title}</h2>
            </div>
          </div>
        ))}
      </section>

      <div className="pagination">
        <nav aria-label="페이지네이션">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="page-btn"
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="page-btn"
          >
            &gt;
          </button>
        </nav>
      </div>
    </div>
  );
};

export default WorkerPage;
