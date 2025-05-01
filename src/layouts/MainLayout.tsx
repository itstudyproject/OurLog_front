import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../utils/cn'
import Header from '../components/Header'
import '../styles/Navbar.css'

export default function MainLayout() {
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
    <div className="min-h-screen bg-black">
      {/* <header 
        className="fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-sm" 
        style={{ 
          width: `calc(100% - ${scrollWidth}px)`,
          right: `${scrollWidth}px`
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-text-light">OurLog</div>
            <div className="flex items-center gap-8 text-text-medium">
              <a href="#" className="hover:text-text-light">경매</a>
              <a href="#" className="hover:text-text-light">아티스트</a>
              <a href="#" className="hover:text-text-light">로그인/회원가입</a>
            </div>
          </nav>
        </div>
      </header> */}
      <Header />
      <main className="pt-[160px]">
        <Outlet />
      </main>
      
      <footer className="bg-black/80 mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-text-dark text-sm">
            © 2024 OurLog. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 