import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/PostList.css";

interface Post {
  id: number;
  boardId?: number;
  title: string;
  author: string;
  createdAt: string;
  thumbnail?: string;
}

const boardIdMap = {
  "/post": 1,
  "/post/news": 1,
  "/post/free": 2,
  "/post/promotion": 3,
  "/post/request": 4,
};

const PostList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBoardId, setSelectedBoardId] = useState<number>(boardIdMap[location.pathname as keyof typeof boardIdMap] || 1);

  const postsPerPage = 10;

  useEffect(() => {
    const currentBoardId = boardIdMap[location.pathname as keyof typeof boardIdMap] || 1;
    setSelectedBoardId(currentBoardId);
  }, [location.pathname]);

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
            boardId: 1,
          },
          {
            id: 2,
            title: "소와미래식혜",
            author: "애유기냉동식",
            createdAt: "2023.03.26.14:21",
            thumbnail: "/images/post2.jpg",
            boardId: 2,
          },
          {
            id: 3,
            title: "두 음절로 된브랜드 챌린지일까나",
            author: "시각예술",
            createdAt: "2023.03.26.14:21",
            thumbnail: "/images/post3.jpg",
            boardId: 3,
          },
          {
            id: 4,
            title: "네 번째 포스트",
            author: "작가4",
            createdAt: "2023.03.26.14:20",
            thumbnail: "/images/post4.jpg",
            boardId: 4,
          },
          {
            id: 5,
            title: "다섯 번째 포스트",
            author: "작가5",
            createdAt: "2023.03.26.14:20",
            thumbnail: "/images/post4.jpg",
            boardId: 5,
          },
          {
            id: 6,
            title: "여섯 번째 포스트",
            author: "작가6",
            createdAt: "2023.03.26.14:19",
            thumbnail: "/images/post5.jpg",
            boardId: 6,
          },
          {
            id: 7,
            title: "일곱 번째 포스트",
            author: "작가7",
            createdAt: "2023.03.26.14:18",
            thumbnail: "/images/post6.jpg",
            boardId: 7,
          },
          {
            id: 8,
            title: "여덟 번째 포스트",
            author: "작가8",
            createdAt: "2023.03.26.14:17",
            thumbnail: "/images/post8.jpg",
            boardId: 8,
          },
          {
            id: 9,
            title: "아홉 번째 포스트",
            author: "작가9",
            createdAt: "2023.03.26.14:16",
            thumbnail: "/images/post9.jpg",
            boardId: 9,
          },
          {
            id: 10,
            title: "열 번째 포스트",
            author: "작가10",
            createdAt: "2023.03.26.14:15",
            thumbnail: "/images/post10.jpg",
            boardId: 10,
          },
          {
            id: 11,
            title: "열한 번째 포스트",
            author: "작가11",
            createdAt: "2023.03.26.14:14",
            thumbnail: "/images/post11.jpg",
            boardId: 11,
          },
          {
            id: 12,
            title: "열두 번째 포스트",
            author: "작가12",
            createdAt: "2023.03.26.14:13",
            thumbnail: "/images/post12.jpg",
            boardId: 12,
          },
          {
            id: 13,
            title: "열세 번째 포스트",
            author: "작가2",
            createdAt: "2023.03.26.14:11",
            thumbnail: "/images/post15.jpg",
            boardId: 13,
          },
          {
            id: 14,
            title: "열네 번째 포스트",
            author: "작가17",
            createdAt: "2023.03.26.14:11",
            thumbnail: "/images/post16.jpg",
            boardId: 14,
          },
        ];
        setPosts(dummyPosts);
        setLoading(false);
      } catch (error) {
        console.error("포스트를 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (postId: number) => navigate(`/Post/${postId}`);
  const handleRegisterClick = () => navigate("/Post/Register");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("검색어:", searchTerm);
  };
  const handlePageClick = (page: number) => setCurrentPage(page);

  const handleTabClick = (boardId: number) => {
    setSelectedBoardId(boardId);
    setCurrentPage(1);
    switch (boardId) {
      case 1:
        navigate("/post/news");
        break;
      case 2:
        navigate("/post/free");
        break;
      case 3:
        navigate("/post/promotion");
        break;
      case 4:
        navigate("/post/request");
        break;
      default:
        navigate("/post");
    }
  };

  const filteredPosts = posts
    .filter((post) => post.boardId === selectedBoardId)
    .filter((post) => post.title.includes(searchTerm));

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl px-4 mx-auto">
      <div className="tab-menu">
        <div
          className={selectedBoardId === 1 ? "active" : ""}
          onClick={() => handleTabClick(1)}
        >
          새소식
        </div>
        <div
          className={selectedBoardId === 2 ? "active" : ""}
          onClick={() => handleTabClick(2)}
        >
          자유게시판
        </div>
        <div
          className={selectedBoardId === 3 ? "active" : ""}
          onClick={() => handleTabClick(3)}
        >
          홍보게시판
        </div>
        <div
          className={selectedBoardId === 4 ? "active" : ""}
          onClick={() => handleTabClick(4)}
        >
          요청게시판
        </div>
      </div>

      <div className="board-header">
        <h2>
          {
            {
              1: "새소식",
              2: "자유게시판",
              3: "홍보게시판",
              4: "요청게시판",
            }[selectedBoardId]
          }
        </h2>

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
             게시글 등록 
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
