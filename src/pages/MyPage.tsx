// src/pages/MyPage.tsx

import React, { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import ProfileEdit from "./ProfileEdit";
import AccountEditPage from "./AccountEdit";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import DeleteAccountPage from "./DeleteAccountPage";
import "../styles/WorkerPage.css";  // WorkerPage.css를 그대로 재활용

// 임시 데이터
const recentPosts = [
  { id: 1, image: "/images/mypage/Realization.jpg", title: "Realization", price: "₩1,000,000" },
  { id: 2, image: "/images/mypage/Andrew Loomis.jpg", title: "Andrew Loomis", price: "₩800,000" },
  { id: 3, image: "/images/mypage/White Roses.jpg", title: "White Roses", price: "₩730,000" },
  { id: 4, image: "/images/mypage/tangerine.jpg", title: "tangerine", price: "₩3,000,000" },
];
const purchaseHistory = [
  { id: 5, image: "/images/mypage/Victoriaa.JPG", title: "Victoria", price: "₩1,000,000" },
  { id: 6, image: "/images/mypage/Goats and Girls.jpg", title: "Goats and Girls", price: "₩500,000" },
];
const bookmarked = [
  { id: 7, image: "/images/77.jpg", title: "Cityscape", price: "₩400,000" },
  { id: 8, image: "/images/88.jpg", title: "Green Fields", price: "₩400,000" },
];

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"recent" | "purchase" | "sale" | "bookmark">("recent");

  const dataMap = {
    recent: recentPosts,
    purchase: purchaseHistory,
    sale: purchaseHistory,       // 예시로 동일 데이터 사용
    bookmark: bookmarked,
  };

  return (
    <div className="worker-container">
      {/* 프로필 헤더 */}
      <div className="worker-header">
        <img
          src="/images/mypage/Mari.jpg"
          alt="프로필"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">만수</div>
            <div className="worker-stats">
              <div className="stat">
                <span className="label">팔로워</span>
                <span>30</span>
              </div>
              <div className="stat">
                <span className="label">팔로잉</span>
                <span>30</span>
              </div>
            </div>
          </div>
          <div className="worker-buttons">
<button className="btn" onClick={() => navigate("edit")}>              프로필수정
            </button>
<button className="btn" onClick={() => navigate("account/edit")}>
    회원정보수정
  </button>
          </div>
        </div>
      </div>

      {/* 탭 선택 */}
      <nav className="pagination" style={{ marginTop: "2rem" }}>
        {(["recent", "purchase", "sale", "bookmark"] as const).map((key) => (
          <button
            key={key}
            className={`page-btn ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {key === "recent"
              ? "최근 본 게시물"
              : key === "purchase"
              ? "구매목록/입찰목록"
              : key === "sale"
              ? "판매목록/판매현황"
              : "북마크한 작품들"}
          </button>
        ))}
      </nav>

      {/* 그리드 갤러리 */}
      <section className="worker-gallery" style={{ marginTop: "1rem" }}>
        {dataMap[tab].map((card) => (
          <div
            key={card.id}
            className="worker-card"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (tab === "recent") navigate(`/art/${card.id}`);
              else if (tab === "purchase") navigate("/mypage/purchase-bid");
              else if (tab === "sale") navigate("/mypage/sale");
              else navigate("/mypage/bookmark");
            }}
          >
            <figure className="card-image-wrapper">
              <img
                src={card.image}
                alt={card.title}
                className="card-image"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{card.title}</h2>
              <p style={{ color: "#fff", marginTop: "0.5rem" }}>{card.price}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 자식 경로 렌더링용 Routes */}
      <Routes>
        <Route
          path="edit"
          element={<ProfileEdit onBack={() => navigate("/mypage")} />}
        />
        <Route
          path="account/edit"
          element={<AccountEditPage onBack={() => navigate("/mypage")} />}
        />
        <Route
          path="account/delete"
          element={<DeleteAccountPage />}
        />
        <Route
          path="purchase-bid"
          element={<PurchaseBidPage />}
        />
        <Route
          path="sale"
          element={<SalePage />}
        />
        <Route
          path="bookmark"
          element={<BookmarkPage />}
        />
      </Routes>
    </div>
  );
};

export default MyPage;
