import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ArtList.css";
import { ArtPost, ArtListResponse } from "../../types/art";
import { getAuthHeaders, removeToken, hasToken } from "../../utils/auth";

const ArtList = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<ArtPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortType, setSortType] = useState<'popular' | 'latest'>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const artworksPerPage = 10;

  useEffect(() => {
    if (!hasToken()) {
      console.warn("토큰이 없습니다. 로그인이 필요할 수 있습니다.");
    }
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      const pageNumber = Math.max(1, currentPage);
      
      const params = new URLSearchParams({
        page: String(pageNumber),
        size: String(artworksPerPage),
        boardNo: "5",
        type: "t",
        keyword: searchTerm
      });

      try {
        const response = await fetch(`http://localhost:8080/ourlog/post/list?${params.toString()}`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (response.status === 403) {
          removeToken();
          navigate('/login');
          throw new Error("인증이 필요합니다.");
        }

        if (!response.ok) {
          const text = await response.text();
          console.error("서버 에러 응답:", text);
          throw new Error(text || "서버 오류");
        }

        const data = await response.json();
        
        if (!data.pageResultDTO) {
          throw new Error("잘못된 응답 형식");
        }

        const { pageResultDTO } = data;
        const mappedArtworks: ArtPost[] = (pageResultDTO.dtoList || []).map((item: any) => ({
          post_id: item.postId || item.id,
          boardNo: item.boardNo || item.boardId,
          title: item.title,
          content: item.content || '',
          description: item.content || '',
          author: {
            id: item.userId || 0,
            name: item.userName || item.author || item.writer || '',
            profileImage: item.userProfileImage || '/images/default-avatar.png',
            isFollowing: false
          },
          auction: {
            startingBid: item.startPrice || 0,
            currentBid: item.currentBid || item.startPrice || 0,
            buyNowPrice: item.instantPrice || 0,
            endTime: item.endTime || new Date().toISOString(),
            bidCount: item.bidCount || 0
          },
          createdAt: item.regDate || item.createdAt || '',
          updatedAt: item.modDate || item.updatedAt || '',
          images: item.fileName ? [item.fileName] : [],
          likes: item.likeCount || 0,
          views: item.viewCount || 0,
          status: "ONGOING"
        }));

        setArtworks(mappedArtworks);
        setTotalPages(pageResultDTO.totalPage || 1);
      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setArtworks([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentPage, searchTerm, navigate]);

  // 정렬된 리스트
  const sortedArtworks = useMemo(() => {
    if (sortType === 'popular') {
      return [...artworks].sort((a, b) => b.likes - a.likes);
    }
    return [...artworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [artworks, sortType]);

  // boardNo 5만 필터링
  const filteredArtworks = useMemo(() => {
    const onlyArt = sortedArtworks.filter(art => art.boardNo === 5);
    if (!searchTerm.trim()) return onlyArt;
    return onlyArt.filter(
      art =>
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedArtworks, searchTerm]);

  // 페이지네이션 그룹 계산
  const pageGroup = Math.floor((currentPage - 1) / 10);
  const startPage = pageGroup * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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

  const handleRegisterClick = () => {
    navigate('/art/register');
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="art-list-page-container">
      <div className="art-list-page-header">
        <div className="art-list-left-section">
          <div className="art-list-sort-tabs">
            <button
              className={`art-list-sort-btn${sortType === 'popular' ? ' art-list-sort-active' : ''}`}
              onClick={() => { setSortType('popular'); setCurrentPage(1); }}
            >
              인기순
            </button>
            <button
              className={`art-list-sort-btn${sortType === 'latest' ? ' art-list-sort-active' : ''}`}
              onClick={() => { setSortType('latest'); setCurrentPage(1); }}
            >
              최신순
            </button>
          </div>
        </div>

        <h2 className="art-list-page-title">아트</h2>

        <div className="art-list-right-section">
          <form onSubmit={handleSearchSubmit} className="art-list-search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="키워드로 검색해주세요"
              className="art-list-search-input"
            />
            <button type="submit" className="art-list-search-btn">
              <img
                src="/images/Search.png"
                alt="검색"
                className="art-list-search-icon"
              />
            </button>
          </form>
          <button onClick={handleRegisterClick} className="art-list-register-btn">
            아트 등록
          </button>
        </div>
      </div>

      <div className="art-list-grid">
        {filteredArtworks.map((artwork) => (
          <div
            key={artwork.post_id}
            className="art-list-item-card"
            onClick={() => handleArtworkClick(artwork.post_id)}
          >
            <div className="art-list-item-image">
              {artwork.images?.[0] ? (
                <img
                  src={artwork.images[0]}
                  alt={artwork.title}
                  className="art-list-item-thumbnail"
                />
              ) : (
                <div className="art-list-item-no-image">이미지 없음</div>
              )}
              <div className="art-list-item-likes">♥ {artwork.likes}</div>
            </div>
            <div className="art-list-item-info">
              <h3 className="art-list-item-title">{artwork.title}</h3>
              <p className="art-list-item-author">{artwork.author.name}</p>
              <p className="art-list-item-price">{artwork.auction.currentBid.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      <div className="art-list-pagination">
        <button
          onClick={() => startPage > 1 && handlePageClick(startPage - 1)}
          disabled={startPage === 1}
          className="art-list-page-btn art-list-arrow-btn"
        >
          &lt;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={`art-list-page-btn${currentPage === number ? ' art-list-page-active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => endPage < totalPages && handlePageClick(endPage + 1)}
          disabled={endPage === totalPages}
          className="art-list-page-btn art-list-arrow-btn"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ArtList;
