import React, { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import ProfileEditPage from "./ProfileEditPage";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import DeleteAccountPage from "./DeleteAccountPage";
import "../styles/WorkerPage.css";

const cardData = [
  { id: 1, image: "/images/mypage/Realization.jpg", title: "Realization" },
  { id: 2, image: "/images/mypage/Andrew Loomis.jpg", title: "Andrew Loomis" },
  { id: 3, image: "/images/mypage/White Roses.jpg", title: "White Roses" },
  { id: 4, image: "/images/mypage/tangerine.jpg", title: "tangerine" },
  { id: 5, image: "/images/mypage/Victoriaa.JPG", title: "Victoria" },
  {
    id: 6,
    image: "/images/mypage/Goats and Girls.jpg",
    title: "Goats and Girls",
  },
];

const MyPage = () => {
  const [followCount, setFollowCount] = useState(120);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    setFollowCount((prev) => (newFollowing ? prev + 1 : prev - 1));
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
            <div className="worker-name">만수</div>
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
            <button className="btn" onClick={() => navigate("/chat")}>
              채팅창
            </button>
          </div>
        </div>
      </div>

      <section className="worker-gallery">
        {cardData.map((card) => (
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
            onClick={() => navigate("/mypage/profile-edit")}
            className="page-btn"
          >
            프로필 수정
          </button>
          <button
            onClick={() => navigate("/mypage/account")}
            className="page-btn"
          >
            회원정보 수정
          </button>
          <button
            onClick={() => navigate("/mypage/account/delete")}
            className="page-btn text-error"
          >
            회원 탈퇴
          </button>
        </nav>
      </div>

      <Routes>
        <Route
          path="profile-edit"
          element={<ProfileEditPage onBack={() => navigate("/mypage")} />}
        />
        <Route path="delete-account" element={<DeleteAccountPage />} />
        <Route path="purchase-bid" element={<PurchaseBidPage />} />
        <Route path="sale" element={<SalePage />} />
        <Route path="bookmark" element={<BookmarkPage />} />
      </Routes>
    </div>
  );
};

export default MyPage;
