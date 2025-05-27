import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PostList.css";
import "../styles/ArtList.css";

interface ArtWork {
  id: number;
  title: string;
  author: string;
  artistProfileImg: string;
  thumbnail?: string;
  contents?: string;
  highestBid: number;
  createdAt: string;
  imageSrc: string;
  userId?: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  artistProfileImg: string;
  contents?: string;
  createdAt: string;
  thumbnail?: string;
  category?: string;
  boardId?: number;
  userId?: string;
}

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParam = new URLSearchParams(location.search).get("query");
  const stateParam = location.state?.q;
  const query = searchParam || stateParam || "";
  const lowerQuery = query.trim().toLowerCase();

  const boardNo = 0;

  const [posts, setPosts] = useState<Post[]>([]);
  const [artworks, setArtworks] = useState<ArtWork[]>([]);
  const [loading, setLoading] = useState(false);

  // 이미지 URL 생성 함수
  const getImageSrcFromItem = (item: any) => {
    let artworkImageSrc = "/default-image.jpg";
    const picData =
      item.pictureDTOList && item.pictureDTOList.length > 0
        ? item.pictureDTOList[0]
        : item;

    if (picData.resizedImagePath) {
      artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.resizedImagePath}`;
    } else if (picData.thumbnailImagePath) {
      artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.thumbnailImagePath}`;
    } else if (picData.originImagePath) {
      artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.originImagePath}`;
    } else if (picData.fileName) {
      artworkImageSrc = `http://localhost:8080/ourlog/picture/display/${picData.fileName}`;
    }

    return artworkImageSrc;
  };

  // 프로필이미지
  const getProfileImageUrl = (imgPath: string) => {
    if (!imgPath) return "/images/avatar.png"; // 기본 아바타 이미지
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
      return imgPath; // 절대경로는 그대로 반환
    }
    // 상대경로일 경우 서버 주소 붙여서 반환
    return `http://localhost:8080/ourlog/picture/display/${imgPath}`;
  };

  useEffect(() => {
    if (lowerQuery === "") {
      setPosts([]);
      setArtworks([]);
      return;
    }

    setLoading(true);

    fetch(
      `http://localhost:8080/ourlog/post/list?boardNo=${boardNo}&type=all&keyword=${encodeURIComponent(
        lowerQuery
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        const rawPosts = data.pageResultDTO?.dtoList || [];
        console.log("rawPosts:", rawPosts);

        // 전체 게시글
        const allPosts: Post[] = rawPosts.map((item) => ({
          id: item.postId,
          title: item.title,
          author: item.nickname || "알수없음",
          artistProfileImg: item.userProfileDTO?.thumbnailImagePath || "",
          contents: item.content,
          highestBid:
            item.tradeDTO &&
            item.tradeDTO.highestBid &&
            !isNaN(Number(item.tradeDTO.highestBid)) &&
            Number(item.tradeDTO.highestBid) > 0
              ? `₩${Number(item.tradeDTO.highestBid).toLocaleString()}`
              : "",
          createdAt: item.regDate?.split("T")[0] || "",
          thumbnail: item.thumbnailImagePath || "",
          category: item.tag,
          boardId: item.boardNo,
          userId: item.userId,
        }));

        // 중복 제거 및 필터링
        const communityPosts = allPosts.filter((post) => post.boardId !== 5);
        const uniqueCommunityPosts = Array.from(
          new Map(communityPosts.map((post) => [post.id, post])).values()
        );

        // 아트 게시글 (boardId === 5)
        const artworkPosts: ArtWork[] = allPosts
          .filter((post) => post.boardId === 5)
          .map((post) => {
            const item = rawPosts.find((p) => p.postId === post.id);

            return {
              id: post.id,
              title: post.title,
              author: post.author,
              artistProfileImg: post.artistProfileImg,
              contents: post.contents,
              highestBid: item?.tradeDTO?.highestBid || 0,
              createdAt: post.createdAt,
              imageSrc: item ? getImageSrcFromItem(item) : post.thumbnail || "",
              userId: post.userId,
            };
          });

        const uniqueArtworkPosts = Array.from(
          new Map(artworkPosts.map((art) => [art.id, art])).values()
        );

        setPosts(uniqueCommunityPosts);
        setArtworks(uniqueArtworkPosts);
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
        setPosts([]);
        setArtworks([]);
      })
      .finally(() => setLoading(false));
  }, [lowerQuery, boardNo]);

  const filteredPosts = posts;
  const filteredArtworks = artworks;

  const uniqueAuthors = Array.from(
    new Set(filteredArtworks.map((art) => art.author))
  ).length;

  return (
    <div className="container">
      <div className="section-title-search">
        <h2>"{query}"에 대한 검색 결과</h2>
      </div>

      {loading && <p>로딩중...</p>}

      {query.trim() === "" ? (
        <p className="main-search">검색어를 입력해주세요.</p>
      ) : (
        <>
          <div className="section-title-search">
            <h2>작가 ({uniqueAuthors})</h2>
          </div>

          {uniqueAuthors > 0 && (
            <div className="author-list">
              {Array.from(
                new Set(filteredArtworks.map((art) => art.author))
              ).map((author, index) => {
                const authorArt = filteredArtworks.find(
                  (art) => art.author === author
                );
                const profileImg = getProfileImageUrl(
                  authorArt?.artistProfileImg || ""
                );
                const userId = authorArt?.userId;

                return (
                  <div key={index}>
                    <div
                      className="artist-info"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (userId) {
                          navigate(`/worker/${userId}`, { state: { userId } });
                        } else {
                          alert("작가 정보가 없습니다.");
                        }
                      }}
                    >
                      <div className="artist-avatar">
                        <img src={profileImg} alt={`${author} 프로필`} />
                      </div>
                      <div className="artist-detail">
                        <h3>{author}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="section-title-search">
            <h2>아트 ({filteredArtworks.length})</h2>
          </div>

          {filteredArtworks.length > 0 && (
            <div className="popular-artworks">
              {filteredArtworks.map((art) => (
                <div
                  key={art.id}
                  className="artwork-card"
                  onClick={() => navigate(`/Art/${art.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="artwork-image">
                    {art.imageSrc && art.imageSrc.trim() !== "" && (
                      <img src={art.imageSrc} alt={art.title} />
                    )}
                  </div>
                  <div className="artwork-info">
                    <h3>{art.title}</h3>
                    <p className="artwork-author">작가: {art.author}</p>
                    <p className="artwork-price">
                      {art.highestBid.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: "100px" }}>
            <div className="section-title-search">
              <h2>커뮤니티 ({filteredPosts.length})</h2>
            </div>

            {filteredPosts.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <tr
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{index + 1}</td>
                      <td>{post.title}</td>
                      <td>{post.author}</td>
                      <td>{post.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
