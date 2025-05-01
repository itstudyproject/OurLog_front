import React, { useState } from "react";
import sidebaImg from "../../public/images/side";
import closeImg from "../assets/img/close.png";
import mypageImg from "../assets/img/mypage.png";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="w-full bg-gray-900 fixed top-0 z-50 py-4 px-50">
      <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between">
        {/* 왼쪽: 햄버거 이미지 버튼 */}
        <div className="flex-1 flex justify-start">
          <img
            src={sidebaImg}
            alt="메뉴"
            className="w-8 h-8 cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        {/* 가운데: 로고 */}
        {/* 로고 중앙 - 웹사이트 기준 중앙 정렬 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="text-white text-4xl font-bold"
            style={{
              fontFamily: "'Kolker Brush', cursive",
              fontSize: "50px",
            }}
          >
            OurLog
          </div>
        </div>
        {/* 로고 중앙 - 웹사이트 기준 중앙 정렬 */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div
            className="text-white text-4xl font-bold"
            style={{
              fontFamily: "'Kolker Brush', cursive",
              fontSize: "50px",
            }}
          >
            OurLog
          </div>
        </div>

        {/* 오른쪽: 검색 + 버튼 */}
        {/* 오른쪽: 검색창 + 마이페이지/로그아웃 */}
        <div className="flex items-center gap-6 text-white">
          {/* SEARCH 텍스트 */}
          <div className="text-xs font-bold tracking-wide">SEARCH</div>

          {/* 검색창 - 언더라인 스타일 */}
          <div className="border-b border-white flex items-center gap-2 pb-[2px]">
            <input
              type="text"
              placeholder="검색"
              className="bg-transparent outline-none text-sm placeholder-white text-white w-[160px]"
            />
            <span className="text-white text-sm">🔍</span>
          </div>

          {/* 마이페이지 / 로그아웃 버튼 */}
          <div className="flex items-center gap-4 text-sm font-semibold">
            {/* 마이페이지 이미지 */}
            <img
              src={mypageImg}
              alt="마이페이지"
              className="w-6 h-6 cursor-pointer hover:opacity-80"
              onClick={() => {
                console.log("마이페이지 클릭");
                // 여기서 라우팅 또는 이동 처리 가능
              }}
            />
            {/* 로그아웃 버튼 */}
            <button className="hover:text-gray-300 transition">로그아웃</button>
          </div>
        </div>
      </div>

      {/* 👉 사이드바 메뉴 */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 z-50 shadow-lg transition-transform">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">메뉴</h2>
            <img
              src={closeImg}
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
    </header>
  );
};

export default Navbar;
