import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RankingPage.css";

// ✅ Artwork 타입 선언
type Artwork = {
  id: number;
  title: string;
  author: string;
  imageSrc: string;
  avatar: string;
  views: number;
  followers: number;
  downloads: number;
};

// ✅ rankingType 키를 타입으로 명시
type RankingKey = "views" | "followers" | "downloads";

const artworks: Artwork[] = [
  {
    id: 1,
    title: "푸른 들판의 산책",
    author: "XII",
    imageSrc: "/images/post1.jpg",
    avatar: "/images/avatar1.jpg",
    views: 1200,
    followers: 320,
    downloads: 150,
  },
  {
    id: 2,
    title: "구름 위 고양이",
    author: "XOXO",
    imageSrc: "/images/post4.jpg",
    avatar: "/images/avatar2.jpg",
    views: 980,
    followers: 410,
    downloads: 210,
  },
  {
    id: 3,
    title: "푸른 들판의 산책",
    author: "XII",
    imageSrc: "/images/post1.jpg",
    avatar: "/images/avatar1.jpg",
    views: 870,
    followers: 290,
    downloads: 180,
  },
  {
    id: 4,
    title: "디지털 도시 풍경",
    author: "디자인시티",
    imageSrc: "/images/post5.jpg",
    avatar: "/images/avatar3.jpg",
    views: 760,
    followers: 380,
    downloads: 190,
  },
  {
    id: 5,
    title: "우주 고래",
    author: "크리에이터K",
    imageSrc: "/images/post8.jpg",
    avatar: "/images/avatar4.jpg",
    views: 650,
    followers: 350,
    downloads: 170,
  },
  {
    id: 6,
    title: "몽환적 숲",
    author: "판타지작가",
    imageSrc: "/images/post10.jpg",
    avatar: "/images/avatar5.jpg",
    views: 540,
    followers: 320,
    downloads: 150,
  },
  {
    id: 7,
    title: "미래 도시",
    author: "사이버펑크",
    imageSrc: "/images/post12.jpg",
    avatar: "/images/avatar6.jpg",
    views: 430,
    followers: 290,
    downloads: 130,
  },
  {
    id: 8,
    title: "뚱글뚱글 파스타",
    author: "미니맘",
    imageSrc: "/images/post15.jpg",
    avatar: "/images/avatar7.jpg",
    views: 320,
    followers: 260,
    downloads: 110,
  },
  {
    id: 9,
    title: "구름 속 고래",
    author: "하늘고래",
    imageSrc: "/images/post16.jpg",
    avatar: "/images/avatar8.jpg",
    views: 210,
    followers: 230,
    downloads: 90,
  },
  {
    id: 10,
    title: "풍경 스케치",
    author: "스케치마스터",
    imageSrc: "/images/post1.jpg",
    avatar: "/images/avatar9.jpg",
    views: 100,
    followers: 200,
    downloads: 70,
  },
  {
    id: 11,
    title: "고요한 바다",
    author: "블루오션",
    imageSrc: "/images/post2.jpg",
    avatar: "/images/avatar10.jpg",
    views: 50,
    followers: 180,
    downloads: 50,
  },
  {
    id: 12,
    title: "가을 단풍길",
    author: "계절화가",
    imageSrc: "/images/post3.jpg",
    avatar: "/images/avatar11.jpg",
    views: 30,
    followers: 160,
    downloads: 30,
  },
  {
    id: 13,
    title: "도시의 밤",
    author: "나이트라이프",
    imageSrc: "/images/post4.jpg",
    avatar: "/images/avatar12.jpg",
    views: 20,
    followers: 140,
    downloads: 20,
  },
  {
    id: 14,
    title: "꿈속의 세계",
    author: "드림웍스",
    imageSrc: "/images/post5.jpg",
    avatar: "/images/avatar13.jpg",
    views: 10,
    followers: 120,
    downloads: 10,
  },
  {
    id: 15,
    title: "봄의 향기",
    author: "꽃그림작가",
    imageSrc: "/images/post8.jpg",
    avatar: "/images/avatar14.jpg",
    views: 5,
    followers: 100,
    downloads: 5,
  },
  {
    id: 16,
    title: "디지털 추상",
    author: "추상주의",
    imageSrc: "/images/post10.jpg",
    avatar: "/images/avatar15.jpg",
    views: 3,
    followers: 80,
    downloads: 3,
  },
  {
    id: 17,
    title: "정물화 시리즈",
    author: "정물화가",
    imageSrc: "/images/post12.jpg",
    avatar: "/images/avatar16.jpg",
    views: 2,
    followers: 60,
    downloads: 2,
  },
  {
    id: 18,
    title: "파스텔 드림",
    author: "드리머",
    imageSrc: "/images/post15.jpg",
    avatar: "/images/avatar17.jpg",
    views: 1,
    followers: 40,
    downloads: 1,
  },
];

const badgeColors = [
  { bg: "#f8c147", color: "#222" },
  { bg: "#b0b0b0", color: "#222" },
  { bg: "#a67c52", color: "#fff" },
];

const podiumOrder = [0, 1, 2];
const rankingTypes = [
  { key: "views", label: "조회수" },
  { key: "followers", label: "팔로우" },
  { key: "downloads", label: "다운로드" },
];

const RankingPage = () => {
  const navigate = useNavigate();
  const [rankingType, setRankingType] = useState<RankingKey>("views");
  const [visibleCount, setVisibleCount] = useState(12);
  const loader = useRef(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setVisibleCount((prev) => Math.min(prev + 6, artworks.length));
    }
  }, []);

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const sortedArtworks = [...artworks].sort(
    (a, b) => b[rankingType] - a[rankingType]
  );

  const podium = sortedArtworks.slice(0, 3);
  const rest = sortedArtworks.slice(3, visibleCount);

  return (
    <div className="art-list-container">
      <div className="ranking-banner">
        <img src="/images/topranking.png" alt="TOP RANKING!" />
      </div>

      <div className="ranking-type-tab">
        {rankingTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setRankingType(type.key as RankingKey)}
            className={`ranking-type-button ${
              rankingType === type.key ? "active" : "inactive"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="ranking-podium-row">
        {podiumOrder.map((idx) => (
          <div
            key={idx}
            className={`ranking-podium-card ${
              idx === 0 ? "first" : idx === 1 ? "second" : "third"
            }`}
          >
            <div
              className="ranking-podium-image-card"
              onClick={() => navigate(`/Art/${podium[idx].id}`)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="ranking-badge"
                style={{
                  background: badgeColors[idx].bg,
                  color: badgeColors[idx].color,
                }}
              >
                {idx + 1}
              </div>
              <img
                src={podium[idx].imageSrc}
                alt={podium[idx].title}
                className="podium-image"
              />
              <div
                className="ranking-author-info large"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${podium[idx].author}`);
                }}
              >
                <img
                  src={podium[idx].avatar}
                  alt={podium[idx].author}
                  className="ranking-author-avatar large"
                />
                <span className="ranking-list-author">
                  {podium[idx].author}
                </span>
                <span className="ranking-list-meta">
                  {rankingType === "views" && `👁️ ${podium[idx].views}`}
                  {rankingType === "followers" && `👥 ${podium[idx].followers}`}
                  {rankingType === "downloads" && `⬇️ ${podium[idx].downloads}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ranking-list-row">
        {rest.map((art, idx) => (
          <div key={art.id} className="ranking-list-card">
            <div className="ranking-list-badge">{idx + 4}</div>
            <img
              src={art.imageSrc}
              alt={art.title}
              className="ranking-list-image-full"
            />
            <div
              className="ranking-author-info small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${art.author}`);
              }}
            >
              <img
                src={art.avatar}
                alt={art.author}
                className="ranking-author-avatar"
              />
              <span className="ranking-list-author">{art.author}</span>
              <span className="ranking-list-meta">
                {rankingType === "views" && `👁️ ${art.views}`}
                {rankingType === "followers" && `👥 ${art.followers}`}
                {rankingType === "downloads" && `⬇️ ${art.downloads}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} style={{ height: 40 }} />
    </div>
  );
};

export default RankingPage;
