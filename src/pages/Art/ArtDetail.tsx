import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/ArtDetail.css";

// src/types에서 필요한 인터페이스를 임포트합니다.
import { PostDTO } from "../../types/postTypes";
import { PictureDTO } from "../../types/pictureTypes";

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

  const [mainImagePicture, setMainImagePicture] = useState<PictureDTO | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

    if (post?.tradeDTO?.nowBuy !== null && bid === post.tradeDTO.nowBuy) {
        const confirmNowBuy = window.confirm(
            `현재 지정한 입찰 금액(${bid.toLocaleString()}원)은 즉시구매가와 동일합니다.\n즉시구매 페이지로 이동하시겠습니까?`
        );
        if (confirmNowBuy) {
            handleBuyNow();
        }
        return;
    }

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

        const tradeId = post.tradeDTO.tradeId;
        if (!tradeId) {
            alert("경매 정보를 찾을 수 없습니다.");
            return;
        }

        const response = await fetch(`http://localhost:8080/ourlog/trades/${tradeId}/bid`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bidAmount: bid,
            }),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error("입찰 실패 응답:", responseText);
            try {
                const errorJson = JSON.parse(responseText);
                 alert(`입찰 실패: ${errorJson.message || responseText || '서버 오류'}`);
            } catch (e) {
                 alert(`입찰 실패: ${responseText || '서버 오류'}`);
            }
            if (post?.postId) {
                 fetchArtworkDetail(post.postId.toString());
            }
            return;
        }

        alert(`입찰 성공: ${responseText}`);
        if (post?.postId) {
             fetchArtworkDetail(post.postId.toString());
        }

    } catch (error) {
        console.error("입찰 요청 중 오류 발생:", error);
        alert(`입찰 요청 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
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
      console.warn("Trade ID is null or undefined, cannot navigate to payment.");
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
    alert("입찰 내역을 확인합니다."); // TODO: 실제 입찰 내역 페이지/모달 구현 필요
    // 경매 종료 작품의 경우, 낙찰자와 판매자만 입찰 내역 열람 가능하도록 백엔드 또는 여기서 권한 체크 필요
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

  const handleImageClick = (picture: PictureDTO) => {
      setMainImagePicture(picture);
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

      if (data.postDTO?.pictureDTOList && data.postDTO.pictureDTOList.length > 0) {
          const thumbnail = data.postDTO.pictureDTOList.find(
            (pic: PictureDTO) => pic.uuid === data.postDTO.fileName
          );
          if (thumbnail) {
            setMainImagePicture(thumbnail);
          } else {
            setMainImagePicture(data.postDTO.pictureDTOList[0]);
          }
      } else {
          setMainImagePicture(null);
      }

      // 경매 정보가 있고 종료 시간이 지났으면 상태 업데이트 요청
      if (data.postDTO?.tradeDTO && data.postDTO.tradeDTO.lastBidTime) {
          const endTime = new Date(data.postDTO.tradeDTO.lastBidTime).getTime();
          const now = Date.now();
          // tradeStatus가 0(진행 중)이고, 종료 시간이 현재 시간보다 이전이면
          if ((data.postDTO.tradeDTO.tradeStatus === 0 || data.postDTO.tradeDTO.tradeStatus === null) && now >= endTime) {
              console.log(`경매 종료 시간(${new Date(endTime).toLocaleString()})이 지났습니다. 상태 업데이트를 시도합니다.`);
              updateAuctionStatus(data.postDTO.tradeDTO.tradeId, 1);
          }
      }

    } catch (error) {
      console.error("작품 조회 중 오류 발생:", error);
      alert("작품을 불러오는 중 오류가 발생했습니다.");
      setPost(null);
      setLoading(false);
    }
  };

  // 경매 상태 업데이트 (tradeStatus)
  const updateAuctionStatus = async (tradeId: number, status: number) => {
      try {
          const headers = getAuthHeaders();
          if (!headers) {
              console.error("인증 헤더가 없습니다.");
              return;
          }

          console.log("경매 상태 업데이트 요청:", { tradeId, status });

          const response = await fetch(`http://localhost:8080/ourlog/trades/${tradeId}/close`, {
              method: 'PUT',
              headers: {
                  ...headers,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  tradeStatus: status,
                  endTime: new Date().toISOString()
              }),
          });

          if (!response.ok) {
              const errorText = await response.text();
              console.error(`경매 상태 업데이트 실패 (${response.status}):`, errorText);
              alert("경매 상태 업데이트에 실패했습니다.");
          } else {
              console.log(`경매 ID ${tradeId} 상태가 ${status}로 업데이트되었습니다.`);
              if (post?.postId) {
                  fetchArtworkDetail(post.postId.toString());
              }
          }
      } catch (error) {
          console.error("경매 상태 업데이트 요청 중 오류 발생:", error);
          alert("경매 상태 업데이트 중 오류가 발생했습니다.");
      }
  };

  // 조회수 증가 함수 추가
  const increaseArtworkViewCount = async (postId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/post/increaseViews/${postId}`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 403) {
        console.warn("작품 조회수 증가 실패: 인증 필요");
        return;
      }

      if (!response.ok) {
        throw new Error("작품 조회수 증가 실패");
      }
      console.log("작품 조회수 증가 성공");
    } catch (error) {
      console.error("작품 조회수 증가 실패:", error);
    }
  };

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const postId = id; // id를 postId로 사용
      // 조회수 증가 API 호출
      increaseArtworkViewCount(postId);
      // 작품 상세 정보 불러오기
      fetchArtworkDetail(postId);
    } else if (id !== 'payment') {
      console.warn("Post ID is missing or not a valid number in URL parameters:", id);
      alert("잘못된 접근입니다. 작품 정보를 불러올 수 없습니다.");
      setPost(null);
      setLoading(false);
    } else {
      // 'payment' 경로인 경우 로딩 상태 해제만
      setLoading(false);
    }
  }, [id, navigate]); // id가 변경될 때마다 useEffect 실행

  useEffect(() => {
    if (post?.tradeDTO?.lastBidTime) {
      const endTime = new Date(post.tradeDTO.lastBidTime).getTime();
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setCountdown("경매 종료");
          // 경매 종료 시간이 지났을 때 자동으로 상태 업데이트
          if (post.tradeDTO && !post.tradeDTO.tradeStatus) {
            updateAuctionStatus(post.tradeDTO.tradeId, 1);
          }
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
  }, [post?.tradeDTO?.lastBidTime, post?.tradeDTO?.tradeStatus]);

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

  useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && user.userId) {
          setCurrentUserId(user.userId);
      } else {
          setCurrentUserId(null);
      }
  }, []);

  const handleReregisterClick = () => {
      if (!post) return;
      navigate(`/art/register`, { state: { postData: post, isReregister: true } });
  };

  const handleDownloadOriginal = () => {
      if (!post?.pictureDTOList || post.pictureDTOList.length === 0) {
          alert("다운로드할 이미지가 없습니다.");
          return;
      }
      const originalImagePath = post.pictureDTOList[0].originImagePath;
      if (!originalImagePath) {
           alert("원본 이미지 경로 정보를 찾을 수 없습니다.");
           return;
      }

      const imageUrl = `http://localhost:8080/ourlog/picture/display/${originalImagePath}`;

      const link = document.createElement('a');
      link.href = imageUrl;
      link.setAttribute('download', `${post.title || post.postId}_original.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <p>작품 정보를 불러오지 못했습니다.</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  const isSeller = currentUserId !== null && post.userId === currentUserId;
  const isSuccessfulBidder = currentUserId !== null && post.tradeDTO?.tradeStatus === true && post.tradeDTO?.bidderId === currentUserId;

  return (
    <div className="art-detail-container">
      <div className="art-detail-content">
        <div className="left-content">
          <div className="art-image-display-area">
            <div className="main-image-container">
              {mainImagePicture ? (
                <img
                  src={`http://localhost:8080/ourlog/picture/display/${mainImagePicture.originImagePath}`}
                  alt={post?.title || "Main artwork image"}
                  className="main-artwork-image"
                />
              ) : (
                <div className="no-image-placeholder main">이미지 없음</div>
              )}
            </div>

            {post?.pictureDTOList && post.pictureDTOList.length > 1 && (
              <div className="thumbnail-list-container">
                {post.pictureDTOList
                  .filter(pic => pic.uuid !== mainImagePicture?.uuid)
                  .map((picture, index) => {
                    const imageUrl = picture.originImagePath
                      ? `http://localhost:8080/ourlog/picture/display/${picture.originImagePath}`
                      : null;

                    if (!imageUrl) return null;

                    return (
                      <div
                        key={picture.uuid || index}
                        className="thumbnail-item"
                        onClick={() => handleImageClick(picture)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={imageUrl}
                          alt={`${post?.title || 'Thumbnail image'} ${index + 1}`}
                          className="thumbnail-image"
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="artwork-description-relocated">
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
                  <span>{post.tradeDTO.tradeStatus ? '상태' : '남은 시간'}</span>
                  {post.tradeDTO.tradeStatus ? (
                    // 경매 종료 시 메시지 및 채팅 버튼
                    null
                  ) : (
                    // 경매 진행 중 시 남은 시간
                    <p>{countdown}</p>
                  )}
                </div>
              </div>

              {post.tradeDTO.tradeStatus && (
                 <div className="auction-ended-info">
                    <p>경매가 종료되었습니다.</p>
                    <button className="chat-button" onClick={handleOpenChat}>
                      <span className="chat-icon">💬</span> 작가와 1:1 채팅
                    </button>
                 </div>
              )}

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
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="non-trade-info">
               <p>이 게시물은 경매 상품이 아닙니다.</p>
               <button className="chat-button" onClick={handleOpenChat}>
                <span className="chat-icon">💬</span> 작가와 1:1 채팅
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="art-actions">
        <button onClick={handleGoBack} className="back-button">
          목록으로
        </button>
        {post?.tradeDTO?.tradeStatus === true && isSeller && (
            <button type="button" className="reregister-button" onClick={handleReregisterClick}>
                경매 재등록
            </button>
        )}
      </div>
    </div>
  );
};

export default ArtDetail;

