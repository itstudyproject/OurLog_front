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
}

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParam = new URLSearchParams(location.search).get("query");
  const stateParam = location.state?.q;
  const query = searchParam || stateParam || "";
  const lowerQuery = query.trim().toLowerCase();

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
      `http://localhost:8080/ourlog/post/list?keyword=${encodeURIComponent(
        lowerQuery
      )}&page=1`
    )
      .then((res) => res.json())
      .then((data) => {
        // 서버에서 posts와 artworks를 모두 내려준다고 가정
        setPosts(data.posts || []);
        setArtworks(data.artworks || []); // artworks가 없다면 빈 배열로 처리
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
        setPosts([]);
        setArtworks([]);
      })
      .finally(() => setLoading(false));
  }, [lowerQuery]);

  // 서버에서 이미 필터링된 상태라면 그대로 사용
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

                return (
                  <div key={index}>
                    <div className="artist-info">
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

          {filteredArtworks.length > 0 ? (
            <div className="popular-artworks">
              {filteredArtworks.map((art) => (
                <div key={art.id} className="artwork-card">
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
          ) : (
            <p>아트 작품이 없습니다.</p>
          )}

          <div style={{ marginBottom: "100px" }}>
            <div className="section-title-search">
              <h2>커뮤니티 ({filteredPosts.length})</h2>
            </div>

            {filteredPosts.length > 0 ? (
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
            ) : (
              <p>게시물이 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
