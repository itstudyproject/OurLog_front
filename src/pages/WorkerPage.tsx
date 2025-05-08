import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WorkerPage.css";

const cardData = [
  { id: 1, image: "/images/파스타.jpg", title: "작품 제목 1" },
  { id: 2, image: "/images/22.jpg", title: "작품 제목 2" },
  { id: 3, image: "/images/33.jpg", title: "작품 제목 3" },
  { id: 4, image: "/images/44.jpg", title: "작품 제목 4" },
  { id: 5, image: "/images/55.jpg", title: "작품 제목 5" },
  { id: 6, image: "/images/66.jpg", title: "작품 제목 6" },
  { id: 7, image: "/images/77.jpg", title: "작품 제목 7" },
  { id: 8, image: "/images/88.jpg", title: "작품 제목 8" },
  { id: 9, image: "/images/99.jpg", title: "작품 제목 9" },
];

const WorkerPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [followCount, setFollowCount] = useState(120);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const cardsPerPage = 6;
  const totalPages = Math.ceil(cardData.length / cardsPerPage);

  const currentCards = cardData.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  const handleFollowToggle = () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    setFollowCount((prev) => (newFollowing ? prev + 1 : prev - 1));
  };

  const handleOpenChat = () => {
    // 새 탭에서 채팅 목록을 열기 위해 window.open() 사용
    window.open("/chat", "_blank");
  };

  const handleCardClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  return (
    <div className="worker-container">
      <div className="worker-header">
        <img
          src="/images/min.jpg"
          alt="프로필 이미지"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">XOXO</div>
            <div className="worker-stats">
              <div className="stat">
                <span className="label">팔로우</span>
                <span>{followCount}</span>
              </div>
              <div className="stat">
                <span className="label">팔로잉</span>
                <span>340</span>
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
        {currentCards.map((card) => (
          <div
            key={card.id}
            className="worker-card"
            onClick={() => handleCardClick(card.id)}
            style={{ cursor: "pointer" }}
          >
            <figure className="card-image-wrapper">
              <img
                src={card.image || "/default-image.png"}
                alt={`작품 ${card.id}`}
                className="card-image"
              />
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
