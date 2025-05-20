import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/ArtDetail.css";

// src/types에서 필요한 인터페이스를 임포트합니다.
import { PostDTO } from "../../types/postTypes";

const ArtDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const [countdown, setCountdown] = useState<string>("");

  const handleGoBack = () => {
    navigate("/Art");
  };

  const handleBidSubmit = async () => {
    if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
      alert("유효한 입찰 금액을 입력해주세요.");
      return;
    }
    const bid = Number(bidAmount);

    if (!post?.tradeDTO || post.tradeDTO.tradeStatus) {
        alert("현재 입찰할 수 없는 경매입니다.");
        return;
    }

    const currentHighestBid = post.tradeDTO.highestBid ?? post.tradeDTO.startPrice;
    const minBidAmount = currentHighestBid + 1000;
    if (bid < minBidAmount) {
        alert(`입찰가는 현재 최고가(${currentHighestBid.toLocaleString()}원)보다 1000원 이상 높아야 합니다.`);
        return;
    }

    const confirmBid = window.confirm(`${bid.toLocaleString()}원으로 입찰하시겠습니까?`);
    if (!confirmBid) return;

    try {
        const headers = getAuthHeaders();
        if (!headers) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        const currentUserId = post.userId;
        if (!currentUserId) {
             alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
             navigate('/login');
             return;
        }

        const tradeId = post.tradeDTO.tradeId;

        const response = await fetch(`http://localhost:8080/ourlog/trades/${tradeId}/bid`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tradeId: tradeId,
                bidAmount: bid,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("입찰 실패 응답:", errorText);
            // Attempt to parse error text as JSON if it looks like a JSON error response
            try {
                const errorJson = JSON.parse(errorText);
                alert(`입찰 실패: ${errorJson.message || errorText || '서버 오류'}`);
            } catch (e) {
                 alert(`입찰 실패: ${errorText || '서버 오류'}`);
            }
            if (post?.postId) {
                 fetchArtworkDetail(post.postId.toString());
            }
            return;
        }

        const successMessage = await response.text();
        alert(`입찰 성공: ${successMessage}`);

        if (post?.postId) {
             fetchArtworkDetail(post.postId.toString());
        }

    } catch (error) {
        console.error("입찰 요청 중 오류 발생:", error);
        alert("입찰 요청 중 오류가 발생했습니다.");
         if (post?.postId) {
             fetchArtworkDetail(post.postId.toString());
         }
    }
  };

  const handleBuyNow = () => {
    const confirmBuy = window.confirm("정말 즉시 구매하시겠습니까?");
    if (!confirmBuy) return;
    if (post?.tradeDTO?.tradeId !== undefined && post.tradeDTO.tradeId !== null) {
      navigate(`/Art/payment`, { state: { post } });
    } else {
      console.warn("Trade ID is null or undefined, cannot navigate to bid history.");
      alert("결제를 진행할 수 없습니다. 경매 정보가 올바르지 않습니다.");
    }
  }; 
    const handleOpenChat = () => {
    const confirmChat = window.confirm("채팅을 시작하시겠습니까?");
    if (confirmChat) {
      window.location.href = "/chat"; // 또는 useNavigate 사용 시 navigate("/chat");
    }

  };  
  const handleBidHistory = () => {
    alert("입찰 내역을 확인합니다.");
  };

  const handleShareToggle = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (post) {
      const followMsg = !isFollowing
        ? "작가님을 팔로우합니다."
        : "작가님 팔로우를 취소합니다.";
      alert(followMsg);
    }
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleArtistClick = () => {
    if (post?.nickname) {
      navigate(`/worker/${post.nickname}`);  // 작가의 페이지로 이동
    } else {
      console.warn("Artist nickname is null or undefined, cannot navigate to artist page.");
    }
  };

  const fetchArtworkDetail = async (postId: string) => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        console.error("인증 헤더를 가져올 수 없습니다.");
        alert("로그인이 필요하거나 인증 정보가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      if (!postId || postId === 'undefined') {
          console.error("유효하지 않은 Post ID로 API 호출 시도:", postId);
          alert("유효하지 않은 작품 정보입니다.");
          setLoading(false);
          setPost(null);
          return;
      }

      const response = await fetch(`http://localhost:8080/ourlog/post/read/${postId}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 403) {
             console.error("작품 조회 실패: 접근 권한 없음 (403 Forbidden)");
             alert("작품 조회 권한이 없습니다.");
        } else if (response.status === 404) {
             console.error("작품 조회 실패: 작품을 찾을 수 없음 (404 Not Found)");
             alert("요청하신 작품을 찾을 수 없습니다.");
        }
        else {
             console.error(`작품 조회 실패: HTTP 상태 코드 ${response.status}`);
             alert("작품을 불러오는데 실패했습니다. 다시 시도해주세요.");
        }
        setPost(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPost(data.postDTO);
      setIsFollowing(false);
      setBidAmount(Number(data.postDTO?.tradeDTO?.highestBid || 0) + 1000);
      setLoading(false);
    } catch (error) {
      console.error("작품 조회 중 오류 발생:", error);
      alert("작품을 불러오는 중 오류가 발생했습니다.");
      setPost(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchArtworkDetail(id);
    } else {
      console.warn("Post ID is missing or not a valid number in URL parameters:", id);
      if (id !== 'payment') {
           alert("잘못된 접근입니다. 작품 정보를 불러올 수 없습니다.");
           setPost(null);
      }
       setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (post?.tradeDTO?.lastBidTime) {
      const endTime = new Date(post.tradeDTO.lastBidTime).getTime();
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setCountdown("경매 종료");
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}일 ${hours}시 ${minutes}분 ${seconds}초`);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
       setCountdown("경매 정보 없음");
    }

  }, [post?.tradeDTO?.lastBidTime]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        shareBtnRef.current &&
        !shareBtnRef.current.contains(e.target as Node)
      ) {
        setShowShareOptions(false);
      }
    }
    if (showShareOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareOptions]);

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <p>작품 정보를 불러오지 못했습니다.</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="art-detail-container">
      <div className="art-detail-content">
        <div className="left-content">
          <div className="art-image-container">
            {post.fileName ? (
              <img
                src={post.fileName}
                alt={post.title || 'Artwork image'}
                className="art-main-image"
              />
            ) : (
              <div className="no-image-placeholder">이미지 없음</div>
            )}
          </div>
          <div className="artwork-description">
            <h3>작품 설명</h3>
            <div className="description-content">
              <p>{post.content || '설명 없음'}</p>
            </div>
          </div>
        </div>

        <div className="art-info-container">
          <div className="artist-info">
            <div className="artist-avatar" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              {post.profileImage ? (
                <img src={post.profileImage} alt={`${post.nickname || '알 수 없는 작가'} 프로필`} />
              ) : (
                <div className="default-avatar">👤</div>
              )}
            </div>
            <div className="artist-detail" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              <h3>{post.nickname || '알 수 없는 작가'}</h3>
              <p>일러스트레이터</p>
            </div>
            <div className="artist-buttons" style={{ position: 'relative' }}>
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "팔로잉" : "팔로우"}
              </button>
              <button
                className="share-button"
                onClick={() => setShowShareOptions((v) => !v)}
                ref={shareBtnRef}
              >
                공유
              </button>
              {showShareOptions && (
                <div className="share-popover" ref={popoverRef}>
                  <button onClick={handleCopyLink} className="share-popover-btn">🔗</button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${window.location.href}`
                      )
                    }
                    className="share-popover-btn"
                  >
                    🐦
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`
                      )
                    }
                    className="share-popover-btn"
                  >
                    📘
                  </button>
                  <button
                    onClick={() => alert("카카오톡 공유는 추후 구현 예정입니다.")}
                    className="share-popover-btn"
                  >
                    💬
                  </button>
                  <div className="share-popover-arrow" />
                </div>
              )}
            </div>
          </div>

          <div className="art-title">
            <h2>{post.title || '제목 없음'}</h2>
            <p className="art-date">등록일: {post?.tradeDTO?.startBidTime ? new Date(post.tradeDTO.startBidTime).toLocaleString() : '날짜 정보 없음'}</p>
          </div>

          {post.tradeDTO ? (
            <>
              <div className="bid-info">
                <div className="bid-detail">
                  <span>시작가</span>
                  <p>{post.tradeDTO.startPrice}원</p>
                </div>
                <div className="bid-detail current">
                  <span>현재 입찰가</span>
                  <p>{post.tradeDTO.highestBid !== null ? `${post.tradeDTO.highestBid}원` : '입찰 내역 없음'}</p>
                </div>
                <div className="bid-detail">
                  <span>즉시 구매가</span>
                  <p>{post.tradeDTO.nowBuy}원</p>
                </div>
              </div>

              <div className="auction-timer">
                <div className="timer-icon">⏱️</div>
                <div className="timer-content">
                  <span>남은 시간</span>
                  <p>{countdown}</p>
                </div>
              </div>

              {!post.tradeDTO.tradeStatus && (
                <>
                  <div className="bid-input">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        const numValue = Number(e.target.value);
                        setBidAmount(isNaN(numValue) ? 0 : numValue);
                      }}
                      placeholder="입찰 금액을 입력하세요"
                    />
                    <span className="currency">원</span>
                  </div>

                  <div className="action-buttons">
                    <div className="main-actions">
                      <button className="bid-button" onClick={handleBidSubmit}>
                        입찰하기
                      </button>
                      {post?.tradeDTO?.nowBuy !== null && (
                        <button className="buy-now-button" onClick={handleBuyNow}>
                          즉시구매
                        </button>
                      )}
                    </div>
                    <button className="chat-button" onClick={handleOpenChat}>
                      <span className="chat-icon">💬</span> 작가와 1:1 채팅
                    </button>
                    <button className="bid-history-button" onClick={handleBidHistory}>
                      입찰내역
                    </button>
                  </div>
                </>
              )}

              {post.tradeDTO.tradeStatus && (
                 <div className="auction-ended-info">
                    <p>경매가 종료되었습니다.</p>
                    <button className="chat-button" onClick={handleOpenChat}>
                      <span className="chat-icon">💬</span> 작가와 1:1 채팅
                    </button>
                    <button className="bid-history-button" onClick={handleBidHistory}>
                      입찰내역
                    </button>
                 </div>
              )}
            </>
          ) : (
            <div className="non-trade-info">
               <p>이 게시물은 경매 상품이 아닙니다.</p>
               <button className="chat-button" onClick={handleOpenChat}>
                <span className="chat-icon">��</span> 작가와 1:1 채팅
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="art-actions">
        <button onClick={handleGoBack} className="back-button">
          목록으로
        </button>
      </div>
    </div>
  );
};

export default ArtDetail;
