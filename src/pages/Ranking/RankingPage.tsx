import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RankingPage.css";

type Artwork = {
  id: number;
  title: string;
  author: string;
  imageSrc: string;
  avatar: string;
  views: number;
  followers: number;
  downloads: number;
  originImagePath?: string;
  resizedImagePath?: string;
  thumbnailImagePath?: string;
  fileName?: string;
  pictureDTOList?: Array<{
    originImagePath?: string;
    resizedImagePath?: string;
    thumbnailImagePath?: string;
    fileName?: string;
  }> | null;
};

type RankingKey = "views" | "followers" | "downloads";

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

const API_URL = "http://localhost:8080/ourlog/ranking";

function formatNumber(num: number): string {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankingType, setRankingType] = useState<RankingKey>("views");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const loader = useRef(null);

  const fetchRankings = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}?type=${rankingType}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const contentType = res.headers.get("Content-Type") || "";
      const raw = await res.text();

      if (!res.ok || !contentType.includes("application/json")) {
        console.error("🚨 JSON 응답이 아님:", res.status, raw);
        return;
      }

      const data = JSON.parse(raw);
      const mapped: Artwork[] = data.map((item: any) => {
        let artworkImageSrc = "/default-image.jpg";

        const picData = (item.pictureDTOList && item.pictureDTOList.length > 0) ? item.pictureDTOList[0] : item;

        if (picData.resizedImagePath) {
          artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.resizedImagePath}`;
        } else if (picData.thumbnailImagePath) {
          artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.thumbnailImagePath}`;
        } else if (picData.originImagePath) {
          artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.originImagePath}`;
        } else if (picData.fileName) {
          artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.fileName}`;
        }

        return {
          id: item.postId,
          title: item.title,
          author: item.nickname || "익명",
          avatar: item.profileImage
              ? `http://localhost:8080/ourlog/picture/display/${item.profileImage}`
              : "/images/default-avatar.png",
          imageSrc: artworkImageSrc,
          views: item.views,
          followers: item.followers,
          downloads: item.downloads,
          originImagePath: item.originImagePath,
          resizedImagePath: item.resizedImagePath,
          thumbnailImagePath: item.thumbnailImagePath,
          fileName: item.fileName,
          pictureDTOList: item.pictureDTOList
        };
      });

      setArtworks(mapped);
    } catch (error) {
      console.error("🥶 랭킹 데이터 요청 실패:", error);
    }
  }, [rankingType]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 6, artworks.length));
      }
    },
    [artworks.length]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const podium = artworks.slice(0, 3);
  const rest = artworks.slice(3, visibleCount);

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

      {/* 🥇 Top 3 */}
      <div className="ranking-podium-row">
        {podiumOrder.map((idx) =>
          podium[idx] ? (
            <div
              key={idx}
              className={`ranking-podium-card ${
                idx === 0 ? "first" : idx === 1 ? "second" : "third"
              }`}
            >
              <div
                className="ranking-podium-image-card"
                onClick={() => navigate(`/Art/${podium[idx].id}`)}
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
                  <span className="ranking-list-author">
                    {podium[idx].author}
                  </span>
                  <span className="ranking-list-meta">
                    {rankingType === "views" && `👁️ ${podium[idx].views}`}
                    {rankingType === "followers" &&
                      `👥 ${podium[idx].followers}`}
                    {rankingType === "downloads" &&
                      `⬇️ ${podium[idx].downloads}`}
                  </span>
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* 🔢 나머지 리스트 */}
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
              onClick={() => navigate(`/profile/${art.author}`)}
            >
              <span className="ranking-list-author">{art.author}</span>
              <span className="ranking-list-meta right-align">
                {rankingType === "views" && `👁️ ${formatNumber(art.views)}`}
                {rankingType === "followers" &&
                  `👥 ${formatNumber(art.followers)}`}
                {rankingType === "downloads" &&
                  `⬇️ ${formatNumber(art.downloads)}`}
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
