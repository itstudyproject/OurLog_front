// src/pages/MyPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import ProfileEdit from "./ProfileEdit";
import AccountEditPage from "./AccountEdit";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import DeleteAccountPage from "./DeleteAccountPage";
import "../styles/WorkerPage.css";

import { fetchProfile, updateProfile, UserProfileDTO } from "../hooks/profileApi";

const recentPosts = [
  { id: 1, image: "/images/mypage/Realization.jpg", title: "Realization", price: "₩1,000,000" },
  { id: 2, image: "/images/mypage/Andrew Loomis.jpg", title: "Andrew Loomis", price: "₩800,000" },
  { id: 3, image: "/images/mypage/White Roses.jpg", title: "White Roses", price: "₩730,000" },
];

const MyPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="worker-container">
      <div className="worker-header">
        <img
          src={profile?.imagePath || "/images/mypage/default.png"}
          alt="프로필"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">{profile?.nickname || "로딩 중..."}</div>
            <div className="worker-stats">
              <div className="stat">
                <span className="label">팔로워</span>
                <span>{profile?.followerCount ?? 0}</span>
              </div>
              <div className="stat">
                <span className="label">팔로잉</span>
                <span>{profile?.followingCount ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="worker-buttons">
            <button className="btn" onClick={() => navigate("/mypage/edit")}>프로필수정</button>
            <button className="btn" onClick={() => navigate("/mypage/account/edit")}>회원정보수정</button>
          </div>
        </div>
      </div>

      <nav className="pagination" style={{ margin: "2rem 0" }}>
        <button className="page-btn" onClick={() => navigate("/mypage")}>최근 본 게시물</button>
        <button className="page-btn" onClick={() => navigate("/mypage/purchase-bid")}>구매목록/입찰목록</button>
        <button className="page-btn" onClick={() => navigate("/mypage/sale")}>판매목록/판매현황</button>
        <button className="page-btn" onClick={() => navigate("/mypage/bookmark")}>북마크한 작품들</button>
      </nav>

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

        <Route path="account/edit" element={<AccountEditPage />} />
        <Route path="account/delete" element={<DeleteAccountPage />} />
        <Route path="purchase-bid" element={<PurchaseBidPage />} />
        <Route path="sale/*" element={<SalePage />} />
        <Route path="bookmark" element={<BookmarkPage />} />
      </Routes>
    </div>
  );
};

export default MyPage;