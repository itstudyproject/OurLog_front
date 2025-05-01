import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-black fixed top-0 z-50 h-[160px] px-50 opacity-90">
        <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between h-full">
          {/* 왼쪽: 햄버거 버튼 */}
          <div className="flex-1 flex justify-start">
            <img
              src="/images/sideba.png"
              alt="메뉴"
              className="w-8 h-8 cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>

          {/* 가운데: 로고 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src="/images/OurLog.png"
              alt="OurLog 로고"
              className="h-[100px]"
            />
          </div>

          {/* 오른쪽: 검색 + 마이페이지/로그아웃 */}
          <div className="flex-1 flex justify-end items-center gap-6 text-white">
            <div className="text-xs font-bold tracking-wide">SEARCH</div>
            <div className="border-b border-white flex items-center gap-2 pb-[2px]">
              <input
                type="text"
                placeholder="검색"
                className="bg-transparent outline-none text-sm placeholder-white text-white w-[160px]"
              />
              <span className="text-white text-sm">🔍</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <img
                src="/images/mypage.png"
                alt="마이페이지"
                className="w-6 h-6 cursor-pointer hover:opacity-80"
              />
              <div className="text-xs font-bold tracking-wide hover:text-gray-300 transition">
                LOGOUT
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ 사이드바는 여기 추가 */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-black text-white p-6 z-50 shadow-lg transition-transform">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">메뉴</h2>
            <img
              src="/images/close.png"
              alt="닫기"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <nav className="flex flex-col gap-4 text-lg">
            <a href="#" className="hover:text-pink-400">
              아트
            </a>
            <a href="#" className="hover:text-blue-300">
              커뮤니티
            </a>
            <a href="#" className="hover:text-yellow-200">
              랭킹
            </a>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
