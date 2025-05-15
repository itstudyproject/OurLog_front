import React, { useEffect, useState } from "react";
import "../styles/ArtworkSlider.css";
import { useNavigate } from "react-router-dom";

interface Artwork {
  imageUrl: string;
  title: string;
  artist: string;
  price: string;
  link: string;
  artistId: number; // 추가됨
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
    artistId: 1,
  },
  {
    imageUrl: generateRandomImageUrl(1),
    title: "Modern Flow",
    artist: "이서연",
    price: "₩3,000,000",
    link: "#",
    artistId: 2,
  },
  {
    imageUrl: generateRandomImageUrl(2),
    title: "Blue Storm",
    artist: "정윤아",
    price: "₩1,800,000",
    link: "#",
    artistId: 3,
  },
  {
    imageUrl: generateRandomImageUrl(3),
    title: "Bright Day",
    artist: "김하늘",
    price: "₩2,200,000",
    link: "#",
    artistId: 4,
  },
  {
    imageUrl: generateRandomImageUrl(4),
    title: "Silent Woods",
    artist: "박지우",
    price: "₩2,700,000",
    link: "#",
    artistId: 5,
  },
  {
    imageUrl: generateRandomImageUrl(5),
    title: "Golden Hour",
    artist: "최서윤",
    price: "₩3,100,000",
    link: "#",
    artistId: 6,
  },
];

const artists: Artwork[] = [
  {
    imageUrl: generateRandomImageUrl(10),
    title: "Art 1",
    artist: "최지영",
    price: "",
    link: "#",
    artistId: 10,
  },
  {
    imageUrl: generateRandomImageUrl(11),
    title: "Art 2",
    artist: "이동우",
    price: "",
    link: "#",
    artistId: 11,
  },
  {
    imageUrl: generateRandomImageUrl(12),
    title: "Art 3",
    artist: "김민서",
    price: "",
    link: "#",
    artistId: 12,
  },
  {
    imageUrl: generateRandomImageUrl(13),
    title: "Art 4",
    artist: "한유진",
    price: "",
    link: "#",
    artistId: 13,
  },
  {
    imageUrl: generateRandomImageUrl(14),
    title: "Art 5",
    artist: "박소현",
    price: "",
    link: "#",
    artistId: 14,
  },
  {
    imageUrl: generateRandomImageUrl(15),
    title: "Art 6",
    artist: "정도윤",
    price: "",
    link: "#",
    artistId: 15,
  },
];

const ArtworkSlider: React.FC = () => {
  const navigate = useNavigate();
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

  const handleClick = (artistId: number) => {
    navigate("/worker", { state: { userId: artistId } }); // <- 라우팅은 고정, userId는 state로 전달
  };

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
            <div
              key={index}
              className="artworkslider-card"
              onClick={() => handleClick(item.artistId)}
              style={{ cursor: "pointer" }}
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
            </div>
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
