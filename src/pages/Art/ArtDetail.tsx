import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/ArtDetail.css";
import { ArtPost, ArtDetailResponse } from "../../types/art";

const ArtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ArtPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>("");
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // 카운트다운 계산 함수
  const calculateTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const endDate = new Date(endTime).getTime();
    const difference = endDate - now;

    if (difference <= 0) {
      return "경매 종료";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
  };

  useEffect(() => {
    const fetchArtPost = async () => {
      try {
        // TODO: API 연동
        // const response = await fetch(`/api/arts/${id}`);
        // const data: ArtDetailResponse = await response.json();
        // setPost(data.data);
        
        // 테스트용 더미 데이터
        const now = new Date();
        const threeDaysLater = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

        const dummyPost: ArtPost = {
          post_id: 1,
          boardNo: 5,
          title: "뚱글뚱글 파스타",
          content: "일러스트 디지털 드로잉 작품입니다. 파스타와 다양한 베이커리 음식들을 귀엽게 표현한 작품입니다. 주방이나 카페 등에 인테리어용으로 적합합니다.",
          description: "일러스트 디지털 드로잉 작품입니다. 파스타와 다양한 베이커리 음식들을 귀엽게 표현한 작품입니다. 주방이나 카페 등에 인테리어용으로 적합합니다.",
          author: {
            id: 1,
            name: "작가1",
            profileImage: "/images/avatar.png",
            isFollowing: false
          },
          auction: {
            startingBid: 20000,
            currentBid: 30000,
            buyNowPrice: 50000,
            endTime: threeDaysLater.toISOString(),
            bidCount: 5
          },
          createdAt: "2023.05.15",
          updatedAt: "2023.05.15",
          images: ["/images/파스타.jpg"],
          likes: 128,
          views: 256,
          status: "ONGOING"
        };
        
        setPost(dummyPost);
        setBidAmount((dummyPost.auction.currentBid + 1000).toString());
        setLoading(false);
      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchArtPost();
  }, [id]);

  // 카운트다운 타이머 설정
  useEffect(() => {
    if (!post?.auction.endTime) return;

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft(post.auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [post?.auction.endTime]);

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

  const handleGoBack = () => {
    navigate("/Art");
  };

  const handleBidSubmit = () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      alert("유효한 입찰 금액을 입력해주세요.");
      return;
    }
    const bid = Number(bidAmount);
    if (post && bid <= post.auction.currentBid) {
      alert("현재 입찰가보다 높은 금액을 입력해주세요.");
      return;
    }
    const confirmBid = window.confirm(`${bidAmount}원으로 입찰하시겠습니까?`);
    if (!confirmBid) return;
    alert(`${bidAmount}원 입찰이 완료되었습니다.`);
    if (post) {
      setPost({
        ...post,
        auction: {
          ...post.auction,
          currentBid: bid,
          bidCount: post.auction.bidCount + 1
        }
      });
      setBidAmount((bid + 1000).toString());
    }
  };

  const handleBuyNow = () => {
    const confirmBuy = window.confirm("정말 즉시 구매하시겠습니까?");
    if (!confirmBuy) return;
    navigate(`/Art/payment/${post?.post_id}`);
  };

  const handleOpenChat = () => {
    const confirmChat = window.confirm("채팅을 시작하시겠습니까?");
    if (confirmChat) {
      window.location.href = "/chat";
    }
  };

  const handleBidHistory = () => {
    alert("입찰 내역을 확인합니다.");
  };

  const handleShareToggle = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleFollow = () => {
    if (post) {
      const newPost = {
        ...post,
        author: {
          ...post.author,
          isFollowing: !post.author.isFollowing
        }
      };
      setPost(newPost);
      const followMsg = !post.author.isFollowing
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
    navigate(`/worker/${post?.author.id}`);
  };

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
              src={post.images?.[0] || '/images/placeholder.jpg'}
              alt={post.title}
              className="art-main-image"
            />
          </div>
          <div className="artwork-description">
            <div className="art-title">
              <h2>{post.title}</h2>
              <p className="art-date">등록일: {post.createdAt}</p>
            </div>
            <div className="description-divider"></div>
            <h3>작품 설명</h3>
            <div className="description-content">
              <p>{post.description}</p>
            </div>
          </div>
        </div>

        <div className="art-info-container">
          <div className="artist-info">
            <div className="artist-avatar" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              <img src={post.author.profileImage} alt={`${post.author.name} 프로필`} />
            </div>
            <div className="artist-detail" onClick={handleArtistClick} style={{ cursor: 'pointer' }}>
              <h3>{post.author.name}</h3>
              <p>일러스트레이터</p>
            </div>
            <div className="artist-buttons">
              <button
                className={`follow-button ${post.author.isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {post.author.isFollowing ? "팔로잉" : "팔로우"}
              </button>
              <button
                className="share-button"
                onClick={handleShareToggle}
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

          <button className="chat-button" onClick={handleOpenChat}>
            <span className="chat-icon">💬</span> 작가와 1:1 채팅
          </button>

          <div className="auction-info">
            <div className="price-info">
              <div className="price-box">
                <div className="price-label">시작가</div>
                <div className="price-value">{post.auction.startingBid.toLocaleString()}원</div>
              </div>
              <div className="price-box current-price">
                <div className="price-label">현재 입찰가</div>
                <div className="price-value">{post.auction.currentBid.toLocaleString()}원</div>
              </div>
              <div className="price-box">
                <div className="price-label">즉시 구매가</div>
                <div className="price-value">{post.auction.buyNowPrice.toLocaleString()}원</div>
              </div>
            </div>
            <div className="countdown-box">
              <div className="countdown-label">경매 종료까지</div>
              <div className="countdown-value">{countdown}</div>
            </div>
          </div>

          <div className="bid-input">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
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
