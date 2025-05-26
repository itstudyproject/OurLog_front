import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ArtList.css";
import { getAuthHeaders, removeToken, hasToken } from "../../utils/auth";
import { PostDTO } from '../../types/postTypes';

interface ArtworkWithLike extends PostDTO {
  liked?: boolean; // ArtList 조회 시 백엔드에서 제공하지 않으므로 클라이언트에서 관리
}

const ArtList = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<ArtworkWithLike[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortType, setSortType] = useState<'popular' | 'latest'>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const artworksPerPage = 15;

  const rawLoggedInUser = localStorage.getItem("user");
  let loggedInUserId: number | null = null;

  try {
    const parsedData = rawLoggedInUser ? JSON.parse(rawLoggedInUser) : null;
    if (parsedData && typeof parsedData.userId === "number") {
      loggedInUserId = parsedData.userId;
    }
  } catch (error) {
    console.error("❌ JSON 파싱 실패:", error);
  }

  useEffect(() => {
    if (!hasToken()) {
      console.warn("토큰이 없습니다. 로그인이 필요할 수 있습니다.");
    }

    const savedPage = localStorage.getItem('artworkListPage');
    if (savedPage) {
      const pageNumber = parseInt(savedPage, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1) {
        setCurrentPage(pageNumber);
      }
      localStorage.removeItem('artworkListPage');
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
        const mappedArtworks: ArtworkWithLike[] = (pageResultDTO.dtoList || []).map((item: any) => ({
          postId: item.postId || item.id,
          boardNo: item.boardNo || item.boardId,
          title: item.title,
          content: item.content || '',
          nickname: item.nickname || item.userName || item.author || item.writer || '',
          fileName: item.fileName,
          views: item.views || item.viewCount || 0,
          tag: item.tag,
          thumbnailImagePath: item.thumbnailImagePath || null,
          followers: item.followers || null,
          downloads: item.downloads || null,
          favoriteCnt: item.favoriteCnt || item.likeCount || null,
          tradeDTO: item.tradeDTO ? {
            tradeId: item.tradeDTO.tradeId,
            postId: item.tradeDTO.postId,
            sellerId: item.tradeDTO.sellerId,
            bidderId: item.tradeDTO.bidderId || null,
            bidderNickname: item.tradeDTO.bidderNickname || null,
            startPrice: item.tradeDTO.startPrice,
            highestBid: item.tradeDTO.highestBid || null,
            bidAmount: item.tradeDTO.bidAmount || null,
            nowBuy: item.tradeDTO.nowBuy,
            tradeStatus: item.tradeDTO.tradeStatus,
            startBidTime: item.tradeDTO.startBidTime || null,
            lastBidTime: item.tradeDTO.lastBidTime || null
          } : null,
          pictureDTOList: item.pictureDTOList || null,
          profileImage: item.profileImage || item.userProfileImage || null,
          replyCnt: item.replyCnt || null,
          regDate: item.regDate || item.createdAt || null,
          modDate: item.modDate || item.updatedAt || null,
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
      // favoriteCnt가 null일 경우 0으로 간주하여 정렬
      return [...artworks].sort((a, b) => (b.favoriteCnt ?? 0) - (a.favoriteCnt ?? 0));
    }
    // tradeDTO나 startBidTime이 null일 경우 유효한 시간으로 간주하여 정렬 (예: 아주 오래된 시간)
    return [...artworks].sort((a, b) => {
      const timeA = a.tradeDTO?.startBidTime ? new Date(a.tradeDTO.startBidTime).getTime() : 0;
      const timeB = b.tradeDTO?.startBidTime ? new Date(b.tradeDTO.startBidTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [artworks, sortType]);

  // boardNo 5만 필터링
  const filteredArtworks = useMemo(() => {
    const onlyArt = sortedArtworks.filter(art => art.boardNo === 5);
    if (!searchTerm.trim()) return onlyArt;
    return onlyArt.filter(
      art =>
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.nickname && art.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedArtworks, searchTerm]);

  // 페이지네이션 그룹 계산
  const pageGroup = Math.floor((currentPage - 1) / 10);
  const startPage = pageGroup * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const handleArtworkClick = (artworkId: number) => {
    localStorage.setItem('artworkListPage', String(currentPage));
    navigate(`/Art/${artworkId}`);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleRegisterClick = () => {
    navigate('/art/register');
  };

  // 경매 남은 시간 계산 함수 (최대 7일 제한)
  function getTimeLeft(endTime: string | Date | null): { text: string, isEndingSoon: boolean, isEnded: boolean } {
    if (!endTime) return { text: "마감 정보 없음", isEndingSoon: false, isEnded: false };
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    const oneMinuteInMillis = 60 * 1000;
    const oneHourInMillis = 60 * oneMinuteInMillis;
    const oneDayInMillis = 24 * oneHourInMillis;

    if (isNaN(end) || diff <= 0) return { text: "경매 종료", isEndingSoon: false, isEnded: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let text = "";
    if (diff < oneMinuteInMillis) {
      text = `${seconds}초 남음`;
    } else if (diff < oneHourInMillis) {
      text = `${minutes}분 남음`;
    } else if (diff < oneDayInMillis) {
      text = `${hours}시간 ${minutes}분 남음`;
    } else {
      text = `${days}일 ${hours}시간 ${minutes}분 남음`;
    }

    const isEndingSoon = diff > 0 && diff <= oneHourInMillis;

    return { text, isEndingSoon, isEnded: false };
  }

  // ✅ Optimistic Update 적용한 좋아요 토글 함수
  const handleLikeToggle = async (artworkId: number) => {
    if (loggedInUserId === null) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");

    // Optimistic UI 업데이트
    setArtworks((prev) =>
      prev.map((artwork) => {
        if (artwork.postId === artworkId) {
          const newLiked = !(artwork.liked ?? false);
          const newFavoriteCnt = (artwork.favoriteCnt ?? 0) + (newLiked ? 1 : -1);
          return {
            ...artwork,
            liked: newLiked,
            favoriteCnt: newFavoriteCnt,
          };
        }
        return artwork;
      })
    );

    try {
      const result = await fetch(`http://localhost:8080/ourlog/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          postId: artworkId,
        }),
      });

      if (!result.ok) throw new Error("서버 응답 오류");

      const data = await result.json();

      // 백엔드 응답으로 최종 상태 업데이트
      if (typeof data.favoriteCount === "number") {
        setArtworks((prev) =>
          prev.map((artwork) =>
            artwork.postId === artworkId
              ? {
                ...artwork,
                liked: data.favorited,
                favoriteCnt: data.favoriteCount,
              }
              : artwork
          )
        );
      }
    } catch (error) {
      console.error(`좋아요 처리 실패: ${artworkId}`, error);

      // 실패 시 optimistic rollback
      setArtworks((prev) =>
        prev.map((artwork) => {
          if (artwork.postId === artworkId) {
            const rolledBackLiked = !(artwork.liked ?? false); // optimistic update 이전 상태
            const rolledBackFavoriteCnt = (artwork.favoriteCnt ?? 0) + (rolledBackLiked ? 1 : -1); // optimistic update 이전 상태
            return {
              ...artwork,
              liked: rolledBackLiked,
              favoriteCnt: rolledBackFavoriteCnt,
            };
          }
          return artwork;
        })
      );
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!filteredArtworks || filteredArtworks.length === 0) {
    return (
      <div className="no-artworks">
        <p>등록된 작품이 없습니다.</p>
        {searchTerm && <p>'{searchTerm}'에 대한 검색 결과가 없습니다.</p>}
        <button onClick={handleRegisterClick}>새 작품 등록하기</button>
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
        {filteredArtworks.map((artwork) => {
          // ✅ 백엔드에서 originImagePath를 제대로 내려주면 이 부분이 작동합니다.
          const imageUrl = artwork.pictureDTOList && artwork.pictureDTOList.length > 0 && artwork.pictureDTOList[0].originImagePath
            ? `http://localhost:8080/ourlog/picture/display/${artwork.pictureDTOList[0].originImagePath}` // 백엔드 전체 URL 포함
            : null;

          console.log("Artwork TradeDTO:", artwork.tradeDTO);

          const timeInfo = getTimeLeft(artwork.tradeDTO?.lastBidTime || null);

          return (
            <div
              key={artwork.postId}
              className="art-list-item-card"
              onClick={() => handleArtworkClick(artwork.postId)}
            >
              <div className="art-list-item-image">
                {imageUrl ? (
                  <img
                    src={imageUrl} // 수정된 URL 사용
                    alt={artwork.title}
                    className="art-list-item-thumbnail"
                  />
                ) : (
                  <div className="art-list-item-no-image">이미지 없음</div>
                )}
                <div
                  className={`art-list-like-button ${artwork.liked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 div의 클릭 이벤트 방지
                    handleLikeToggle(artwork.postId);
                  }}
                >
                  {artwork.liked ? '🧡' : '🤍'} {artwork.favoriteCnt ?? 0}
                </div>
              </div>
              <div className="art-list-item-info">
                <h3 className="art-list-item-title">{artwork.title}</h3>
                <p className="art-list-item-author">{artwork.nickname}</p>
                {/* ✅ tradeDTO가 있을 때만 경매 정보 표시 */}
                <p className="art-list-item-price">
                  {artwork.tradeDTO
                    ? `현재가: ${(artwork.tradeDTO.highestBid ?? artwork.tradeDTO.startPrice)?.toLocaleString()}원`
                    : "경매 정보 없음"}
                </p>
                {/* ✅ tradeDTO와 lastBidTime이 있을 때만 남은 시간 표시 */}
                {artwork.tradeDTO ? (
                  artwork.tradeDTO.tradeStatus ? ( // 경매 종료 시
                    <span className="auction-time-left" style={{ color: 'red' }}>경매 종료</span>
                  ) : ( // 경매 진행 중
                    artwork.tradeDTO.lastBidTime && (
                      <span
                        className="auction-time-left"
                        // ✅ 남은 시간에 따라 스타일 및 텍스트 변경
                        style={{ color: timeInfo.isEndingSoon ? 'red' : 'inherit' }}
                      >
                        {timeInfo.text}
                        {timeInfo.isEndingSoon && " (종료 임박)"}
                      </span>
                    )
                  )
                ) : ( // tradeDTO 없음
                  <span className="auction-time-left">경매 정보 없음</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="art-list-pagination">
        <button
          onClick={() => startPage > 1 && handlePageClick(startPage - 10)}
          disabled={startPage === 1}
          className="art-list-page-btn art-list-arrow-btn"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
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
          onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="art-list-page-btn art-list-arrow-btn"
        >
          &gt;
        </button>
        <button
          onClick={() => endPage < totalPages && handlePageClick(endPage + 1)}
          disabled={endPage === totalPages}
          className="art-list-page-btn art-list-arrow-btn"
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default ArtList;
