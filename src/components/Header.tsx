import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"

const Header: React.FC = () => {

  const navigate = useNavigate();
  const [scrollWidth, setScrollWidth] = useState(0);

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
      className="w-full bg-black fixed top-0 z-50" 
      style={{ 
        width: `calc(100% - ${scrollWidth}px)`,
        right: `${scrollWidth}px` 
      }}
    >
      <div className="w-full mx-auto flex flex-col items-center relative">
        {/* 우측 버튼 + 검색창 */}
        <div className="absolute right-8 top-4 flex flex-col items-end gap-3 ">
          <div className="flex gap-3 pb-5">
            <button
              className="bg-gray-200 text-gray-800 text-xs font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-300 hover:shadow-md transition-all duration-200 min-w-[80px] h-[36px]"
              style={{
                fontSize: "12px",
                fontFamily: "'Noto Sans KR', 'Roboto', sans-serif",
              }}
            >
              로그아웃
            </button>
            <button
      onClick={() => navigate("/mypage")}
      className="bg-gray-200 text-gray-800 text-xs font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-300 hover:shadow-md transition-all duration-200 min-w-[80px] h-[36px]"
      style={{
        fontSize: "12px",
        fontFamily: "'Noto Sans KR', 'Roboto', sans-serif",
      }}
    >
      마이페이지
    </button>
          </div>

          {/* 검색창은 아래에 */}
          <div className="flex items-center bg-white rounded-lg overflow-hidden h-9">
            <input
              type="text"
              placeholder="검색"
              className="px-3 py-1 outline-none text-sm w-36"
            />
            <span className="px-2 text-gray-600 text-lg">🔍</span>
          </div>
        </div>

        {/* 중앙 로고 */}
        {/* <div
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "'Kolker Brush', cursive", fontSize: "90px" }}
        >
          OurLog */}
          {/* 이미지로 교체하려면: */}
          <div className="py-4">
            <img 
              src="/images/OurLog.png"
              alt="OurLog"
              className="h-[160px] object-contain"
            />
          </div>
         
        {/* </div> */}

        {/* 메뉴 */}
        {/* <nav
          className="flex gap-16 text-white font-light tracking-wide"
          style={{
            fontSize: "17px",
            fontFamily: "'Space Grotesk', 'sans-serif'",
          }}
        >
          <div className="relative cursor-pointer hover:opacity-80 after:block after:h-1 after:rounded-full after:mt-1 after:bg-pink-400">
            아트
          </div>
          <div className="relative cursor-pointer hover:opacity-80 after:block after:h-1 after:rounded-full after:mt-1 after:bg-blue-300">
            커뮤니티
          </div>
          <div className="relative cursor-pointer hover:opacity-80 after:block after:h-1 after:rounded-full after:mt-1 after:bg-yellow-200">
            랭킹
          </div>
        </nav> */}
      </div>
    </header>
  );
};

export default Header;