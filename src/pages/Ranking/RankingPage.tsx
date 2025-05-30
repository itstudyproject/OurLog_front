import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RankingPage.css";
import { getAuthHeaders } from "../../utils/auth";
import { PostDTO } from "../../types/postTypes";

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

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(Number(num))) return "0";
  const numberValue = Number(num);
  if (numberValue >= 1_000_000)
    return (numberValue / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (numberValue >= 1_000) return (numberValue / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return numberValue.toString();
}

const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankingType, setRankingType] = useState<RankingKey>("views");
  const [artworks, setArtworks] = useState<PostDTO[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const loader = useRef(null);

  const fetchRankings = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        console.warn("인증 헤더를 가져올 수 없습니다.");
        setArtworks([]);
        return;
      }

      const res = await fetch(`${API_URL}?type=${rankingType}`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!res.ok) {
        console.error(`랭킹 데이터 요청 실패: ${res.status}`);
        if (res.status === 403) {
          console.warn("랭킹 데이터를 불러올 권한이 없습니다.");
          setArtworks([]);
          return;
        }
        setArtworks([]);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("🚨 랭킹 데이터 형식이 올바르지 않습니다. 배열이 필요합니다.");
        setArtworks([]);
        return;
      }

      const processedData: PostDTO[] = data.map((item: any) => ({
        postId: item.postId,
        userId: item.userId,
        title: item.title,
        content: item.content,
        nickname: item.nickname,
        fileName: item.fileName,
        boardNo: item.boardNo,
        views: item.views,
        tag: item.tag,
        thumbnailImagePath: item.thumbnailImagePath,
        resizedImagePath: item.resizedImagePath,
        originImagePath: item.originImagePath,
        followers: item.followCnt || item.followers || 0,
        downloads: item.downloads,
        favoriteCnt: item.favoriteCnt,
        tradeDTO: item.tradeDTO,
        pictureDTOList: item.pictureDTOList,
        profileImage: item.profileImage,
        replyCnt: item.replyCnt,
        regDate: item.regDate,
        modDate: item.modDate,
      }));

      if (rankingType === "followers") {
        const uniqueData = processedData.reduce((acc: PostDTO[], current: PostDTO) => {
          const exists = acc.find(item => item.userId === current.userId);
          if (!exists) {
            acc.push(current);
          } else if ((current.followers || 0) > (exists.followers || 0)) {
            const index = acc.indexOf(exists);
            acc[index] = current;
          }
          return acc;
        }, []);
        
        uniqueData.sort((a, b) => (b.followers || 0) - (a.followers || 0));
        setArtworks(uniqueData);
      } else {
        if (rankingType === 'views') {
          processedData.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (rankingType === 'downloads') {
          processedData.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        }
        setArtworks(processedData);
      }
      
      setVisibleCount(12);
    } catch (error) {
      console.error("🥶 랭킹 데이터 요청 실패:", error);
      setArtworks([]);
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

  const getImageUrl = (item: PostDTO, isArtistRanking: boolean): string => {
    let imageUrl = "/default-image.jpg";
    const BASE_URL = "http://localhost:8080/ourlog/picture/display";

    if (isArtistRanking) {
      if (item.profileImage) {
        return `${BASE_URL}/${item.profileImage}`;
      }
      if (item.resizedImagePath) {
        return `${BASE_URL}/${item.resizedImagePath}`;
      } else if (item.thumbnailImagePath) {
        return `${BASE_URL}/${item.thumbnailImagePath}`;
      } else if (item.originImagePath && (typeof item.originImagePath === 'string' ? item.originImagePath !== '' : item.originImagePath.length > 0)) {
        const path = typeof item.originImagePath === 'string' ? item.originImagePath : item.originImagePath[0];
        if (path) return `${BASE_URL}/${path}`;
      } else if (item.fileName) {
        return `${BASE_URL}/${item.fileName}`;
      } else if (item.pictureDTOList && item.pictureDTOList.length > 0) {
        const picData = item.pictureDTOList[0];
        if (picData.resizedImagePath) {
          return `${BASE_URL}/${picData.resizedImagePath}`;
        } else if (picData.thumbnailImagePath) {
          return `${BASE_URL}/${picData.thumbnailImagePath}`;
        } else if (picData.originImagePath) {
          return `${BASE_URL}/${picData.originImagePath}`;
        }
      }
    } else {
      if (item.resizedImagePath) {
        return `${BASE_URL}/${item.resizedImagePath}`;
      } else if (item.thumbnailImagePath) {
        return `${BASE_URL}/${item.thumbnailImagePath}`;
      } else if (item.originImagePath && (typeof item.originImagePath === 'string' ? item.originImagePath !== '' : item.originImagePath.length > 0)) {
        const path = typeof item.originImagePath === 'string' ? item.originImagePath : item.originImagePath[0];
        if (path) return `${BASE_URL}/${path}`;
      } else if (item.fileName) {
        return `${BASE_URL}/${item.fileName}`;
      } else if (item.pictureDTOList && item.pictureDTOList.length > 0) {
        const picData = item.pictureDTOList[0];
        if (picData.resizedImagePath) {
          return `${BASE_URL}/${picData.resizedImagePath}`;
        } else if (picData.thumbnailImagePath) {
          return `${BASE_URL}/${picData.thumbnailImagePath}`;
        } else if (picData.originImagePath) {
          return `${BASE_URL}/${picData.originImagePath}`;
        }
      } else if (item.profileImage) {
        // return `${BASE_URL}/${item.profileImage}`;
      }
    }

    return imageUrl;
  };

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
        {podiumOrder.map((idx) =>
          podium[idx] ? (
            <div
              key={`podium-${rankingType}-${idx}-${rankingType === 'followers' ? podium[idx].userId : podium[idx].postId}`}
              className={`ranking-podium-card ${
                idx === 0 ? "first" : idx === 1 ? "second" : "third"
              }`}
            >
              <div
                className="ranking-podium-image-card"
                onClick={() => navigate(rankingType === 'followers' ? `/worker/${podium[idx].userId}` : `/Art/${podium[idx].postId}`)}
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
                  src={getImageUrl(podium[idx], rankingType === 'followers')}
                  alt={rankingType === 'followers' ? `${podium[idx].nickname} 대표 이미지` : podium[idx].title}
                  className="podium-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-image.jpg";
                  }}
                />
                {rankingType === 'followers' && podium[idx].profileImage && (
                  <img
                    src={`http://localhost:8080/ourlog/picture/display/${podium[idx].profileImage}`}
                    alt={`${podium[idx].nickname} 아바타`}
                    className="podium-avatar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/default-avatar.png";
                    }}
                  />
                )}
                {rankingType === 'followers' && (
                  <div
                    className="ranking-author-info large"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/worker/${podium[idx].userId}`);
                    }}
                  >
                    <span className="ranking-list-author">{podium[idx].nickname}</span>
                    <span className="ranking-list-meta">
                      {`👥 ${formatNumber(podium[idx].followers)}`}
                    </span>
                  </div>
                )}
                {rankingType === 'views' && (
                  <div
                    className="ranking-author-info large"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/Art/${podium[idx].postId}`);
                    }}
                  >
                    <span className="ranking-list-author">{podium[idx].title}</span>
                    <span className="ranking-list-meta">
                      {formatNumber(podium[idx].views) !== "0" && `👁️ ${formatNumber(podium[idx].views)}`}
                    </span>
                  </div>
                )}
                {rankingType === 'downloads' && (
                  <div
                    className="ranking-author-info large"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/Art/${podium[idx].postId}`);
                    }}
                  >
                    <span className="ranking-list-author">{podium[idx].title}</span>
                    <span className="ranking-list-meta">
                      {formatNumber(podium[idx].downloads) !== "0" && `⬇️ ${formatNumber(podium[idx].downloads)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="ranking-list-row">
        {rest.map((art, idx) => (
          <div 
            key={`rest-${rankingType}-${idx}-${rankingType === 'followers' ? art.userId : art.postId}`} 
            className="ranking-list-card"
          >
            <div className="ranking-list-badge">{idx + 4}</div>
            <img
              src={getImageUrl(art, rankingType === 'followers')}
              alt={rankingType === 'followers' ? `${art.nickname} 대표 이미지` : art.title}
              className="ranking-list-image-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-image.jpg";
              }}
              onClick={() => navigate(rankingType === 'followers' ? `/worker/${art.userId}` : `/Art/${art.postId}`)}
            />
            {rankingType === 'followers' && art.profileImage && (
              <img
                src={`http://localhost:8080/ourlog/picture/display/${art.profileImage}`}
                alt={`${art.nickname} 아바타`}
                className="ranking-list-avatar"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/default-avatar.png";
                }}
              />
            )}
            {rankingType === 'followers' && (
              <div
                className="ranking-author-info small"
                onClick={() => navigate(`/worker/${art.userId}`)}
              >
                <span className="ranking-list-author">{art.nickname}</span>
                <span className="ranking-list-meta right-align">
                  {`👥 ${formatNumber(art.followers)}`}
                </span>
              </div>
            )}
            {rankingType === 'views' && (
              <div
                className="ranking-author-info small"
                onClick={() => navigate(`/Art/${art.postId}`)}
              >
                <span className="ranking-list-author">{art.title}</span>
                <span className="ranking-list-meta right-align">
                  {formatNumber(art.views) !== "0" && `👁️ ${formatNumber(art.views)}`}
                </span>
              </div>
            )}
            {rankingType === 'downloads' && (
              <div
                className="ranking-author-info small"
                onClick={() => navigate(`/Art/${art.postId}`)}
              >
                <span className="ranking-list-author">{art.title}</span>
                <span className="ranking-list-meta right-align">
                  {formatNumber(art.downloads) !== "0" && `⬇️ ${formatNumber(art.downloads)}`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div ref={loader} style={{ height: 40 }} />
    </div>
  );
};

export default RankingPage;
