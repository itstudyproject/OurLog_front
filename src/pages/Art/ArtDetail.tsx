import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders, removeToken } from "../../utils/auth";
import "../../styles/ArtDetail.css";

// Import interfaces from the new type file
import { PostDTO, TradeDTO, Comment } from '../../types/postTypes';
import { PictureDTO } from '../../types/pictureTypes';

const ArtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const [countdown, setCountdown] = useState<string>("");

  const handleGoBack = () => {
    navigate("/Art");
  };

  const handleBidSubmit = () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      alert("유효한 입찰 금액을 입력해주세요.");
      return;
    }
    const bid = Number(bidAmount);

    if (post && post.tradeDTO) {
      const tradeData = post.tradeDTO;
      if (bid <= tradeData.highestBid) {
        alert("현재 입찰가보다 높은 금액을 입력해주세요.");
        return;
      }
    } else {
      console.warn("Post or tradeDTO not available during bid submission check.");
    }
    const confirmBid = window.confirm(`${bidAmount}원으로 입찰하시겠습니까?`);
    if (!confirmBid) return;
    alert(`${bidAmount}원 입찰이 완료되었습니다.`);
    if (post?.tradeDTO?.highestBid !== undefined && post.tradeDTO.highestBid !== null) {
      if (post.tradeDTO.highestBid + 1000 < bidAmount) {
        setHighestBid(bidAmount);
      }
    }
  };

  const handleBuyNow = () => {
    const confirmBuy = window.confirm("정말 즉시 구매하시겠습니까?");
    if (!confirmBuy) return;
    navigate(`/Art/payment/${post?.postId}`);
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
    navigate(`/worker/${post?.nickname}`);  // 작가의 페이지로 이동
  };

  const fetchArtworkDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/ourlog/post/read/${id}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (response.status === 403) {
        removeToken();
        alert("로그인이 만료되었거나 게시글을 조회할 권한이 없습니다. 다시 로그인해주세요.");
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("서버 에러 응답:", errorText);
        throw new Error(errorText || "작품을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setPost(data);
      setIsFollowing(false);
      setBidAmount(Number(data.currentBid) + 1000 || 0);
      setLoading(false);
    } catch (error) {
      console.error("작품 조회 실패:", error);
      alert("작품을 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArtworkDetail();
    }
  }, [id]);

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
        <p>작품을 찾을 수 없습니다.</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="art-detail-container">
      <div className="art-detail-content">
        <div className="left-content">
          <div className="art-image-container">
            <img
              src={post.fileName}
              alt={post.title}
              className="art-main-image"
            />
          </div>
          <div className="artwork-description">
            <h3>작품 설명</h3>
            <div className="description-content">
              <p>{post.content}</p>
            </div>
          </div>
        </div>

        <div className="art-info-container">
          <div className="artist-info">
            <div className="artist-avatar" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              <img src={post.thumbnailImagePath} alt={`${post.nickname} 프로필`} />
            </div>
            <div className="artist-detail" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              <h3>{post.nickname}</h3>
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
            <h2>{post.title}</h2>
            <p className="art-date">등록일: {post?.tradeDTO?.startBidTime ? new Date(post.tradeDTO.startBidTime).toLocaleString() : '날짜 정보 없음'}</p>
          </div>

          <div className="bid-info">
            <div className="bid-detail">
              <span>시작가</span>
              <p>{post.tradeDTO.startPrice}원</p>
            </div>
            <div className="bid-detail current">
              <span>현재 입찰가</span>
              <p>{post.tradeDTO.highestBid}원</p>
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
              <button className="buy-now-button" onClick={handleBuyNow}>
                즉시구매
              </button>
            </div>
            <button className="chat-button" onClick={handleOpenChat}>
              <span className="chat-icon">💬</span> 작가와 1:1 채팅
            </button>
            <button className="bid-history-button" onClick={handleBidHistory}>
              입찰내역
            </button>
          </div>
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
