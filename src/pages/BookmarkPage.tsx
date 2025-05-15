import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../utils/auth";
import "../styles/BidHistory.css";

interface Favorite {
  favoriteId: number;
  title: string;
  artist: string;
  imagePath: string;
  postId: number;
  favorited: boolean;
  favoriteCnt: number;
}

const BookmarkPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/favorites/mypage", {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then(setFavorites)
      .catch(console.error);
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = favorites.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(favorites.length / itemsPerPage);

  const handleUnfavorite = (postId: number) => {
    const stored = localStorage.getItem("user");
    const userId = stored ? JSON.parse(stored).id : null;
    if (!userId) return;

    fetch(
      `http://localhost:8080/api/favorites/toggle?userId=${userId}&postId=${postId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    )
      .then((res) => res.json())
      .then(() => {
        // 성공적으로 해제하면 목록 새로고침
        setFavorites((prev) => prev.filter((item) => item.postId !== postId));
      })
      .catch(console.error);
  };

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>북마크한 작품들</h2>
      </div>

      <div className="bid-list">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.favoriteId}
              className="bid-item"
              onClick={() => navigate(`/art/${item.postId}`)}
            >
              <div className="bid-artwork">
                <img
                  src={item.imagePath || "/images/default.jpg"}
                  alt={item.title}
                />
              </div>
              <div className="bid-details">
                <h3>{item.title}</h3>
                <p>작가: {item.artist}</p>
                <p>총 좋아요: {item.favoriteCnt}</p>
              </div>
              <div className="bid-actions">
                <button
                  className="detail-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/art/${item.postId}`);
                  }}
                >
                  자세히 보기
                </button>
                <button
                  className="bid-now-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(item.postId);
                  }}
                >
                  북마크 해제
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bid-item" style={{ justifyContent: "center", padding: "30px" }}>
            <p>북마크한 작품이 없습니다.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="bid-history-footer">
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={page === currentPage ? "active" : ""}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkPage;
