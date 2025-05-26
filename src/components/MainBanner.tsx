import React, { useEffect, useState } from "react";
import "../styles/MainBanner.css";

const MainBanner: React.FC = () => {
  const images = [
    "/images/mainbanner6.png",
    "/images/mainbanner8.png",
    "/images/mainbanner7.png",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // 4초마다 이미지 변경

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, [images.length]);

  return (
    <div className="main-banner">
      <div className="overlay" />
      <div className="text-content">
        <h1 className="highlight banner-title">OurLog</h1>
        <p className="subtitle">당신의 이야기가 작품이 되는 곳</p>
        <p className="subtitle">아티스트와 컬렉터가 만나는 특별한 공간</p>
        <br />
      </div>
      <img
        className="banner-image"
        src={images[currentIndex]}
        alt={`Art Banner ${currentIndex + 1}`}
      />
    </div>
  );
};

export default MainBanner;
