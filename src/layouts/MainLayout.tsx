import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
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
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-[160px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
