import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import "../styles/header.css";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email?: string;
    profileImage?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);
    }
    if (user) {
      setUserInfo(JSON.parse(user));
    }

    const handleLogin = () => {
      setIsLoggedIn(true);
      const u = localStorage.getItem("user");
      if (u) setUserInfo(JSON.parse(u));
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      setUserInfo(null);
    };

    window.addEventListener("login", handleLogin);
    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

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
            <Link to="/">
              <img
                src="/images/OurLog.png"
                alt="OurLog 로고"
                className="logo-image"
              />
            </Link>
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
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.dispatchEvent(new Event("logout"));
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
            <Link to="/ArtList">아트</Link>
            <Link to="/PostList">커뮤니티</Link>
            <Link to="/ranking">랭킹</Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
