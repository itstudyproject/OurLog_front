import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import "../styles/header.css";

interface HeaderProps {
  scrollWidth?: number;
}

const Header: React.FC<HeaderProps> = ({ scrollWidth = 0 }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ✅ 임시 로그인 상태

  return (
    <>
      <header className="header" style={{ marginRight: `${scrollWidth}px` }}>
        <div className="header-inner">
          {/* 왼쪽: 햄버거 버튼 */}
          <div className="sidebar-button">
            <img
              src="/images/sideba.png"
              alt="메뉴"
              className="menu-icon"
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
          {/* 가운데: 로고 */}
          <div className="logo-container">
            <img
              src="/images/OurLog.png"
              alt="OurLog 로고"
              className="logo-image"
            />
          </div>

          {/* 오른쪽: 검색 + 마이페이지/로그아웃 */}
          <div className="right-section">
            <div className="search-label">SEARCH</div>
            <div className="search-box">
              <input type="text" placeholder="검색" className="search-input" />
              <span className="search-icon">🔍</span>
            </div>
            <div className="user-menu">
              {isLoggedIn ? (
                <>
                  <img
                    src="/images/mypage.png"
                    alt="마이페이지"
                    className="mypage-icon"
                  />
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
      {isSidebarOpen && (
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">메뉴</h2>
            <img
              src="/images/close.png"
              alt="닫기"
              className="sidebar-close"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <nav className="sidebar-nav">
            <a href="#">아트</a>
            <a 
            onClick={() => {
                navigate("/PostList");
                setIsSidebarOpen(false);
              }}
              className="hover:text-blue-300"
            >
              커뮤니티
            </a>
            <a href="#">랭킹</a>
          </nav>
        </div>
      )}
    </>
  );
};
export default Header;
