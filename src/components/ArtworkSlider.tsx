import React, { useEffect, useState } from "react";
import "../styles/ArtworkSlider.css";

interface Artwork {
  imageUrl: string;
  title: string;
  artist: string;
  price: string;
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

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(VIEWS_API_URL);
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          title: item.title,
          artist: item.userProfileDTO?.nickname || "unknown",
          price:
            typeof item.price === "number" && item.price > 0
              ? `₩${item.price.toLocaleString()}`
              : "",
          link: `/Art/${item.postId}`,
          isArtist: false,
        }));

        setArtworks(mapped);

        const initialIndexes: number[] = [];
        while (initialIndexes.length < 3 && mapped.length > 0) {
          const rand = Math.floor(Math.random() * mapped.length);
          if (!initialIndexes.includes(rand)) {
            initialIndexes.push(rand);
          }
        }
        setArtworkIndexes(initialIndexes);
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
          artist: item.userProfileDTO?.nickname || "unknown",
          price: "",
          link: `/worker/${item.userProfileDTO.userId}`,
          isArtist: true,
        }));

        setArtists(mapped);

        // 초기 3개 랜덤 인덱스 생성
        const initialIndexes: number[] = [];
        while (initialIndexes.length < 3 && mapped.length > 0) {
          const rand = Math.floor(Math.random() * mapped.length);
          if (!initialIndexes.includes(rand)) {
            initialIndexes.push(rand);
          }
        }
        setArtistIndexes(initialIndexes);
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
      const newArtworkIndexes: number[] = [];
      while (newArtworkIndexes.length < 3 && artworks.length > 0) {
        const rand = Math.floor(Math.random() * artworks.length);
        if (!newArtworkIndexes.includes(rand)) {
          newArtworkIndexes.push(rand);
        }
      }
      setArtworkIndexes(newArtworkIndexes);

      const newArtistIndexes: number[] = [];
      while (newArtistIndexes.length < 3 && artists.length > 0) {
        const rand = Math.floor(Math.random() * artists.length);
        if (!newArtistIndexes.includes(rand)) {
          newArtistIndexes.push(rand);
        }
      }
      setArtistIndexes(newArtistIndexes);
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
      <h2 className="slider-title">{title}</h2>
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
                  {item.price && (
                    <div className="artworkslider-price">{item.price}</div>
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
