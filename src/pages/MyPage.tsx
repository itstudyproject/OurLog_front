// src/pages/MyPage.tsx

import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";
import "../styles/WorkerPage.css";
import "../styles/PurchaseBidPage.css";
import "../styles/MyPage.css";
// BidHistory 컴포넌트 임포트
import BidHistory from "./Art/BidHistory"; 

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
  const [activeTab, setActiveTab] = useState<'purchase-bid' | 'sale' | 'bookmark'>('purchase-bid');

  useEffect(() => {
    console.log("stored:" + stored)
    console.log("userId:" + userId)
    if (!userId) return;
    console.log(Boolean(userId))
    fetchProfile(userId)
      .then(setProfile)
      .catch((err) => console.error(err));
  }, [userId]);

  const hideMenu = [
    "/mypage/account/edit",
    "/mypage/account/delete",
  ].some((path) => location.pathname.startsWith(path));

  const isProfileEditRoute = location.pathname === '/mypage/edit';

  const handleBackFromEdit = () => {
    navigate('/mypage');
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfileDTO>) => {
    if (!userId) {
      alert("유저 정보가 없습니다.");
      return Promise.reject("유저 정보 없음");
    }
    try {
      await updateProfile(userId, updatedData);
      await fetchProfile(userId).then(setProfile);
      console.log("프로필 업데이트 성공");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
      return Promise.reject(error);
    }
  };

  return (
    <div className="mp-container">
      <div className="mp-page-title">
        <h2>마이페이지</h2>
      </div>

      <div className="mp-profile-section">
        <div
          className="mp-profile-image"
        >
          <img
            src={profile?.thumbnailImagePath || "/images/mypage/default.png"}
            alt="프로필"
          />
        </div>
        <div className="mp-profile-details">
          <h3>{profile?.nickname || "로딩 중..."}</h3>
          <div className="mp-follow-stats">
            <p>팔로워: {profile?.followCnt ?? 0}</p>
            <p>팔로잉: {profile?.followingCnt ?? 0}</p>
          </div>
          <div className="mp-profile-actions">
            <button
              className="mp-button primary"
              onClick={() => navigate("/mypage/edit")}
            >
              프로필수정
            </button>
            <button
              className="mp-button primary"
              onClick={() => navigate("/mypage/account/edit")}
            >
              회원정보수정
            </button>
            <button
              className="mp-button danger"
              onClick={() => navigate("/mypage/account/delete")}
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

       {!hideMenu && !isProfileEditRoute && (
        <>
      <div className="mp-section-title">
        <h2>메뉴</h2>
      </div>

      <div className="mp-sub-tab-nav">
        <button
          className={`mp-sub-tab ${activeTab === 'purchase-bid' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase-bid')}
        >
          구매/입찰목록
        </button>
        <button
          className={`mp-sub-tab ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('sale')}
        >
          판매목록/현황
        </button>
        <button
          className={`mp-sub-tab ${activeTab === 'bookmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmark')}
        >
          북마크
        </button>
      </div>
      </>
       )}

<div className="mp-tab-content">
  {isProfileEditRoute && (
    <ProfileEdit
      profile={profile}
      onBack={handleBackFromEdit}
      onSave={handleSaveProfile}
    />
  )}

  {location.pathname === '/mypage/account/edit' && <AccountEdit userId={userId} />}

  {location.pathname === '/mypage/account/delete' && <AccountDelete userId={userId} />}

  {!hideMenu && !isProfileEditRoute && (
    <>
      {activeTab === 'purchase-bid' && userId && <BidHistory userId={userId} />}
      {activeTab === 'purchase-bid' && !userId && <p>로그인이 필요합니다.</p>}

      {activeTab === 'sale' && <p>판매목록/현황 내용 (추후 구현)</p>}
      {activeTab === 'bookmark' && <p>북마크 내용 (추후 구현)</p>}
    </>
  )}
</div>

    </div>
  );
};

export default MyPage;