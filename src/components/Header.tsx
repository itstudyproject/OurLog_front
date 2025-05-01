import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header: React.FC = () => {
  const [scrollWidth, setScrollWidth] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 (임시)

  useEffect(() => {
    // 스크롤바 너비 계산
    const calculateScrollbarWidth = () => {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      document.body.removeChild(outer);

      setScrollWidth(scrollbarWidth);
    };

    calculateScrollbarWidth();
    window.addEventListener('resize', calculateScrollbarWidth);

    return () => {
      window.removeEventListener('resize', calculateScrollbarWidth);
    };
  }, []);

  return (
    <header 
      className="header"
      style={{ 
        width: `calc(100% - ${scrollWidth}px)`,
        right: `${scrollWidth}px` 
      }}
    >
      <div className="header-container">
        {/* 우측 버튼 + 검색창 */}
        <div className="header-buttons">
          <div className="buttons-wrapper">
            {/* {isLoggedIn ? ( */}
              {/* <> */}
                <Link to="/logout" className="header-button">로그아웃</Link>
                <Link to="/profile/edit" className="header-button">마이페이지</Link>
              {/* </> */}
            {/* ) : ( */}
              <Link to="/login" className="header-button">로그인</Link>
            {/* )} */}
          </div>

          {/* 검색창은 아래에 */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="검색"
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* 중앙 로고 */}
        <Link to="/" className="logo-link">
          <img 
            src="/images/OurLog.png"
            alt="OurLog"
            className="logo-image"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;