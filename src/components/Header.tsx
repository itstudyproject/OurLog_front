import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import "../styles/header.css";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 처음엔 로그아웃 상태
  const [userInfo, setUserInfo] = useState<{
    email: string;
    profileImage?: string;
  } | null>(null);

  const [keyword, setKeyword] = useState(""); // ✅ 검색어 상태 추가

  const navigate = useNavigate();

  // 로그인 상태 및 유저 정보 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (err) {
        console.error("user 정보 파싱 오류:", err);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }

    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setIsLoggedIn(true);
        setUserInfo(JSON.parse(storedUser));
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    window.addEventListener("login", handleAuthChange);
    window.addEventListener("logout", handleAuthChange);

    return () => {
      window.removeEventListener("login", handleAuthChange);
      window.removeEventListener("logout", handleAuthChange);
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
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      localStorage.removeItem("autoLoginUser");
                      setIsLoggedIn(false);
                      setUserInfo(null);
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
