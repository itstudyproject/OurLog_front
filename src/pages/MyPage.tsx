// src/pages/MyPage.tsx

import React, { useState, useEffect } from "react";

import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import DeleteAccountPage from "./DeleteAccountPage";
import "../styles/WorkerPage.css";
import "../styles/BidHistory.css";

import {
  fetchProfile,
  updateProfile,
  UserProfileDTO,
} from "../hooks/profileApi";
import AccountEdit from "./AccountEdit";
import ProfileEdit from "./ProfileEdit";

const recentPosts = [
  {
    id: 1,
    image: "/images/mypage/Realization.jpg",
    title: "Realization",
    price: "₩1,000,000",
  },
  {
    id: 2,
    image: "/images/mypage/Andrew Loomis.jpg",
    title: "Andrew Loomis",
    price: "₩800,000",
  },
  {
    id: 3,
    image: "/images/mypage/White Roses.jpg",
    title: "White Roses",
    price: "₩730,000",
  },
];

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stored = localStorage.getItem("user");
  const userId = stored ? (JSON.parse(stored).id as number) : null;

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId)
      .then(setProfile)
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>마이페이지</h2>
      </div>

      <div className="bid-item" style={{ padding: "20px" }}>
        <div
          className="bid-artwork"
          style={{ width: "100px", height: "100px" }}
        >
          <img
            src={profile?.imagePath || "/images/mypage/default.png"}
            alt="프로필"
          />
        </div>
        <div className="bid-details">
          <h3>{profile?.nickname || "로딩 중..."}</h3>
          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <p>팔로워: {profile?.followerCount ?? 0}</p>
            <p>팔로잉: {profile?.followingCount ?? 0}</p>
          </div>
          <div className="bid-actions" style={{ marginTop: "15px" }}>
            <button
              className="detail-button"
              onClick={() => navigate("/mypage/edit")}
              style={{ marginRight: "10px" }}
            >
              프로필수정
            </button>
            <button
              className="detail-button"
              onClick={() => navigate("/mypage/account/edit")}
            >
              회원정보수정
            </button>
          </div>
        </div>
      </div>

      <div className="bid-history-title" style={{ marginTop: "30px" }}>
        <h2>메뉴</h2>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          className={`bid-now-button ${
            location.pathname === "/mypage" ? "active" : ""
          }`}
          onClick={() => navigate("/mypage")}
          style={{ flex: 1, margin: "0 5px", maxWidth: "200px" }}
        >
          최근 본 게시물
        </button>
        <button
          className={`bid-now-button ${
            location.pathname.includes("/purchase-bid") ? "active" : ""
          }`}
          onClick={() => navigate("/mypage/purchase-bid")}
          style={{ flex: 1, margin: "0 5px", maxWidth: "200px" }}
        >
          구매/입찰목록
        </button>
        <button
          className={`bid-now-button ${
            location.pathname.includes("/sale") ? "active" : ""
          }`}
          onClick={() => navigate("/mypage/sale")}
          style={{ flex: 1, margin: "0 5px", maxWidth: "200px" }}
        >
          판매목록/현황
        </button>
        <button
          className={`bid-now-button ${
            location.pathname.includes("/bookmark") ? "active" : ""
          }`}
          onClick={() => navigate("/mypage/bookmark")}
          style={{ flex: 1, margin: "0 5px", maxWidth: "200px" }}
        >
          북마크
        </button>
      </div>

      <Routes>
        <Route
          index
          element={
            <RecentPostsCarousel
              posts={recentPosts.map((p) => ({
                id: p.id,
                title: p.title,
                price: Number(p.price.replace(/[^0-9]/g, "")),
                thumbnailUrl: p.image,
              }))}
            />
          }
        />

        <Route
          path="edit"
          element={
            <ProfileEdit
              profile={profile}
              onBack={() => navigate(-1)}
              onSave={async (updated) => {
                if (!userId) return;
                const saved = await updateProfile(userId, updated);
                setProfile(saved);
                navigate(-1);
              }}
            />
          }
        />

        <Route path="account/edit" element={<AccountEdit />} />
        <Route path="account/delete" element={<DeleteAccountPage />} />
        <Route path="purchase-bid" element={<PurchaseBidPage />} />
        <Route path="sale/*" element={<SalePage />} />
        <Route path="bookmark" element={<BookmarkPage />} />
      </Routes>
    </div>
  );
};

export default MyPage;
