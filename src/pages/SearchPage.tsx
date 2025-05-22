import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PostList.css";
import "../styles/ArtList.css";

interface ArtWork {
  id: number;
  title: string;
  author: string;
  artistProfileImg: string;
  contents?: string;
  price: number;
  likes: number;
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

  // URL 쿼리나 location state에서 검색어를 가져옴
  const searchParam = new URLSearchParams(location.search).get("query");
  const stateParam = location.state?.q;
  const query = searchParam || stateParam || "";
  const lowerQuery = query.trim().toLowerCase();

  // 게시판 번호 (전체 게시글 가져올 땐 0 또는 undefined 등으로 처리)
  const boardNo = 0; // 전체 게시판 대상이라 가정

  // 상태 관리
  const [posts, setPosts] = useState<Post[]>([]);
  const [artworks, setArtworks] = useState<ArtWork[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lowerQuery === "") {
      setPosts([]);
      setArtworks([]);
      return;
    }

    setLoading(true);

    fetch(
      `http://localhost:8080/ourlog/post/list?boardNo=${boardNo}&type=t&keyword=${encodeURIComponent(
        lowerQuery
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        const rawPosts = data.pageResultDTO?.dtoList || [];
        const allPosts: Post[] = rawPosts.map((item) => ({
          id: item.postId,
          title: item.title,
          author: item.nickname || "알수없음",
          artistProfileImg: item.userProfileDTO?.thumbnailImagePath || "",
          contents: item.content,
          createdAt: item.regDate?.split("T")[0] || "",
          thumbnail: item.userProfileDTO?.thumbnailImagePath || "",
          category: item.tag,
          boardId: item.boardNo,
          userId: item.userId,
        }));

        // 프론트에서 추가 필터링하지 않음
        const filteredPostsByQuery = allPosts;

        // 커뮤니티 게시글(보드아이디 5가 아닌)
        const communityPosts = filteredPostsByQuery.filter(
          (post) => post.boardId !== 5
        );
        // 중복 제거
        const uniqueCommunityPosts = Array.from(
          new Map(communityPosts.map((post) => [post.id, post])).values()
        );

        // 아트 게시글(보드아이디 5인 것만)
        const artworkPosts: ArtWork[] = filteredPostsByQuery
          .filter((post) => post.boardId === 5)
          .map((post) => ({
            id: post.id,
            title: post.title,
            author: post.author,
            artistProfileImg: post.artistProfileImg,
            contents: post.contents,
            price: 0,
            likes: 0,
            createdAt: post.createdAt,
            imageSrc: post.thumbnail || "",
            userId: post.userId,
          }));
        // 중복 제거
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
                const profileImg =
                  authorArt?.artistProfileImg || "/images/avatar.png";
                const userId = authorArt?.userId;

                return (
                  <div key={index}>
                    <div
                      className="artist-info"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (authorArt?.userId) {
                          navigate(`/worker/${userId}`, {
                            state: { userId: authorArt.userId },
                          });
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
                        <p>일러스트레이터</p>
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
                    <img src={art.imageSrc} alt={art.title} />
                    <div className="artwork-likes">❤️ {art.likes}</div>
                  </div>
                  <div className="artwork-info">
                    <h3>{art.title}</h3>
                    <p className="artwork-author">작가: {art.author}</p>
                    <p className="artwork-price">
                      {art.price.toLocaleString()}원
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
