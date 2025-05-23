import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WorkerPage.css";
import { fetchProfile, UserProfileDTO } from "../hooks/profileApi";

interface Post {
  postId: number; // 🔧 이 줄 추가!
  imageUrl: string;
  title: string;
  artist: string;
  highestBid: string;
  link: string;
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

interface LikeStatus {
  liked: boolean;
  count: number;
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

  console.log("✅ 초기 유저 확인", {
    rawLoggedInUserId,
    parsedUserId: loggedInUserId,
    pageUserId: userId,
  });

  const [cardData, setCardData] = useState<Post[]>([]);
  const [likes, setLikes] = useState<LikeStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [followCnt, setFollowCnt] = useState(0);
  const [followingCnt, setFollowingCnt] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  const cardsPerPage = 6;
  const totalPages = Math.ceil(cardData.length / cardsPerPage);

  const currentCards = cardData.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => {
    if (isNaN(userId) || userId <= 0) return;

    const token = localStorage.getItem("token");
    console.log("🟢 token & userId:", { token, userId });

    // Fetch profile
    fetchProfile(userId)
      .then((data) => {
        if ("nickname" in data) {
          // 정상 응답인 경우
          setProfile(data);
          if (typeof data.followCnt === "number") setFollowCnt(data.followCnt);
          if (typeof data.followingCnt === "number")
            setFollowingCnt(data.followingCnt);
          if (typeof data.isFollowing === "boolean")
            setIsFollowing(data.isFollowing);
        } else {
          // 에러 객체가 들어온 경우
          console.error("프로필 데이터 에러:", data);
          setProfile(null); // 또는 기본값 처리
        }
      })
      .catch((err) => {
        console.error("fetchProfile 실패:", err);
        setProfile(null);
      });
    // Fetch posts and likes
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
        console.log("🔥 서버에서 받은 posts:", posts);
        setCardData(posts);

        const likeResults = await Promise.all(
          posts.map(async (post) => {
            try {
              const likedRes = await fetch(
                `${baseUrl}/favorites/${loggedInUserId}/${post.postId}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );
              const liked = JSON.parse(await likedRes.text());

              const countRes = await fetch(
                `${baseUrl}/ourlog/favorites/count/${post.postId}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );
              const count = await countRes.json();

              return { liked, count };
            } catch (err) {
              console.error(
                `❌ Like data fetch 실패: post ${post.postId}`,
                err
              );
              return { liked: false, count: 0 };
            }
          })
        );

        setLikes(likeResults);
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

  const navigate = useNavigate();
  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  const handleLikeToggle = async (index: number, postId: number) => {
    if (loggedInUserId === undefined) return;
    if (postId === undefined) {
      console.error("❌ postId가 undefined입니다!");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("토큰 값:", token);
    if (!token) {
      console.warn("❗️ 토큰이 없습니다. 로그인 필요");
      return;
    }

    const currentLike = likes[index] || { liked: false, count: 0 };
    const newLiked = !currentLike.liked;
    const newCount = newLiked
      ? currentLike.count + 1
      : Math.max(0, currentLike.count - 1);

    setLikes((prevLikes) =>
      prevLikes.map((like, i) =>
        i === index ? { liked: newLiked, count: newCount } : like
      )
    );

    try {
      const response = await fetch(`${baseUrl}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`, // 헤더 추가
        },
        credentials: "include",
        body: JSON.stringify({
          userDTO: { userId: loggedInUserId },
          postDTO: { postId },
        }),
      });

      if (!response.ok) throw new Error("좋아요 토글 실패");

      const result = await response.json();

      setLikes((prevLikes) =>
        prevLikes.map((like, i) =>
          i === index
            ? { liked: result.favorited, count: result.favoriteCount }
            : like
        )
      );
    } catch (err) {
      console.error("❌ 좋아요 토글 실패:", err);
      setLikes((prevLikes) =>
        prevLikes.map((like, i) => (i === index ? currentLike : like))
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
              {typeof profile?.nickname === "string"
                ? profile.nickname
                : "닉네임 없음"}
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
        {currentCards.map((card, index) => {
          console.log("🃏 카드 데이터:", card); // 이 줄 추가!
          const globalIndex = (currentPage - 1) * cardsPerPage + index;
          const like = likes[globalIndex] || { liked: false, count: 0 };

          console.log("🔍 like 상태", {
            index,
            globalIndex,
            like: likes[globalIndex],
          }); // 이 위치!

          return (
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
                    console.log("👍 좋아요 버튼 클릭됨", {
                      globalIndex,
                      postId: card.postId,
                    });
                    handleLikeToggle(globalIndex, card.postId);
                  }}
                >
                  ♥{" "}
                  <span>
                    {" "}
                    {typeof like.count === "number" ? like.count : 0}{" "}
                  </span>
                </button>
              </figure>
              <div className="card-body">
                <h2 className="card-title">{card.title}</h2>
              </div>
            </div>
          );
        })}
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
