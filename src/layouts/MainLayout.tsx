import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Header.css";
import Footer from "../components/Footer";

export default function MainLayout() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    // 스크롤바 너비 계산
    const calculateScrollbarWidth = () => {
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      document.body.appendChild(outer);

      const inner = document.createElement("div");
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      document.body.removeChild(outer);

      setScrollWidth(scrollbarWidth);
    };

    calculateScrollbarWidth();
    window.addEventListener("resize", calculateScrollbarWidth);

    return () => {
      window.removeEventListener("resize", calculateScrollbarWidth);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header scrollWidth={scrollWidth} />
      <main className="flex-grow md:pt-[160px] sm:pt-[120px] pt-[100px] transition-all duration-300">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
