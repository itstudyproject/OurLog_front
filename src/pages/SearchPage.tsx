import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PostList.css"; // 기존 스타일 불러오기 (경로 주의)

// 타입 정의 추가
interface Post {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  thumbnail?: string;
}

interface ArtWork {
  id: number;
  title: string;
  author: string;
  price: number;
  createdAt: string;
  imageSrc: string;
}

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q") || "";
  // 검색 결과를 posts, artworks로 분리해서 받는다고 가정
  const posts: Post[] = location.state?.results?.posts || [];
  const artworks: ArtWork[] = location.state?.results?.artworks || [];

  const handlePostClick = (id: number) => {
    navigate(`/Post/${id}`);
  };
  const handleArtworkClick = (id: number) => {
    navigate(`/Art/${id}`);
  };

  return (
    <div className="container margin-200">
      <div className="board-header">
        <h2>검색 결과</h2>
      </div>

      {/* 작품 검색 결과 */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ color: "#fff", margin: "24px 0 12px 0" }}>
          아트 검색 결과
        </h3>
        {artworks.length === 0 ? (
          <p style={{ color: "#ccc" }}>검색 결과가 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>썸네일</th>
                <th>제목</th>
                <th>작가</th>
                <th>가격</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((art, index) => (
                <tr key={art.id} onClick={() => handleArtworkClick(art.id)}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={art.imageSrc}
                      alt={art.title}
                      className="thumbnail"
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td>{art.title}</td>
                  <td>{art.author}</td>
                  <td>{art.price.toLocaleString()}원</td>
                  <td>{art.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 커뮤니티 검색 결과 */}
      <div>
        <h3 style={{ color: "#fff", margin: "24px 0 12px 0" }}>
          커뮤니티 검색 결과
        </h3>
        {posts.length === 0 ? (
          <p style={{ color: "#ccc" }}>검색 결과가 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>제목</th>
                <th>썸네일</th>
                <th>작성자</th>
                <th>작성일</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={post.id} onClick={() => handlePostClick(post.id)}>
                  <td>{index + 1}</td>
                  <td>{post.title}</td>
                  <td>
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="thumbnail"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <div className="thumbnail">없음</div>
                    )}
                  </td>
                  <td>{post.author}</td>
                  <td>{post.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default SearchPage;
