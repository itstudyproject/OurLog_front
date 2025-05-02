import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 z-50 w-full py-4 bg-gray-900 px-50">
      <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between">
        {/* 왼쪽: 햄버거 이미지 버튼 */}
        <div className="flex justify-start flex-1">
          <img
            src="/images/sideba.png" // ✅ public 폴더 경로
            alt="메뉴"
            className="w-8 h-8 cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        {/* 가운데: 로고 */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div
            className="text-4xl font-bold text-white"
            style={{
              fontFamily: "'Kolker Brush', cursive",
              fontSize: "50px",
            }}
          >
            OurLog
          </div>
        </div>

        {/* 오른쪽: 검색창 + 마이페이지/로그아웃 */}
        <div className="flex items-center gap-6 text-white">
          <div className="text-xs font-bold tracking-wide">SEARCH</div>

          <div className="border-b border-white flex items-center gap-2 pb-[2px]">
            <input
              type="text"
              placeholder="검색"
              className="bg-transparent outline-none text-sm placeholder-white text-white w-[160px]"
            />
            <span className="text-sm text-white">🔍</span>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            {/* ✅ 마이페이지 이미지 - public 사용 */}
            <img
              src="/images/mypage.png"
              alt="마이페이지"
              className="w-6 h-6 cursor-pointer hover:opacity-80"
              onClick={() => {
                console.log("마이페이지 클릭");
              }}
            />
            <button className="transition hover:text-gray-300">로그아웃</button>
          </div>
        </div>
      </div>

      {/* 👉 사이드바 메뉴 */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 z-50 w-64 h-full p-6 text-white transition-transform bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">메뉴</h2>
            {/* ✅ 닫기 이미지 - public 사용 */}
            <img
              src="/images/close.png"
              alt="닫기"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <nav className="flex flex-col gap-4 text-lg">
            <a 
            onClick={() => {
                navigate("/Art");
                setIsSidebarOpen(false);
              }}
              className="hover:text-pink-400 cursor-pointer"
            >
              아트
            </a>
            <a
              onClick={() => {
                navigate("/Post");
                setIsSidebarOpen(false);
              }}
              className="hover:text-blue-300 cursor-pointer"
            >
              커뮤니티
            </a>
            <a href="#" className="hover:text-yellow-200 cursor-pointer">
              랭킹
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
