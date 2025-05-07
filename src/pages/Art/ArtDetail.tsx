import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/ArtDetail.css";

interface ArtPost {
  id: number;
  title: string;
  author: string;
  description: string;
  currentBid: number;
  startingBid: number;
  buyNowPrice: number;
  endTime: string;
  createdAt: string;
  imageSrc: string;
  likes: number;
  artistProfileImg: string;
  isFollowing: boolean;
}

const ArtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ArtPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>("");
  useEffect(() => {
    const fetchArtPost = async () => {
      try {
        // 테스트용 1번 아트워크의 데이터
        const dummyPost: ArtPost = {
          id: 1,
          title: "뚱글뚱글 파스타",
          author: "작가1",
          description:
            "일러스트 디지털 드로잉 작품입니다. 파스타와 다양한 베이커리 음식들을 귀엽게 표현한 작품입니다. 주방이나 카페 등에 인테리어용으로 적합합니다.",
          currentBid: 30000,
          startingBid: 20000,
          buyNowPrice: 50000,
          endTime: "2023-12-31T23:59:59",
          createdAt: "2023.05.15",
          imageSrc: "/images/파스타.jpg",
          likes: 128,
          artistProfileImg: "/images/avatar.png",
          isFollowing: false,
        };
        setPost(dummyPost);
        setIsFollowing(dummyPost.isFollowing);
        setBidAmount((dummyPost.currentBid + 1000).toString());
        setLoading(false);
      } catch (error) {
        console.error("작품을 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchArtPost();
    // 카운트다운 타이머 설정
    const timer = setInterval(() => {
      if (post) {
        const endTime = new Date(post.endTime).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;
        if (distance < 0) {
          clearInterval(timer);
          setCountdown("경매 종료");
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}일 ${hours}:${minutes}:${seconds}`);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [id, post?.endTime]);

  const handleGoBack = () => {
    navigate("/Art");
  };

  const handleBidSubmit = () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      alert("유효한 입찰 금액을 입력해주세요.");
      return;
    }
    const bid = Number(bidAmount);
    if (post && bid <= post.currentBid) {
      alert("현재 입찰가보다 높은 금액을 입력해주세요.");
      return;
    }

    alert(`${bidAmount}원 입찰이 완료되었습니다.`);
    if (post) {
      setPost({ ...post, currentBid: bid });
      setBidAmount((bid + 1000).toString());
    }
  };

  const handleBuyNow = () => {
    navigate(`/Art/payment/${post?.id}`);
  };

  const handleChat = () => {
    alert("작가님과의 1:1 채팅이 시작됩니다.");
  };

  const handleBidHistory = () => {
    alert("입찰 내역을 확인합니다.");
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
  const handleShare = () => {
    alert("작품 링크가 복사되었습니다.");
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
        <div className="art-image-container">
          <img
            src={post.imageSrc}
            alt={post.title}
            className="art-main-image"
          />
          <div className="share-buttons">
            <button onClick={handleShare}>공유</button>
          </div>
        </div>

        <div className="art-info-container">
          <div className="artist-info">
            <div className="artist-avatar">
              <img src={post.artistProfileImg} alt={`${post.author} 프로필`} />
            </div>
            <div className="artist-detail">
              <h3>{post.author}</h3>
              <p>일러스트레이터</p>
            </div>
            <button
              className={`follow-button ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "팔로잉" : "팔로우"}
            </button>
          </div>

          <div className="art-title">
            <h2>{post.title}</h2>
            <p className="art-date">등록일: {post.createdAt}</p>
          </div>

          <div className="bid-info">
            <div className="bid-detail">
              <span>시작가</span>
              <p>{post.startingBid.toLocaleString()}원</p>
            </div>
            <div className="bid-detail current">
              <span>현재 입찰가</span>
              <p>{post.currentBid.toLocaleString()}원</p>
            </div>
            <div className="bid-detail">
              <span>즉시 구매가</span>
              <p>{post.buyNowPrice.toLocaleString()}원</p>
            </div>
          </div>
          <div className="auction-timer">
            <div className="timer-icon">⏱️</div>
            <div className="timer-content">
              <span>남은 시간</span>
              <p>{countdown}</p>
            </div>
            <button className="bid-history-button" onClick={handleBidHistory}>
              입찰내역
            </button>
          </div>
          <div className="bid-input">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={post.currentBid + 1000}
              step="1000"
              placeholder="입찰 금액을 입력하세요"
            />
            <span className="currency">원</span>
          </div>

          <div className="action-buttons">
            <button className="bid-button" onClick={handleBidSubmit}>
              입찰하기
            </button>
            <button className="buy-now-button" onClick={handleBuyNow}>
              즉시구매
            </button>
          </div>
          <button className="chat-button" onClick={handleChat}>
            <span className="chat-icon">💬</span> 작가와 1:1 채팅
          </button>

          <div className="description-section">
            <h3>작품 설명</h3>
            <div className="description-content">
              {post.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
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
