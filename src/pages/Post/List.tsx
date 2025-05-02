import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/List.css";

interface Post {
  id: number;
  boardId?: number;
  title: string;
  author: string;
  createdAt: string;
  thumbnail?: string;
}

const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dummyPosts: Post[] = [
          {
            id: 1,
            title: "지금부터 마카오 환타지아 클라이맥스 썸머...",
            author: "판타지스트",
            createdAt: "2023.03.26.14:22",
            thumbnail: "/images/post1.jpg",
          },
          {
            id: 2,
            title: "소와미래식혜",
            author: "애유기냉동식",
            createdAt: "2023.03.26.14:21",
            thumbnail: "/images/post2.jpg",
          },
          {
            id: 3,
            title: "두 음절로 된브랜드 챌린지일까나",
            author: "시각예술",
            createdAt: "2023.03.26.14:21",
            thumbnail: "/images/post3.jpg",
          },
          {
            id: 4,
            title: "네 번째 포스트",
            author: "작가4",
            createdAt: "2023.03.26.14:20",
            thumbnail: "/images/post4.jpg",
          },
          {
            id: 5,
            title: "다섯 번째 포스트",
            author: "작가5",
            createdAt: "2023.03.26.14:20",
            thumbnail: "/images/post4.jpg",
          },
          {
            id: 6,
            title: "여섯 번째 포스트",
            author: "작가6",
            createdAt: "2023.03.26.14:19",
            thumbnail: "/images/post5.jpg",
          },
          {
            id: 7,
            title: "일곱 번째 포스트",
            author: "작가7",
            createdAt: "2023.03.26.14:18",
          },
          {
            id: 8,
            title: "여덟 번째 포스트",
            author: "작가8",
            createdAt: "2023.03.26.14:17",
            thumbnail: "/images/post8.jpg",
          },
          {
            id: 9,
            title: "아홉 번째 포스트",
            author: "작가9",
            createdAt: "2023.03.26.14:16",
          },
          {
            id: 10,
            title: "열 번째 포스트",
            author: "작가10",
            createdAt: "2023.03.26.14:15",
            thumbnail: "/images/post10.jpg",
          },
          {
            id: 11,
            title: "열한 번째 포스트",
            author: "작가11",
            createdAt: "2023.03.26.14:14",
          },
          {
            id: 12,
            title: "열두 번째 포스트",
            author: "작가12",
            createdAt: "2023.03.26.14:13",
            thumbnail: "/images/post12.jpg",
          },
          {
            id: 13,
            title: "열세 번째 포스트",
            author: "작가2",
            createdAt: "2023.03.26.14:11",
            thumbnail: "/images/post15.jpg",
          },
          {
            id: 14,
            title: "열네 번째 포스트",
            author: "작가17",
            createdAt: "2023.03.26.14:11",
            thumbnail: "/images/post16.jpg",
          },
        ]; // 생략: 기존 더미데이터 그대로 유지
        setPosts(dummyPosts);
        setLoading(false);
      } catch (error) {
        console.error("포스트를 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePostClick = (postId: number) => {
    navigate(`/Post/${postId}`);
  };

  const handleRegisterClick = () => {
    navigate("/Post/Register");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("검색어:", searchTerm);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const pageNumbers: number[] = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="container">
      <div className="tab-menu">
        <div>새소식</div>
        <div className="active">자유게시판</div>
        <div>홍보게시판</div>
        <div>요청게시판</div>
      </div>

      <div className="board-header">
        <h2>자유게시판</h2>
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="키워드로 검색해주세요"
            />
            <button type="submit" className="search-button">
              <img
                src="/images/Search.png"
                alt="검색"
                className="search-icon"
              />
            </button>
          </form>
          <button onClick={handleRegisterClick} className="register-button">
            게시글/작품 등록
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
            <th>썸네일</th>
            <th>작성자</th>
            <th>작성일자</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id} onClick={() => handlePostClick(post.id)}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="thumbnail"
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

      <div className="pagination">
        <button
          onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() =>
            currentPage < totalPages && handlePageClick(currentPage + 1)
          }
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default PostList;
