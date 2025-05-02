import React, { useState } from "react";
import "../styles/WorkerPage.css";

const cardData = [
  {
    id: 1,
    image: "/images/11.jpg",
    //badgeColor: "#000000",
    title: "작품 1",
  },
  { id: 2, image: "", badgeColor: "#3a00e5", title: "작품 2" },
  { id: 3, image: "", badgeColor: "#00000080", title: "작품 3" },
  { id: 4, image: "", badgeColor: "#00000080", title: "작품 4" },
  { id: 5, image: "", badgeColor: "#00000080", title: "작품 5" },
  { id: 6, image: "", badgeColor: "#00000080", title: "작품 6" },
];

const WorkerPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [followCount, setFollowCount] = useState(120);
  const [isFollowing, setIsFollowing] = useState(false);

  const cardsPerPage = 6;
  const totalPages = Math.ceil(cardData.length / cardsPerPage);

  const currentCards = cardData.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  const handleFollowToggle = () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    setFollowCount((prevCount) =>
      newFollowing ? prevCount + 1 : prevCount - 1
    );
  };

  // ✅ 새 창으로 채팅 페이지 열기
  const handleOpenChat = () => {
    window.open("/chat", "_blank", "width=600,height=800");
  };

  return (
    <div className="worker-container">
      <div className="worker-header">
        <img
          src="/path/to/your/image.png"
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
          <div key={card.id} className="worker-card">
            <figure className="card-image-wrapper">
              <img
                src={card.image || "/default-image.png"}
                alt={`작품 ${card.id}`}
                className="card-image"
              />
              <div
                className="badge"
                style={{ backgroundColor: card.badgeColor }}
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
