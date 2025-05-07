import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import "../styles/header.css";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      <header className="header">
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
            <Link to="/">
              <img
                src="/images/OurLog.png"
                alt="OurLog 로고"
                className="logo-image"
              />
            </Link>
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
                      localStorage.removeItem("token");
                      setIsLoggedIn(false);
                      navigate("/");
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
            <Link to="/art">아트</Link>
            <Link to="/community">커뮤니티</Link>
            <Link to="/ranking">랭킹</Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
