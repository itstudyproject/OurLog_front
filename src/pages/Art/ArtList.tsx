import React, { useState, useEffect, useMemo } from "react";
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
  const [artworks, setArtworks] = useState<ArtWork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortType, setSortType] = useState<'popular' | 'latest'>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const artworksPerPage = 15;

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
        setArtworks(dummyArtworks);
        setLoading(false);
      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  // 정렬된 리스트
  const sortedArtworks = useMemo(() => {
    if (sortType === 'popular') {
      return [...artworks].sort((a, b) => b.likes - a.likes);
    }
    return [...artworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [artworks, sortType]);

  // 검색 필터링
  const filteredArtworks = useMemo(() => {
    if (!searchTerm.trim()) return sortedArtworks;
    return sortedArtworks.filter(
      art =>
        art.title.includes(searchTerm) ||
        art.author.includes(searchTerm)
    );
  }, [sortedArtworks, searchTerm]);

  // 페이지별 리스트
  const indexOfLastArtwork = currentPage * artworksPerPage;
  const indexOfFirstArtwork = indexOfLastArtwork - artworksPerPage;
  const currentArtworks = filteredArtworks.slice(indexOfFirstArtwork, indexOfLastArtwork);
  const totalPages = Math.ceil(filteredArtworks.length / artworksPerPage);
  const pageNumbers: number[] = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleArtworkClick = (artworkId: number) => {
    navigate(`/Art/${artworkId}`);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
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
      <div className="art-list-header">
        <h2 className="art-list-title">아트</h2>
        <div className="art-search-bar-wrapper">
          <form className="art-search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="작품명 또는 작가명으로 검색"
              className="art-search-input"
            />
            <button type="submit" className="art-search-button">
              <img src="/images/Search.png" alt="검색" className="art-search-icon" />
            </button>
          </form>
        </div>
        <div className="art-list-tabs">
          <button
            className={`art-list-tab-btn${sortType === 'popular' ? ' active' : ''}`}
            onClick={() => { setSortType('popular'); setCurrentPage(1); }}
          >
            인기순
          </button>
          <button
            className={`art-list-tab-btn${sortType === 'latest' ? ' active' : ''}`}
            onClick={() => { setSortType('latest'); setCurrentPage(1); }}
          >
            최신순
          </button>
        </div>
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
