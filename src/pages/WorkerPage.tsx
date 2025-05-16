import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/WorkerPage.css";

interface Post {
  id: number;
  title: string;
  image: string;
}

interface LikeStatus {
  liked: boolean;
  count: number;
}

interface UserProfile {
  userId: number;
  nickname: string;
  thumbnailImagePath: string;
  followCount: number;
  followingCount: number;
}

const baseUrl = "http://localhost:8080/ourlog";

const WorkerPage: React.FC = () => {
  const location = useLocation();
  const userId = location.state?.userId;

  const [cardData, setCardData] = useState<Post[]>([]);
  const [likes, setLikes] = useState<LikeStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [followCount, setFollowCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const navigate = useNavigate();
  const cardsPerPage = 6;
  const totalPages = Math.ceil(cardData.length / cardsPerPage);

  const currentCards = cardData.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${baseUrl}/profile/get/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("프로필 불러오기 실패");

        const profileData = await res.json();

        const userProfile: UserProfile = {
          userId: profileData.user.userId,
          nickname: profileData.user.nickname,
          thumbnailImagePath: profileData.thumbnailImagePath
            ? baseUrl + profileData.thumbnailImagePath
            : "/default-profile.png",
          followCount: profileData.follow?.followersCount || 0,
          followingCount: profileData.follow?.followingCount || 0,
        };

        setProfile(userProfile);
        setFollowCount(userProfile.followCount);
        setFollowingCount(userProfile.followingCount);
      } catch (err) {
        console.error("프로필 데이터 불러오기 실패", err);
      }
    };

    const fetchPostsAndLikes = async () => {
      try {
        const res = await fetch(`${baseUrl}/ourlog/post`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("게시글 불러오기 실패");

        const posts: Post[] = await res.json();
        setCardData(posts);

        const likeResults = await Promise.all(
          posts.map(async (post) => {
            try {
              const likedRes = await fetch(
                `${baseUrl}/ourlog/favorites/${userId}/${post.id}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );
              const liked = await likedRes.json();

              const countRes = await fetch(
                `${baseUrl}/ourlog/favorites/count/${post.id}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );
              const count = await countRes.json();

              return { liked, count };
            } catch (err) {
              return { liked: false, count: 0 };
            }
          })
        );

        setLikes(likeResults);
      } catch (err) {
        console.error("게시글/좋아요 정보 불러오기 실패", err);
      }
    };

    fetchUserProfile();
    fetchPostsAndLikes();
  }, [userId]);

  const handleFollowToggle = () => {
    const newFollow = !isFollowing;
    setIsFollowing(newFollow);
    setFollowCount((prev) => (newFollow ? prev + 1 : prev - 1));
  };

  const handleOpenChat = () => {
    window.open("/chat", "_blank", "noopener,noreferrer");
  };

  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  const handleLikeToggle = async (index: number, postId: number) => {
    try {
      const response = await fetch(`${baseUrl}/ourlog/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userDTO: { userId },
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
      console.error("좋아요 토글 실패:", err);
    }
  };

  return (
    <div className="worker-container">
      {profile ? (
        <>
          <div className="worker-header">
            <img
              src={profile.thumbnailImagePath}
              alt="프로필 이미지"
              className="worker-profile-img"
            />
            <div className="worker-info">
              <div className="worker-meta-row">
                <div className="worker-name">{profile.nickname}</div>
                <div className="worker-stats">
                  <div className="stat">
                    <span className="label">팔로우</span>
                    <span>{followCount}</span>
                  </div>
                  <div className="stat">
                    <span className="label">팔로잉</span>
                    <span>{followingCount}</span>
                  </div>
                </div>
              </div>
              <div className="worker-buttons">
                <button onClick={handleFollowToggle} className="btn">
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
                <button className="btn" onClick={handleOpenChat}>
                  채팅창
                </button>
              </div>
            </div>
          </div>

          <section className="worker-gallery">
            {currentCards.map((card, index) => {
              const globalIndex = (currentPage - 1) * cardsPerPage + index;
              const like = likes[globalIndex] || { liked: false, count: 0 };

              return (
                <div
                  key={card.id}
                  className="worker-card"
                  onClick={() => handleCardClick(card.id)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <figure className="card-image-wrapper">
                    <img
                      src={card.image || "/default-image.png"}
                      alt={`작품 ${card.id}`}
                      className="card-image"
                    />
                    <button
                      className="like-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(globalIndex, card.id);
                      }}
                    >
                      ♥ {like.count}
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
                  className={`page-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
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
        </>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
};

export default WorkerPage;
