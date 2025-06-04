import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "../../styles/ArtList.css";
import { getAuthHeaders, removeToken, hasToken } from "../../utils/auth";
import { PostDTO } from '../../types/postTypes';

interface ArtworkWithLike extends PostDTO {
  liked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
  // favoriteCnt는 PostDTO에 이미 포함되어 있지만, 최신 값을 fetch 후 업데이트합니다.
}

const ArtList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  // URL에서 검색 파라미터 추출
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    const typeFromUrl = searchParams.get("type");
    if (keywordFromUrl) {
      setSearchInput(keywordFromUrl);
      setSearchTerm(keywordFromUrl);
      setCurrentPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      const pageNumber = Math.max(1, currentPage);
      
      const params = new URLSearchParams({
        page: String(pageNumber),
        size: String(artworksPerPage),
        boardNo: "5"  // boardNo는 항상 포함
      });

      // 검색어가 있는 경우에만 검색 파라미터 추가
      if (searchTerm) {
        params.append('type', 't');
        params.append('keyword', searchTerm);
      }

      try {
        // 모든 요청에 대해 동일한 엔드포인트 사용
        const url = `http://localhost:8080/ourlog/post/list/popular?${params.toString()}`;

        const headers = getAuthHeaders();
        console.log('Request headers:', headers);

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
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
        console.log('서버 응답 데이터:', data);
        
        const dtoList = data.dtoList || [];
        const totalPage = data.totalPage || 1;
        
        let initialArtworks: ArtworkWithLike[] = dtoList.map((item: any) => ({
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
          favoriteCnt: item.favoriteCnt || item.likeCount || 0,
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
          liked: false,
        }));

        setTotalPages(totalPage);

        // 각 게시글의 최신 좋아요 수와 사용자의 좋아요 상태를 병렬로 가져옵니다.
        const artworksWithLatestData = await Promise.all(
          initialArtworks.map(async (artwork) => {
            if (artwork.postId === undefined || artwork.postId === null) {
              console.warn("❌ Artwork without postId:", artwork);
              return artwork;
            }

            let latestFavoriteCnt = artwork.favoriteCnt;
            let userLiked = false;

            try {
              // 최신 좋아요 수 가져오기
              const countResponse = await fetch(
                `http://localhost:8080/ourlog/favorites/count/${artwork.postId}`,
                {
                  method: "GET",
                  headers: getAuthHeaders(),
                }
              );
              if (countResponse.ok) {
                const countData = await countResponse.json();
                if (typeof countData === "number") {
                  latestFavoriteCnt = countData;
                } else if (countData && typeof countData.count === "number") {
                  latestFavoriteCnt = countData.count;
                }
              } else {
                console.warn(
                  `❌ 좋아요 수 불러오기 실패 (${countResponse.status}) for postId ${artwork.postId}`
                );
              }
            } catch (countError) {
              console.error("❌ 좋아요 수 불러오기 오류:", countError);
            }

            // 사용자의 좋아요 상태 가져오기 (로그인된 경우)
            if (loggedInUserId !== null && loggedInUserId > 0) {
              try {
                const likeStatusResponse = await fetch(
                  `http://localhost:8080/ourlog/favorites/${loggedInUserId}/${artwork.postId}`,
                  {
                    method: "GET",
                    headers: getAuthHeaders(),
                  }
                );

                if (likeStatusResponse.ok) {
                  const statusData = await likeStatusResponse.json();
                  userLiked = statusData === true;
                } else {
                  console.warn(
                    `❌ 사용자 좋아요 상태 불러오기 실패 (${likeStatusResponse.status}) for postId ${artwork.postId}`
                  );
                }
              } catch (likeError) {
                console.error("❌ 사용자 좋아요 상태 불러오기 오류:", likeError);
              }
            }

            return { ...artwork, favoriteCnt: latestFavoriteCnt, liked: userLiked };
          })
        );

        setArtworks(artworksWithLatestData);

      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setArtworks([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentPage, searchTerm, navigate, loggedInUserId, sortType]);

  // 정렬된 리스트
  const sortedArtworks = useMemo(() => {
    if (sortType === 'popular') {
      // 인기순은 백엔드에서 처리되므로 그대로 반환
      return [...artworks];
    }
    // 최신순 정렬만 프론트엔드에서 처리
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
        (art.nickname && art.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.content && art.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.tag && art.tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

      // 좋아요 토글 후 데이터를 다시 불러옴
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(artworksPerPage),
        boardNo: "5"
      });

      const url = `http://localhost:8080/ourlog/post/list/popular?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("데이터 새로고침 실패");
      }

      const data = await response.json();
      const dtoList = data.dtoList || [];
      
      // 새로운 데이터로 상태 업데이트
      setArtworks(dtoList.map((item: any) => ({
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
        favoriteCnt: item.favoriteCnt || item.likeCount || 0,
        tradeDTO: item.tradeDTO,
        pictureDTOList: item.pictureDTOList || null,
        profileImage: item.profileImage || item.userProfileImage || null,
        replyCnt: item.replyCnt || null,
        regDate: item.regDate || item.createdAt || null,
        modDate: item.modDate || item.updatedAt || null,
        liked: false,
      })));

    } catch (error) {
      console.error(`좋아요 처리 실패: ${artworkId}`, error);
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
          const imageUrl = artwork.pictureDTOList
            ? artwork.pictureDTOList.find(pic => pic.uuid === artwork.fileName)?.originImagePath 
              ? `http://localhost:8080/ourlog/picture/display/${artwork.pictureDTOList.find(pic => pic.uuid === artwork.fileName)?.originImagePath}`
              : artwork.pictureDTOList[0]?.originImagePath 
                ? `http://localhost:8080/ourlog/picture/display/${artwork.pictureDTOList[0].originImagePath}`
                : null
            : null;

          console.log("Artwork TradeDTO:", artwork.tradeDTO);
          console.log("Thumbnail info:", {
            fileName: artwork.fileName,
            pictureDTOList: artwork.pictureDTOList,
            imageUrl
          });

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
                    src={imageUrl}
                    alt={artwork.title}
                    className="art-list-item-thumbnail"
                  />
                ) : (
                  <div className="art-list-item-no-image">이미지 없음</div>
                )}
                <div
                  className={`art-list-like-button ${artwork.liked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle(artwork.postId);
                  }}
                >
                  {artwork.liked ? '🧡' : '🤍'} {artwork.favoriteCnt ?? 0}
                </div>
              </div>
              <div className="art-list-item-info">
                <h3 className="art-list-item-title">{artwork.title}</h3>
                <p className="art-list-item-author">{artwork.nickname}</p>
                <p className="art-list-item-price">
                  {artwork.tradeDTO
                    ? `현재가: ${(artwork.tradeDTO.highestBid ?? artwork.tradeDTO.startPrice)?.toLocaleString()}원`
                    : "경매 정보 없음"}
                </p>
                {artwork.tradeDTO ? (
                  artwork.tradeDTO.tradeStatus ? (
                    <span className="auction-time-left" style={{ color: 'red' }}>경매 종료</span>
                  ) : (
                    artwork.tradeDTO.lastBidTime && (
                      <span
                        className="auction-time-left"
                        style={{ color: timeInfo.isEndingSoon ? 'red' : 'inherit' }}
                      >
                        {timeInfo.text}
                        {timeInfo.isEndingSoon && " (종료 임박)"}
                      </span>
                    )
                  )
                ) : (
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
