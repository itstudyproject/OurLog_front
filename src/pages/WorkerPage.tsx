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
        } else {
          console.error("프로필 데이터 에러:", data);
          setProfile(null);
        }
      })
      .catch((err) => {
        console.error("fetchProfile 실패:", err);
        setProfile(null);
      });

    // 팔로우 상태 확인
    const checkFollowingStatus = async () => {
      if (!isNaN(loggedInUserId) && loggedInUserId !== userId) {
        try {
          const res = await fetch(
            `${baseUrl}/followers/status/isFollowing/${loggedInUserId}/${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setIsFollowing(data);
          } else {
            console.warn(`❌ 팔로우 상태 확인 실패 (${res.status})`);
            setIsFollowing(false);
          }
        } catch (err) {
          console.error("❌ 팔로우 상태 확인 실패:", err);
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    };
    checkFollowingStatus();

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
        const artPosts = posts.filter((post) => post.boardNo === 5);

        const postsWithImageUrls = artPosts.map((post) => {
          const imagePath =
            post.pictureDTOList && post.pictureDTOList.length > 0
              ? post.pictureDTOList[0].resizedImagePath ||
                post.pictureDTOList[0].thumbnailImagePath ||
                post.pictureDTOList[0].originImagePath
              : null;

          const imageUrl = imagePath
            ? `${imageBaseUrl}${imagePath}`
            : "/default-image.png";

          return {
            ...post,
            imageUrl,
          };
        });

        const postsWithLikes = await Promise.all(
          postsWithImageUrls.map(async (post) => {
            if (isNaN(loggedInUserId) || !post.postId) {
              return { ...post, liked: false, favoriteCnt: 0 };
            }

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
      if (isNaN(loggedInUserId) || loggedInUserId === 0) {
        alert("팔로우 기능을 사용하려면 로그인이 필요합니다.");
      }
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
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ 팔로우 요청 실패 (${res.status}):`, errorText);
        setIsFollowing(!isNowFollowing);
        setFollowCnt((prev) => prev + (isNowFollowing ? -1 : 1));
        alert(`팔로우 요청 실패: ${errorText || res.statusText}`);
        throw new Error(`팔로우 요청 실패 (${res.status})`);
      }

      const data = await res.json();
      if (typeof data.followCnt === "number") setFollowCnt(data.followCnt);
      if (typeof data.followingCnt === "number")
        setFollowingCnt(data.followingCnt);

      console.log(isNowFollowing ? "팔로우 성공" : "팔로우 취소 성공", data);
    } catch (err) {
      console.error("❌ 팔로우 토글 실패:", err);
    }
  };

  const handleOpenChat = () => {
    navigate("/chat");
  };

  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  const handleLikeToggle = async (postId: number) => {
    if (isNaN(loggedInUserId) || loggedInUserId === 0) {
      alert("좋아요 기능을 사용하려면 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");

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

      if (!result.ok) {
        const errorText = await result.text();
        console.error(
          `❌ 좋아요 토글 서버 응답 오류 (${result.status}):`,
          errorText
        );
        throw new Error(`서버 응답 오류: ${errorText || result.statusText}`);
      }

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
      } else {
        console.warn(
          "❌ 좋아요 토글 API 응답에 favoriteCount가 없습니다.",
          data
        );
      }
    } catch (error) {
      console.error("좋아요 처리 실패", error);

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
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="worker-container">
      <div className="worker-header">
        <img
          src={
            profile?.thumbnailImagePath
              ? profile.thumbnailImagePath.startsWith("/ourlog")
                ? `http://localhost:8080${profile.thumbnailImagePath}`
                : `${imageBaseUrl}${profile.thumbnailImagePath}`
              : "/mypage.png"
          }
          alt="프로필 이미지"
          className="worker-profile-img"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/mypage.png";
          }}
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
              <button
                onClick={handleFollowToggle}
                className={`btn ${isFollowing ? "following" : ""}`}
              >
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/default-image.png";
                }}
              />
              {!isNaN(loggedInUserId) &&
                loggedInUserId !== 0 &&
                card.postId !== undefined &&
                card.postId !== null && (
                  <button
                    className={`worker-like-button ${
                      card.liked ? "liked" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeToggle(card.postId);
                    }}
                  >
                    {card.liked ? "🧡" : "🤍"}{" "}
                    <span>{card.favoriteCnt ?? 0}</span>
                  </button>
                )}
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
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </nav>
      </div>
    </div>
  );
};

export default WorkerPage;
