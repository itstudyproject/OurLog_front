import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PostList.css";
import "../styles/ArtList.css";

interface ArtWork {
  id: number;
  title: string;
  author: string;
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
  contents?: string;
  createdAt: string;
  thumbnail?: string;
  category?: string;
  boardId?: number;
}

const dummyArtworks: ArtWork[] = [
  {
    id: 1,
    title: "작품 제목 1",
    author: "작가1",
    contents: "파스타를 주제로 한 일러스트입니다.",
    price: 30000,
    likes: 128,
    createdAt: "2023.05.15",
    imageSrc: "/images/파스타.jpg",
  },
  {
    id: 2,
    title: "풍경화",
    author: "작가2",
    contents: "자연 풍경을 담은 평화로운 그림입니다.",
    price: 40000,
    likes: 80,
    createdAt: "2023.04.12",
    imageSrc: "/images/풍경.jpg",
  },
];

const dummyPosts: Post[] = [
  {
    id: 1,
    title: "지금부터 마카오 환타지아 클라이맥스 썸머...",
    author: "판타지스트",
    contents: "여름 시즌 이벤트 소식입니다.",
    createdAt: "2023.03.26.14:22",
    thumbnail: "/images/post1.jpg",
    category: "자유게시판",
    boardId: 2,
  },
  {
    id: 2,
    title: "파스타 맛집 추천",
    author: "맛집러버",
    contents: "정말 맛있는 파스타 가게 추천합니다!",
    createdAt: "2023.04.01.10:00",
    thumbnail: "/images/post2.jpg",
    category: "자유게시판",
    boardId: 2,
  },
  {
    id: 3,
    title: "홍보게시판 파스타 이벤트",
    author: "홍보왕",
    contents: "홍보용 파스타 이벤트 진행합니다.",
    createdAt: "2023.04.02.09:30",
    thumbnail: "/images/post3.jpg",
    category: "홍보게시판",
    boardId: 3,
  },
];

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParam = new URLSearchParams(location.search).get("query");
  const stateParam = location.state?.q;
  const query = searchParam || stateParam || "";
  const lowerQuery = query.trim().toLowerCase();

  const filteredArtworks =
    lowerQuery === ""
      ? []
      : dummyArtworks.filter(
          (art) =>
            art.title.toLowerCase().includes(lowerQuery) ||
            art.author.toLowerCase().includes(lowerQuery) ||
            (art.contents?.toLowerCase().includes(lowerQuery) ?? false)
        );

  const filteredPosts =
    lowerQuery === ""
      ? []
      : dummyPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.author.toLowerCase().includes(lowerQuery) ||
            (post.contents?.toLowerCase().includes(lowerQuery) ?? false)
        );

  const uniqueAuthors = Array.from(
    new Set(filteredArtworks.map((art) => art.author))
  ).length;

  return (
    <div className="container">
      <div className="section-title">
        <h2>"{query}"에 대한 검색 결과</h2>
        <div className="line"></div>
      </div>

      {query.trim() === "" ? (
        <p className="main-search">검색어를 입력해주세요.</p>
      ) : (
        <>
          <div className="section-title">
            <h2>작가 ({uniqueAuthors})</h2>
          </div>

          {uniqueAuthors > 0 && (
            <div className="author-list">
              {Array.from(
                new Set(filteredArtworks.map((art) => art.author))
              ).map((author, index) => (
                <div key={index} className="main-search">
                  {author}
                </div>
              ))}
            </div>
          )}

          <div className="section-title">
            <h2>아트 ({filteredArtworks.length})</h2>
          </div>

          {filteredArtworks.length > 0 && (
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
          )}

          <div style={{ marginBottom: "100px" }}>
            <div className="section-title">
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
