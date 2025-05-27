import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/ArtDetail.css";

// src/types에서 필요한 인터페이스를 임포트합니다.
import { PostDTO } from "../../types/postTypes";
import { PictureDTO } from "../../types/pictureTypes";

// ✅ 이미지 서빙을 위한 백엔드 베이스 URL 추가
const imageBaseUrl = `http://localhost:8080/ourlog/picture/display/`; // 예시 경로, 실제 백엔드 경로에 맞게 수정 필요

interface PostDetailWithLike extends PostDTO {
  liked?: boolean;
}

// ✅ 조회수 증가 함수를 fetchArtworkDetail 밖으로 이동
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

const ArtDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetailWithLike | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ✅ 특정 postId에 대한 조회수 증가 API 호출 여부를 추적하는 ref
  const isViewCountIncreasedRef = useRef<{ [key: string]: boolean }>({});

  const [countdown, setCountdown] = useState<string>("");

  const [mainImagePicture, setMainImagePicture] = useState<PictureDTO | null>(
    null
  );

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

    const currentHighestBid =
      post.tradeDTO.highestBid ?? post.tradeDTO.startPrice;

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
      alert(
        `입찰가는 현재 최고가(${currentHighestBid.toLocaleString()}원)보다 1000원 이상 높아야 합니다.`
      );
      return;
    }

    const confirmBid = window.confirm(
      `${bid.toLocaleString()}원으로 입찰하시겠습니까?`
    );
    if (!confirmBid) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const tradeId = post.tradeDTO.tradeId;
      if (!tradeId) {
        alert("경매 정보를 찾을 수 없습니다.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/ourlog/trades/${tradeId}/bid`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bidAmount: bid,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error("입찰 실패 응답:", responseText);
        try {
          const errorJson = JSON.parse(responseText);
          alert(
            `입찰 실패: ${errorJson.message || responseText || "서버 오류"}`
          );
        } catch (e) {
          alert(`입찰 실패: ${responseText || "서버 오류"}`);
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
      alert(
        `입찰 요청 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      if (post?.postId) {
        fetchArtworkDetail(post.postId.toString());
      }
    }
  };

  const handleBuyNow = () => {
    const confirmBuy = window.confirm("정말 즉시 구매하시겠습니까?");
    if (!confirmBuy) return;
    if (
      post?.tradeDTO?.tradeId !== undefined &&
      post.tradeDTO.tradeId !== null
    ) {
      navigate(`/Art/payment`, { state: { post } });
    } else {
      console.warn(
        "Trade ID is null or undefined, cannot navigate to payment."
      );
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

  const handleFollow = async () => {
    if (
      currentUserId === null ||
      post?.userId === undefined ||
      currentUserId === 0 || // 로그인 안됨 또는 유효하지 않음
      post.userId === 0 || // 아티스트 ID 유효하지 않음
      currentUserId === post.userId // 본인 팔로우 방지
    ) {
      console.warn("🔴 팔로우 조건 미충족", { loggedInUserId: currentUserId, userId: post?.userId });
      // 로그인 필요 또는 본인 팔로우 불가 등의 메시지를 사용자에게 보여줄 수 있습니다.
       if (currentUserId === null || currentUserId === 0) {
          alert("팔로우 기능을 사용하려면 로그인이 필요합니다.");
       } else if (currentUserId === post?.userId) {
          // 본인 팔로우 시도 시 메시지 (선택 사항)
       }
      return;
    }

    const token = localStorage.getItem("token");
    const isNowFollowing = !isFollowing;
    const method = isNowFollowing ? "POST" : "DELETE";
    const url = isNowFollowing
      ? `http://localhost:8080/ourlog/followers/${currentUserId}/follow/${post.userId}`
      : `http://localhost:8080/ourlog/followers/${currentUserId}/unfollow/${post.userId}`;

    // Optimistic UI 업데이트
    setIsFollowing(isNowFollowing);
    // 팔로우/팔로잉 수 업데이트는 WorkerPage에서만 필요한 기능이므로 ArtDetail에서는 생략합니다.

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // 실패 시 롤백
        setIsFollowing(!isNowFollowing);
        const errorMsg = isNowFollowing ? "팔로우 실패" : "팔로우 취소 실패";
        try {
           const errorText = await res.text();
           console.error(`❌ ${errorMsg} 응답:`, errorText);
           alert(`${errorMsg}: ${errorText || '서버 오류'}`);
        } catch (e) {
           console.error(`❌ ${errorMsg} 응답 처리 중 오류:`, e);
           alert(`${errorMsg}: 서버 오류`);
        }
        throw new Error(`${errorMsg} (${res.status})`);
      }

      // 성공 시 추가 작업 (필요하다면)
      console.log(isNowFollowing ? "팔로우 성공" : "팔로우 취소 성공");

    } catch (err) {
      console.error("❌ 팔로우 API 요청 실패:", err);
      // setIsFollowing(!isNowFollowing); // 이미 위에서 롤백 처리
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
      navigate(`/worker/${post.userId}`); // 작가의 페이지로 이동
    } else {
      console.warn(
        "Artist nickname is null or undefined, cannot navigate to artist page."
      );
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

      if (!postId || postId === "undefined") {
        console.error("유효하지 않은 Post ID로 API 호출 시도:", postId);
        alert("유효하지 않은 작품 정보입니다.");
        setLoading(false);
        setPost(null);
        return;
      }

      const response = await fetch(
        `http://localhost:8080/ourlog/post/read/${postId}`,
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          console.error("작품 조회 실패: 접근 권한 없음 (403 Forbidden)");
          alert("작품 조회 권한이 없습니다.");
        } else if (response.status === 404) {
          console.error("작품 조회 실패: 작품을 찾을 수 없음 (404 Not Found)");
          alert("요청하신 작품을 찾을 수 없습니다.");
        } else {
          console.error(`작품 조회 실패: HTTP 상태 코드 ${response.status}`);
          alert("작품을 불러오는데 실패했습니다. 다시 시도해주세요.");
        }
        setPost(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const postData = data.postDTO;

      // ✅ 로그인된 사용자의 좋아요 상태를 추가로 가져옴
      let userLiked = false;
      if (currentUserId !== null) {
        try {
          const likeStatusResponse = await fetch(
            `http://localhost:8080/ourlog/favorites/${currentUserId}/${postId}`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );

          if (likeStatusResponse.ok) {
            const statusData = await likeStatusResponse.json();
            userLiked = statusData === true; // API 응답 형태에 따라 조정 (boolean 또는 { favorited: boolean })
          } else {
            console.warn(
              `사용자 좋아요 상태 불러오기 실패 (${likeStatusResponse.status})`
            );
          }
        } catch (likeError) {
          console.error("사용자 좋아요 상태 불러오기 오류:", likeError);
        }
      }

      setPost({
        ...postData,
        liked: userLiked, // 좋아요 상태 추가
        favoriteCnt: postData.favoriteCnt ?? 0, // 초기 좋아요 카운트 (업데이트 예정)
      });

      // ✅ 추가: 로그인된 사용자의 팔로우 상태를 추가로 가져옴
      let userFollowing = false;
      if (currentUserId !== null && postData?.userId && currentUserId !== postData.userId) {
        try {
          const followStatusResponse = await fetch(
            `http://localhost:8080/ourlog/followers/status/isFollowing/${currentUserId}/${postData.userId}`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );

          if (followStatusResponse.ok) {
            const statusData = await followStatusResponse.json();
            userFollowing = statusData === true; // API 응답 형태에 따라 조정
          } else {
            console.warn(
              `사용자 팔로우 상태 불러오기 실패 (${followStatusResponse.status})`
            );
          }
        } catch (followError) {
          console.error("사용자 팔로우 상태 불러오기 오류:", followError);
        }
      }
      setIsFollowing(userFollowing); // 팔로우 상태 초기화

      // ✅ 추가: 최신 좋아요 수를 다시 가져와 업데이트
      if (postData?.postId !== undefined && postData.postId !== null) {
          try {
              const countResponse = await fetch(
                  `http://localhost:8080/ourlog/favorites/count/${postData.postId}`,
                  {
                      method: "GET",
                      headers: getAuthHeaders(),
                  }
              );
              if (countResponse.ok) {
                  const countData = await countResponse.json();
                  if (typeof countData === "number") {
                      setPost(prevPost => {
                          if (!prevPost || prevPost.postId !== postData.postId) return prevPost;
                          return { ...prevPost, favoriteCnt: countData };
                      });
                  } else if (countData && typeof countData.count === "number") { // 응답 형태가 { count: number } 인 경우
                       setPost(prevPost => {
                          if (!prevPost || prevPost.postId !== postData.postId) return prevPost;
                          return { ...prevPost, favoriteCnt: countData.count };
                      });
                  }
              } else {
                  console.warn(`❌ ArtDetail 좋아요 수 불러오기 실패 (${countResponse.status}) for postId ${postData.postId}`);
              }
          } catch (countError) {
              console.error("❌ ArtDetail 좋아요 수 불러오기 오류:", countError);
          }
      }

      setBidAmount(Number(postData?.tradeDTO?.highestBid || 0) + 1000);
      setLoading(false);

      if (
        postData?.pictureDTOList &&
        postData.pictureDTOList.length > 0
      ) {
        const thumbnail = postData.pictureDTOList.find(
          (pic: PictureDTO) => pic.uuid === postData.fileName
        );
        if (thumbnail) {
          setMainImagePicture(thumbnail);
        } else {
          setMainImagePicture(postData.pictureDTOList[0]);
        }
      } else {
        setMainImagePicture(null);
      }

      // 경매 정보가 있고 종료 시간이 지났으면 상태 업데이트 요청
      if (postData?.tradeDTO && postData.tradeDTO.lastBidTime) {
        const endTime = new Date(postData.tradeDTO.lastBidTime).getTime();
        const now = Date.now();
        // tradeStatus가 0(진행 중)이고, 종료 시간이 현재 시간보다 이전이면
        if (
          (postData.tradeDTO.tradeStatus === 0 ||
            postData.tradeDTO.tradeStatus === null) &&
          now >= endTime
        ) {
          console.log(
            `경매 종료 시간(${new Date(
              endTime
            ).toLocaleString()})이 지났습니다. 상태 업데이트를 시도합니다.`
          );
          updateAuctionStatus(postData.tradeDTO.tradeId, 1);
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

      const response = await fetch(
        `http://localhost:8080/ourlog/trades/${tradeId}/close`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tradeStatus: status,
            endTime: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `경매 상태 업데이트 실패 (${response.status}):`,
          errorText
        );
        alert("경매 상태 업데이트에 실패했습니다.");
      } else {
        console.log(
          `경매 ID ${tradeId} 상태가 ${status}로 업데이트되었습니다.`
        );
        if (post?.postId) {
          fetchArtworkDetail(post.postId.toString());
        }
      }
    } catch (error) {
      console.error("경매 상태 업데이트 요청 중 오류 발생:", error);
      alert("경매 상태 업데이트 중 오류가 발생했습니다.");
    }
  };

  // ✅ useEffect에서 increaseArtworkViewCount와 fetchArtworkDetail을 별도로 호출하도록 수정
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const postId = id;

      // ✅ 해당 postId에 대해 조회수 증가 API가 아직 호출되지 않았다면 호출
      if (!isViewCountIncreasedRef.current[postId]) {
        increaseArtworkViewCount(postId);
        isViewCountIncreasedRef.current[postId] = true; // 호출했음을 기록
      }

      // 작품 상세 정보 불러오기 (이것은 매번 호출될 수 있음)
      fetchArtworkDetail(postId);
    } else if (id !== "payment") {
      console.warn(
        "Post ID is missing or not a valid number in URL parameters:",
        id
      );
      alert("잘못된 접근입니다. 작품 정보를 불러올 수 없습니다.");
      setPost(null);
      setLoading(false);
    } else {
      // 'payment' 경로인 경우 로딩 상태 해제만
      setLoading(false);
    }
  }, [id, navigate, currentUserId]); // currentUserId 변경 시에도 다시 불러오도록 의존성 추가

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
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}일 ${hours}시 ${minutes}분 ${seconds}초`);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown("경매 정보 없음");
    }
  }, [post?.tradeDTO?.lastBidTime, post?.tradeDTO?.tradeStatus, post?.tradeDTO?.tradeId]);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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
    navigate(`/art/register`, {
      state: { postData: post, isReregister: true },
    });
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

    const link = document.createElement("a");
    link.href = imageUrl;
    link.setAttribute("download", `${post.title || post.postId}_original.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ 좋아요 토글 함수 추가 (Optimistic Update 포함)
  const handleLikeToggle = async () => {
    if (currentUserId === null) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (!post || post.postId === undefined || post.postId === null) {
      console.error("작품 정보가 없어 좋아요 토글 불가");
      return;
    }

    const token = localStorage.getItem("token");

    // Optimistic UI 업데이트
    setPost((prevPost) => {
      if (!prevPost) return null;
      const newLiked = !(prevPost.liked ?? false);
      const newFavoriteCnt = (prevPost.favoriteCnt ?? 0) + (newLiked ? 1 : -1);
      return {
        ...prevPost,
        liked: newLiked,
        favoriteCnt: newFavoriteCnt,
      };
    });

    try {
      const result = await fetch(`http://localhost:8080/ourlog/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: currentUserId,
          postId: post.postId,
        }),
      });

      if (!result.ok) throw new Error("서버 응답 오류");

      const data = await result.json();

      // 백엔드 응답으로 최종 상태 업데이트
      if (post.postId !== undefined && post.postId !== null && typeof data.favoriteCount === "number") {
        setPost((prevPost) => {
          if (!prevPost || prevPost.postId !== post.postId) return prevPost;
          return {
            ...prevPost,
            liked: data.favorited,
            favoriteCnt: data.favoriteCount,
          };
        });
      }

    } catch (error) {
      console.error(`좋아요 처리 실패: ${post.postId}`, error);

      // 실패 시 optimistic rollback
      setPost((prevPost) => {
        if (!prevPost) return null;
        const rolledBackLiked = !(prevPost.liked ?? false); // optimistic update 이전 상태
        const rolledBackFavoriteCnt = (prevPost.favoriteCnt ?? 0) + (rolledBackLiked ? 1 : -1); // optimistic update 이전 상태
        return {
          ...prevPost,
          liked: rolledBackLiked,
          favoriteCnt: rolledBackFavoriteCnt,
        };
      });
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

  if (!post) {
    return (
      <div className="error-container">
        <p>작품 정보를 불러오지 못했습니다.</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  const isSeller = currentUserId !== null && post.userId === currentUserId;
  const isSuccessfulBidder =
    currentUserId !== null &&
    post.tradeDTO?.tradeStatus === true &&
    post.tradeDTO?.bidderId === currentUserId;

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
                  .filter((pic) => pic.uuid !== mainImagePicture?.uuid)
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
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={imageUrl}
                          alt={`${post?.title || "Thumbnail image"} ${
                            index + 1
                          }`}
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
              <p>{post.content || "설명 없음"}</p>
            </div>
          </div>
        </div>

        <div className="art-info-container">
          <div className="artist-info">
            <div
              className="artist-avatar"
              onClick={handleArtistClick}
              style={{ cursor: "pointer" }}
            >
              {post.profileImage ? (
                <img
                  src={
                    post.profileImage.startsWith('/ourlog')
                      ? `http://localhost:8080${post.profileImage}`
                      : `${imageBaseUrl}${post.profileImage}`
                  }
                  alt={`${post.nickname || "알 수 없는 작가"} 프로필`}
                  className="artist-profile-image"
                />
              ) : (
                <div className="default-avatar">👤</div>
              )}
            </div>
            <div
              className="artist-detail"
              onClick={handleArtistClick}
              style={{ cursor: "pointer" }}
            >
              <h3>{post.nickname || "알 수 없는 작가"}</h3>
              <p>일러스트레이터</p>
            </div>
            <div className="artist-buttons">
              {currentUserId !== null && post?.userId !== undefined && currentUserId !== post.userId && (
                <button
                  onClick={handleFollow}
                  className={`follow-button ${isFollowing ? 'following' : ''}`}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              )}
              <button onClick={handleOpenChat} className="share-button">
                채팅
              </button>
            </div>
          </div>

          <div className="art-title">
            <h2>{post.title || "제목 없음"}</h2>
            {/* ✅ 좋아요 버튼 추가 */}
            {currentUserId !== null && post?.postId !== undefined && post?.postId !== null && (
              <button
                className={`art-detail-like-button ${post.liked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
              >
                {post.liked ? '🧡' : '🤍'} {post.favoriteCnt ?? 0}
              </button>
            )}
            <p className="art-date">
              등록일:{" "}
              {post?.tradeDTO?.startBidTime
                ? new Date(post.tradeDTO.startBidTime).toLocaleString()
                : "날짜 정보 없음"}
            </p>
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
                  <p>
                    {post.tradeDTO.highestBid !== null
                      ? `${post.tradeDTO.highestBid}원`
                      : "입찰 내역 없음"}
                  </p>
                </div>
                <div className="bid-detail">
                  <span>즉시 구매가</span>
                  <p>{post.tradeDTO.nowBuy}원</p>
                </div>
              </div>

              <div className="auction-timer">
                <div className="timer-icon">⏱️</div>
                <div className="timer-content">
                  <span>
                    {post.tradeDTO.tradeStatus ? "상태" : "남은 시간"}
                  </span>
                  {post.tradeDTO
                    .tradeStatus ? // 경매 종료 시 메시지 및 채팅 버튼
                  null : (
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
                        <button
                          className="buy-now-button"
                          onClick={handleBuyNow}
                        >
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
          <button
            type="button"
            className="reregister-button"
            onClick={handleReregisterClick}
          >
            경매 재등록
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtDetail;
