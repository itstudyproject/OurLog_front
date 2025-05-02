import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ArtList.css";

interface ArtWork {
  id: number;
  title: string;
  author: string;
  price: number;
  likes: number;
  createdAt: string;
  imageSrc: string;
}

const ArtList = () => {
  const navigate = useNavigate();
  const [popularArtworks, setPopularArtworks] = useState<ArtWork[]>([]);
  const [recentArtworks, setRecentArtworks] = useState<ArtWork[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const artworksPerPage = 12;

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        // 실제 구현에서는 API 호출로 대체됩니다
        const dummyArtworks: ArtWork[] = [
          {
            id: 1,
            title: "작품 제목 1",
            author: "작가1",
            price: 30000,
            likes: 128,
            createdAt: "2023.05.15",
            imageSrc: "/images/파스타.jpg",
          },
          {
            id: 2,
            title: "작품 제목 2",
            author: "작가2",
            price: 45000,
            likes: 97,
            createdAt: "2023.06.20",
            imageSrc: "/images/post2.jpg",
          },
          {
            id: 3,
            title: "작품 제목 3",
            author: "작가3",
            price: 25000,
            likes: 85,
            createdAt: "2023.07.05",
            imageSrc: "/images/post3.jpg",
          },
          {
            id: 4,
            title: "구름 속 고양이",
            author: "우주고양이",
            price: 35000,
            likes: 72,
            createdAt: "2023.07.10",
            imageSrc: "/images/post4.jpg",
          },
          {
            id: 5,
            title: "디지털 도시 풍경",
            author: "디자인시티",
            price: 50000,
            likes: 65,
            createdAt: "2023.07.15",
            imageSrc: "/images/post5.jpg",
          },
          {
            id: 6,
            title: "우주 고래",
            author: "크리에이터K",
            price: 42000,
            likes: 54,
            createdAt: "2023.07.22",
            imageSrc: "/images/post8.jpg",
          },
          {
            id: 7,
            title: "몽환적 숲",
            author: "판타지작가",
            price: 38000,
            likes: 48,
            createdAt: "2023.08.01",
            imageSrc: "/images/post10.jpg",
          },
          {
            id: 8,
            title: "미래 도시",
            author: "사이버펑크",
            price: 55000,
            likes: 42,
            createdAt: "2023.08.12",
            imageSrc: "/images/post12.jpg",
          },
          {
            id: 9,
            title: "뚱글뚱글 파스타",
            author: "미니맘",
            price: 30000,
            likes: 38,
            createdAt: "2023.08.18",
            imageSrc: "/images/post15.jpg",
          },
          {
            id: 10,
            title: "구름 속 고래",
            author: "하늘고래",
            price: 45000,
            likes: 34,
            createdAt: "2023.08.25",
            imageSrc: "/images/post16.jpg",
          },
          {
            id: 11,
            title: "풍경 스케치",
            author: "스케치마스터",
            price: 28000,
            likes: 29,
            createdAt: "2023.09.01",
            imageSrc: "/images/post1.jpg",
          },
          {
            id: 12,
            title: "고요한 바다",
            author: "블루오션",
            price: 36000,
            likes: 26,
            createdAt: "2023.09.10",
            imageSrc: "/images/post2.jpg",
          },
          {
            id: 13,
            title: "가을 단풍길",
            author: "계절화가",
            price: 32000,
            likes: 24,
            createdAt: "2023.09.15",
            imageSrc: "/images/post3.jpg",
          },
          {
            id: 14,
            title: "도시의 밤",
            author: "나이트라이프",
            price: 48000,
            likes: 20,
            createdAt: "2023.09.20",
            imageSrc: "/images/post4.jpg",
          },
          {
            id: 15,
            title: "꿈속의 세계",
            author: "드림웍스",
            price: 40000,
            likes: 18,
            createdAt: "2023.09.25",
            imageSrc: "/images/post5.jpg",
          },
          {
            id: 16,
            title: "봄의 향기",
            author: "꽃그림작가",
            price: 33000,
            likes: 15,
            createdAt: "2023.10.01",
            imageSrc: "/images/post8.jpg",
          },
          {
            id: 17,
            title: "디지털 추상",
            author: "추상주의",
            price: 52000,
            likes: 12,
            createdAt: "2023.10.05",
            imageSrc: "/images/post10.jpg",
          },
          {
            id: 18,
            title: "정물화 시리즈",
            author: "정물화가",
            price: 37000,
            likes: 10,
            createdAt: "2023.10.10",
            imageSrc: "/images/post12.jpg",
          },
        ];

        // 인기 작품 - 좋아요 기준으로 정렬
        const sortedByPopularity = [...dummyArtworks].sort((a, b) => b.likes - a.likes).slice(0, 3);
        setPopularArtworks(sortedByPopularity);

        // 최신 작품 - 날짜 기준으로 정렬
        const sortedByDate = [...dummyArtworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentArtworks(sortedByDate);
        
        setLoading(false);
      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const indexOfLastArtwork = currentPage * artworksPerPage;
  const indexOfFirstArtwork = indexOfLastArtwork - artworksPerPage;
  const currentArtworks = recentArtworks.slice(indexOfFirstArtwork, indexOfLastArtwork);

  const totalPages = Math.ceil(recentArtworks.length / artworksPerPage);
  const pageNumbers: number[] = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  const handleArtworkClick = (artworkId: number) => {
    navigate(`/Art/${artworkId}`);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="art-list-container">

      <div className="section-title">
        <h2>인기 작품</h2>
        <div className="line"></div>
      </div>

      <div className="popular-artworks">
        {popularArtworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className="artwork-card popular" 
            onClick={() => handleArtworkClick(artwork.id)}
          >
            <div className="artwork-image">
              <img src={artwork.imageSrc} alt={artwork.title} />
              <div className="artwork-likes">♥ {artwork.likes}</div>
            </div>
            <div className="artwork-info">
              <h3>{artwork.title}</h3>
              <p className="artwork-author">{artwork.author}</p>
              <p className="artwork-price">{artwork.price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title recent">
        <h2>최신 작품</h2>
        <div className="line"></div>
      </div>

      <div className="recent-artworks">
        {currentArtworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className="artwork-card" 
            onClick={() => handleArtworkClick(artwork.id)}
          >
            <div className="artwork-image">
              <img src={artwork.imageSrc} alt={artwork.title} />
              <div className="artwork-likes">♥ {artwork.likes}</div>
            </div>
            <div className="artwork-info">
              <h3>{artwork.title}</h3>
              <p className="artwork-author">{artwork.author}</p>
              <p className="artwork-price">{artwork.price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="arrow-button"
        >
          &lt;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() =>
            currentPage < totalPages && handlePageClick(currentPage + 1)
          }
          disabled={currentPage === totalPages}
          className="arrow-button"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ArtList;