import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hasToken, removeToken } from "../utils/auth";
// @ts-ignore
import "../styles/header.css";

interface HeaderProps {
  scrollWidth?: number;
}

const Header: React.FC<HeaderProps> = ({ scrollWidth }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    userId?: number;
    profileImage?: string;
  } | null>(null);
  const [keyword, setKeyword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
        setIsLoggedIn(true);
        
        // 로그인 이벤트 발생 시에만 알림 표시
        if (sessionStorage.getItem("loginEvent") === "true") {
          setShowNotification(true);
          // 플래그 제거
          sessionStorage.removeItem("loginEvent");
          // 5초 후 알림 숨기기
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      } catch (err) {
        console.error("user 정보 파싱 오류:", err);
        setIsLoggedIn(false);
        setUserInfo(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    checkLoginStatus();

    // 로그인/로그아웃 이벤트 리스너 등록
    const handleLoginEvent = () => {
      checkLoginStatus();
    };

    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      setUserInfo(null);
      setShowNotification(false);
    };

    window.addEventListener("login", handleLoginEvent);
    window.addEventListener("logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, []);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user");
    localStorage.removeItem("autoLoginUser");
    setIsLoggedIn(false);
    setUserInfo(null);
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  };

  return (
    <>
      {showNotification && userInfo && (
        <div className="login-notification">
          <div className="notification-content">
            <img src={userInfo.profileImage || "/images/mypage.png"} alt="프로필" className="notification-profile" />
            <div className="notification-text">
              <p className="notification-welcome">환영합니다!</p>
              <p className="notification-info">
                <span className="notification-label">이메일:</span> {userInfo.email}
              </p>
              <p className="notification-info">
                <span className="notification-label">사용자 ID:</span> {userInfo.userId || '정보 없음'}
              </p>
            </div>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

          <div className="logo-container" onClick={() => navigate("/")}>
            <img
              src="/images/OurLog.png"
              alt="OurLog 로고"
              className="logo-image"
            />
          </div>

          <div className="right-section">
            <div className="search-label">SEARCH</div>
            <div className="search-box">
              <input
                type="text"
                placeholder="검색"
                className="search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/search?query=${encodeURIComponent(keyword)}`);
                  }
                }}
              />
              <span
                className="search-icon"
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(keyword)}`)
                }
              >
                🔍
              </span>
            </div>
            <div className="user-menu">
              {isLoggedIn ? (
                <>
                  <Link to={"/mypage"}>
                    <img
                      src={userInfo?.profileImage ?? "/images/mypage.png"}
                      alt="마이페이지"
                      className="mypage-icon"
                    />
                  </Link>
                  <div
                    className="logout"
                    onClick={handleLogout}
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
            <Link to="/art">아트 게시판</Link>
          </div>

          {/* 커뮤니티 섹션 */}
          <Link to="/post" className="sidebar-section-title">
            커뮤니티
          </Link>
          <div className="sidebar-section-sub">
            <Link to="/post/news">새소식</Link>
            <Link to="/post/free">자유게시판</Link>
            <Link to="/post/promotion">홍보 게시판</Link>
            <Link to="/post/request">요청 게시판</Link>
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
