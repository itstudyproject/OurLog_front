import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ 추가
// @ts-ignore
import "../styles/header.css";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ✅ 임시 로그인 상태
  const navigate = useNavigate(); // ✅ 추가

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="sidebar-button">
            <img
              src="/images/sideba.png"
              alt="메뉴"
              className="menu-icon"
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>

          <div className="logo-container">
            <img
              src="/images/OurLog.png"
              alt="OurLog 로고"
              className="logo-image"
            />
          </div>

          <div className="right-section">
            <div className="search-label">SEARCH</div>
            <div className="search-box">
              <input type="text" placeholder="검색" className="search-input" />
              <span className="search-icon">🔍</span>
            </div>
            <div className="user-menu">
              {isLoggedIn ? (
                <>
                <Link to={"/mypage"}>
                  <img
                    src="/images/mypage.png"
                    alt="마이페이지"
                    className="mypage-icon"
                  />
                  </Link>

                  {userInfo?.profileImage && (
                    <img
                      src={userInfo.profileImage}
                      alt="프로필"
                      className="mypage-icon"
                    />
                  )}

                  <div
                    className="logout"
                    onClick={() => {
                      localStorage.removeItem("token"); // ✅ 토큰 삭제
                      setIsLoggedIn(false); // ✅ 상태 변경
                      navigate("/"); // ✅ 메인으로 이동

                    }}
                  >
                    LOGOUT
                  </div>
                </>
              ) : (
                <Link to="/login" className="logout">
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 사이드바 */}
      <div className={isSidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            <img
              src="/images/menu.png"
              alt="메뉴 아이콘"
              style={{ width: 30, height: 30 }}
            />
            <h2 className="sidebar-title">MENU</h2>
          </div>
          <img
            src="/images/close.png"
            alt="닫기"
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
        <nav className="sidebar-nav">
          {/* 아트 섹션 */}
          <Link to="/art" className="sidebar-section-title">
            아트
          </Link>
          <div className="sidebar-section-sub">
            <Link to="/art/register">아트 등록</Link>
            <Link to="/art/board">아트 게시판</Link>
          </div>

          {/* 커뮤니티 섹션 */}
          <Link to="/community" className="sidebar-section-title">
            커뮤니티
          </Link>
          <div className="sidebar-section-sub">
            <Link to="/community/news">새소식</Link>
            <Link to="/community/free">자유게시판</Link>
            <Link to="/community/promo">홍보 게시판</Link>
            <Link to="/community/request">요청 게시판</Link>
          </div>

          {/* 랭킹 섹션 */}
          <Link to="/ranking" className="sidebar-section-title">
            랭킹
          </Link>

          {/* 마이페이지 섹션 */}
          <Link to="/mypage" className="sidebar-section-title">
            마이페이지
          </Link>
        </nav>
        <div
          style={{
            position: "absolute",
            opacity: 0.7,
            bottom: 70,
          }}
        >
          <img
            src="/images/OurLog.png"
            alt="OurLog 로고"
            style={{ height: 80 }}
          />
        </div>
      </div>
    </>
  );
};

export default Header;
