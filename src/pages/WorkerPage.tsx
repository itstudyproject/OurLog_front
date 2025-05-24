import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WorkerPage.css";
import { fetchProfile, UserProfileDTO } from "../hooks/profileApi";

interface Post {
  postId: number;
  imageUrl: string;
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
}

const baseUrl = "http://localhost:8080/ourlog";

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

        // 각 게시글별 좋아요 상태, 개수 가져오기
        const postsWithLikes = await Promise.all(
          posts.map(async (post) => {
            try {
              // 좋아요 상태 확인 API 호출
              const likedRes = await fetch(
                `${baseUrl}/favorites/${loggedInUserId}/${post.postId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✨ 토큰 추가
                  },
                  credentials: "include",
                }
              );
              const liked = JSON.parse(await likedRes.text());

              // 좋아요 개수 확인 API 호출
              const countRes = await fetch(
                `${baseUrl}/favorites/count/${post.postId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✨ 토큰 추가
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

  // 팔로우/언팔로우 토글
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

    // UI 즉시 반영
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
      // 실패 시 UI 롤백
      setIsFollowing(!isNowFollowing);
      setFollowCnt((prev) => prev + (isNowFollowing ? -1 : 1));
    }
  };

  // 채팅창 열기
  const handleOpenChat = () => {
    navigate("/chat");
  };

  // 작품 클릭 시 상세 페이지 이동
  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  // 좋아요 토글
  const handleLikeToggle = async (postId: number) => {
    const token = localStorage.getItem("token");

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

      // cardData 상태 업데이트
      setCardData((prev) =>
        prev.map((card) =>
          card.postId === postId
            ? {
              ...card,
              liked: data.favorited,
              favoriteCnt: data.favoriteCount ?? card.favoriteCnt,
            }
            : card
        )
      );
    } catch (error) {
      console.error("좋아요 처리 실패", error);
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
            <button className="btn" onClick={handleOpenChat}>
              채팅창
            </button>
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
                className="like-button"
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