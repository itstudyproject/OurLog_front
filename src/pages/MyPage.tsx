// src/pages/MyPage.tsx

import React from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import ProfileEdit from "./ProfileEdit";
import AccountEditPage from "./AccountEdit";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import DeleteAccountPage from "./DeleteAccountPage";
import "../styles/WorkerPage.css"; // 기존 스타일 그대로 재활용

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

  return (
    <div className="worker-container">
      {/* ── 프로필 헤더 ─────────────────────────────────────────── */}
      <div className="worker-header">
        <img
          src="/images/mypage/Mari.jpg"
          alt="프로필"
          className="worker-profile-img"
        />
        <div className="worker-info">
          <div className="worker-meta-row">
            <div className="worker-name">xoxo</div>
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
            <section className="worker-gallery">
              <RecentPostsCarousel
                posts={recentPosts.map((post) => ({
                  id: post.id,
                  title: post.title,
                  price: Number(post.price.replace(/[^0-9]/g, "")),
                  thumbnailUrl: post.image,
                }))}
              />
            </section>
          }
        />

        {/* 2) 프로필 수정 */}
        <Route path="edit" element={<ProfileEdit onBack={() => navigate(-1)} />} />

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
