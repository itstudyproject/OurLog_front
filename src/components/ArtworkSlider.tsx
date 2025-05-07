import React, { useEffect, useState } from "react";
import "../styles/artworkSlider.css";

interface Artwork {
  imageUrl: string;
  title: string;
  artist: string;
  price: string;
  link: string;
}

const generateRandomImageUrl = (index: number) => {
  return `https://picsum.photos/seed/${index}/600/600`;
};

const artworks: Artwork[] = [
  {
    imageUrl: generateRandomImageUrl(0),
    title: "Circulation 1",
    artist: "권봄이",
    price: "₩2,500,000",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(1),
    title: "Modern Flow",
    artist: "이서연",
    price: "₩3,000,000",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(2),
    title: "Blue Storm",
    artist: "정윤아",
    price: "₩1,800,000",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(3),
    title: "Bright Day",
    artist: "김하늘",
    price: "₩2,200,000",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(4),
    title: "Silent Woods",
    artist: "박지우",
    price: "₩2,700,000",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(5),
    title: "Golden Hour",
    artist: "최서윤",
    price: "₩3,100,000",
    link: "#",
  },
];

const artists: Artwork[] = [
  {
    imageUrl: generateRandomImageUrl(10),
    title: "Art 1",
    artist: "최지영",
    price: "",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(11),
    title: "Art 2",
    artist: "이동우",
    price: "",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(12),
    title: "Art 3",
    artist: "김민서",
    price: "",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(13),
    title: "Art 4",
    artist: "한유진",
    price: "",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(14),
    title: "Art 5",
    artist: "박소현",
    price: "",
    link: "#",
  },
  {
    imageUrl: generateRandomImageUrl(15),
    title: "Art 6",
    artist: "정도윤",
    price: "",
    link: "#",
  },
];

const ArtworkSlider: React.FC = () => {
  const [artworkIndexes, setArtworkIndexes] = useState([0, 1, 2]);
  const [artistIndexes, setArtistIndexes] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setArtworkIndexes((prev) =>
        prev.map((i) => (i + 3 < artworks.length ? i + 3 : i % 3))
      );
      setArtistIndexes((prev) =>
        prev.map((i) => (i + 3 < artists.length ? i + 3 : i % 3))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        {indexes.map((index) => {
          const item = data[index];
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
        })}
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
