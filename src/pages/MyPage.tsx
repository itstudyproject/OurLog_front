// src/pages/MyPage.tsx

import React, { useState, useEffect } from "react";

import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import "../styles/WorkerPage.css";
import "../styles/BidHistory.css";
import "../styles/PurchaseBidPage.css";

import {
  fetchProfile,
  updateProfile,
  UserProfileDTO,
} from "../hooks/profileApi";
import AccountEdit from "./AccountEdit";
import ProfileEdit from "./ProfileEdit";
import AccountDelete from "./AccountDelete";

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
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  useEffect(() => {
    console.log("stored:" + stored)
    console.log("userId:" + userId)
    if (!userId) return;
    console.log(Boolean(userId))
    fetchProfile(userId)
      .then(setProfile)
      .catch((err) => console.error(err));
  }, [userId]);



  // 메뉴 선택 상태 관리
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === "/mypage") return "recent";
    if (path.includes("/purchase-bid")) return "purchase-bid";
    if (path.includes("/sale")) return "sale";
    if (path.includes("/bookmark")) return "bookmark";
    return "recent";
  };

  // 편집 관련 페이지에서는 메뉴 숨김
  const hideMenu = [
    "/mypage/edit",
    "/mypage/account/edit",
    "/mypage/account/delete",
   ].some(path => location.pathname.startsWith(path)); 


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
            src={profile?.thumbnailImagePath || "/images/mypage/default.png"}
            alt="프로필"
          />
        </div>
        <div className="bid-details">
          <h3>{profile?.nickname || "로딩 중..."}</h3>
          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <p>팔로워: {profile?.followCnt ?? 0}</p>
            <p>팔로잉: {profile?.followingCnt ?? 0}</p>
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
              style={{ marginRight: "10px" }}
            >
              회원정보수정
            </button>
            <button
              className="detail-button"
              onClick={() => navigate("/mypage/account/delete")}
              style={{ backgroundColor: "#e74c3c" }}
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

      
       {!hideMenu && (
        <>
      <div className="bid-history-title" style={{ marginTop: "30px" }}>
        <h2>메뉴</h2>
      </div>

      <div className="sub-tab-nav">
        {/* <button

          className={`sub-tab ${getCurrentTab() === 'recent' ? 'active' : ''}`}
          onClick={() => navigate("/mypage")}
        >
          최근 본 게시물
        </button> */}
        <button
          className={`sub-tab ${getCurrentTab() === 'purchase-bid' ? 'active' : ''}`}
          onClick={() => navigate("/mypage/purchase-bid")}
        >
          구매/입찰목록
        </button>
        <button
          className={`sub-tab ${getCurrentTab() === 'sale' ? 'active' : ''}`}
          onClick={() => navigate("/mypage/sale")}
        >
          판매목록/현황
        </button>
        <button
          className={`sub-tab ${getCurrentTab() === 'bookmark' ? 'active' : ''}`}
          onClick={() => navigate("/mypage/bookmark")}
        >
          북마크
        </button>
      </div>
      </>
       )}

<Routes>
  {/* 최근 본 게시물 (기본) */}
  {/* <Route
    index
    element={
      <RecentPostsCarousel
        posts={recentPosts.map(p => ({
          id: p.id,
          title: p.title,
          price: Number(p.price.replace(/[^0-9]/g, "")),
          thumbnailUrl: p.image,
        }))}
      />
    }
  /> */}

  {/* 프로필 수정 */}
  <Route
    path="edit"
    element={
      <ProfileEdit
        profile={profile}
        onBack={() => navigate(-1)}
        onSave={async updated => {
          if (!userId) return;
          try {
            const saved = await updateProfile(userId, updated);
            setProfile(saved);
            navigate(-1);
          } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            alert("저장에 실패했습니다: " + msg);
          }
        }}
      />
    }
  />

  {/* 회원정보 수정 */}
  <Route
    path="account/edit"
    element={<AccountEdit />}
  />

  {/* 회원탈퇴 */}
  <Route
    path="account/delete"
    element={<AccountDelete />}
  />

  {/* 구매/입찰목록 */}
  <Route
    path="purchase-bid"
    element={
      userId
        ? <PurchaseBidPage userId={userId} />
        : <p>로그인이 필요합니다.</p>
    }
  />

  {/* 판매목록/현황 */}
  <Route
    path="sale"
    element={
      userId
        ? <SalePage userId={userId} />
        : <p>로그인이 필요합니다.</p>
    }
  />

  {/* 북마크 */}
  <Route
    path="bookmark"
    element={<BookmarkPage />}
  />
</Routes>

    </div>
  );
};

export default MyPage;