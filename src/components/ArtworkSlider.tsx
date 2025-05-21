import React, { useEffect, useState } from "react";
import "../styles/ArtworkSlider.css";
import { Link } from "react-router-dom";

interface Artwork {
  imageUrl: string;
  title: string;
  artist: string;
  highestBid: string;
  link: string;
  isArtist?: boolean;
}

const VIEWS_API_URL = "http://localhost:8080/ourlog/ranking?type=views";
const FOLLOWERS_API_URL = "http://localhost:8080/ourlog/ranking?type=followers";

const ArtworkSlider: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkIndexes, setArtworkIndexes] = useState<number[]>([]);
  const [artists, setArtists] = useState<Artwork[]>([]);
  const [artistIndexes, setArtistIndexes] = useState<number[]>([]);

  // 랜덤 인덱스 생성 함수 (중복 제거 + 개수 제한)
  const getRandomIndexes = (length: number, count: number): number[] => {
    const indexes: number[] = [];
    const maxCount = Math.min(count, length);
    while (indexes.length < maxCount) {
      const rand = Math.floor(Math.random() * length);
      if (!indexes.includes(rand)) {
        indexes.push(rand);
      }
    }
    return indexes;
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(VIEWS_API_URL);
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          title: item.title,
          artist: item.nickname || "unknown",
          highestBid:
            item.tradeDTO &&
            item.tradeDTO.highestBid &&
            !isNaN(Number(item.tradeDTO.highestBid)) &&
            Number(item.tradeDTO.highestBid) > 0
              ? `₩${Number(item.tradeDTO.highestBid).toLocaleString()}`
              : "",
          link: `/Art/${item.postId}`,
          isArtist: false,
          imageUrl: item.fileName
            ? `http://localhost:8080/images/${item.fileName}`
            : "/default-image.jpg",
        }));

        setArtworks(mapped);
        setArtworkIndexes(getRandomIndexes(mapped.length, 3));
      } catch (e) {
        console.error("인기 작품 불러오기 실패", e);
      }
    };

    const fetchArtists = async () => {
      try {
        const res = await fetch(FOLLOWERS_API_URL);
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          title: item.title || "대표작 없음",
          artist: item.nickname || "unknown",
          highestBid:
            item.tradeDTO &&
            item.tradeDTO.highestBid &&
            !isNaN(Number(item.tradeDTO.highestBid)) &&
            Number(item.tradeDTO.highestBid) > 0
              ? `₩${Number(item.tradeDTO.highestBid).toLocaleString()}`
              : "",
          link: item.nickname ? `/worker/${item.nickname}` : "/worker/unknown",
          isArtist: true,
          imageUrl: item.fileName
            ? `http://localhost:8080/images/${item.fileName}`
            : "/default-image.jpg",
        }));

        setArtists(mapped);
        setArtistIndexes(getRandomIndexes(mapped.length, 3));
      } catch (e) {
        console.error("주요 아티스트 불러오기 실패", e);
      }
    };

    fetchArtworks();
    fetchArtists();
  }, []);

  useEffect(() => {
    if (artworks.length === 0 || artists.length === 0) return;

    const interval = setInterval(() => {
      setArtworkIndexes(getRandomIndexes(artworks.length, 3));
      setArtistIndexes(getRandomIndexes(artists.length, 3));
    }, 3000);

    return () => clearInterval(interval);
  }, [artworks, artists]);

  const renderSection = (
    title: string,
    subtitle: string,
    data: Artwork[],
    indexes: number[]
  ) => (
    <>
      <Link to="/ranking" className="slider-title-link">
        <h2 className="slider-title">{title}</h2>
      </Link>
      <p className="slider-subtitle">{subtitle}</p>
      <div className="slider-wrapper">
        {data.length === 0 ? (
          <div className="artworkslider-empty">
            {title === "인기 작품 추천"
              ? "인기 작품이 없습니다."
              : "주요 아티스트가 없습니다."}
          </div>
        ) : (
          indexes.map((index) => {
            const item = data[index];
            if (!item) return null;
            return (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="artworkslider-card"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="artworkslider-img"
                />
                <div className="artworkslider-overlay">
                  <div className="artworkslider-title">{item.title}</div>
                  <div className="artworkslider-artist">{item.artist}</div>
                  {item.highestBid && (
                    <div className="artworkslider-price">{item.highestBid}</div>
                  )}
                </div>
              </a>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div>
      {renderSection(
        "인기 작품 추천",
        "사람들의 마음을 사로잡은 그림들을 소개합니다",
        artworks,
        artworkIndexes
      )}
      {renderSection(
        "주요 아티스트",
        "트렌드를 선도하는 아티스트들을 소개합니다",
        artists,
        artistIndexes
      )}
    </div>
  );
};

export default ArtworkSlider;
