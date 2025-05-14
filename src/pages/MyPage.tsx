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
import "../styles/WorkerPage.css"; // 기존 스타일 그대로 재활용

import { fetchProfile, updateProfile, UserProfileDTO } from "../services/profileApi";

// ── 임시 데이터 ───────────────────────────────────────────────────
const recentPosts = [
  { id: 1, image: "/images/mypage/Realization.jpg", title: "Realization", price: "₩1,000,000" },
  { id: 2, image: "/images/mypage/Andrew Loomis.jpg", title: "Andrew Loomis", price: "₩800,000" },
  { id: 3, image: "/images/mypage/White Roses.jpg", title: "White Roses", price: "₩730,000" },
  // { id: 4, image: "/images/mypage/tangerine.jpg", title: "tangerine", price: "₩3,000,000" },
];
// ────────────────────────────────────────────────────────────────

const MyPage: React.FC = () => {
  const navigate = useNavigate();

   // 1) localStorage에서 userId 읽기
  const stored = localStorage.getItem("user");
  const userId = stored ? JSON.parse(stored).id as number : null;

  // 2) 프로필 상태
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  // 마운트 시 프로필 불러오기
  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId)
      .then(setProfile)
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div className="worker-container">
      {/* ── 프로필 헤더 ── */}
      <div className="worker-header">
        <img
          src={profile?.imagePath || "/images/mypage/default.png"}
          alt="프로필"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">
              {profile?.nickname || "로딩 중..."}
            </div>
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
            <button className="btn" onClick={() => navigate("/mypage/edit")}>
              프로필수정
            </button>
            <button className="btn" onClick={() => navigate("/mypage/account/edit")}>
              회원정보수정
            </button>
          </div>
        </div>
      </div>

      {/* ── 탭 네비게이션 (언제나 보임) ─────────────────────────────── */}
      <nav className="pagination" style={{ margin: "2rem 0" }}>
        <button className="page-btn" onClick={() => navigate("/mypage")}>
          최근 본 게시물
        </button>
        <button className="page-btn" onClick={() => navigate("/mypage/purchase-bid")}>
          구매목록/입찰목록
        </button>
        <button className="page-btn" onClick={() => navigate("/mypage/sale")}>
          판매목록/판매현황
        </button>
        <button className="page-btn" onClick={() => navigate("/mypage/bookmark")}>
          북마크한 작품들
        </button>
      </nav>

      {/* ── 탭별 콘텐츠 교체 영역 ─────────────────────────────────── */}
      <Routes>
        {/* 1) 인덱스: /mypage */}
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

        {/* 2) 프로필 수정 */}
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
        {/* 3) 회원정보 수정 */}
        <Route
          path="account/edit"
          element={<AccountEditPage />}
        />

        {/* 4) 회원탈퇴 */}
        <Route path="account/delete" element={<DeleteAccountPage />} />

        {/* 5) 구매/입찰 페이지 */}
        <Route path="purchase-bid" element={<PurchaseBidPage />} />

        {/* 6) 판매/판매현황 페이지 */}
        <Route path="sale/*" element={<SalePage />} />

        {/* 7) 북마크 페이지 */}
        <Route path="bookmark" element={<BookmarkPage />} />
      </Routes>
    </div>
  );
};

export default MyPage;
