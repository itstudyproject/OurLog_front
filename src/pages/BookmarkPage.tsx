import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BidHistory.css";
import { getFavoritesByUser, FavoriteDTO } from "../hooks/favoriteApi";



const BookmarkPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ① localStorage에서 userId 꺼내기
  const stored = localStorage.getItem("user");
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  useEffect(() => {

    if (!userId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    getFavoritesByUser(userId)
      .then((list) => setFavorites(list))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>로딩 중…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (favorites.length === 0) return <p>북마크한 작품이 없습니다.</p>;

  return (
    <div className="bid-list">
      {favorites.map((fav) => {
        const post = fav.postDTO;
        return (
          <div
            key={fav.favoriteId}
            className="bid-item"
            onClick={() => navigate(`/art/${post.postId}`)}
          >
            <div className="bid-artwork">
              <img src={post.imagePath} alt={post.title} />
            </div>
            <div className="bid-details">
              <h3>{post.title}</h3>
              <p>작가: {post.artist}</p>
              <p>좋아요 수: {post.favoriteCnt}</p>
            </div>
            <div className="bid-actions">
              <button
                className="detail-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/art/${post.postId}`);
                }}
              >
                자세히 보기
              </button>
              <button
                className="bid-now-button"
                onClick={(e) => {
                  e.stopPropagation();
                  // 여기서 unfavorite 로직 추가 가능
                }}
              >
                북마크 해제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookmarkPage;