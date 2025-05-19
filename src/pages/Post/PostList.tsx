import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthHeaders, removeToken, hasToken } from "../../utils/auth";
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
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBoardId, setSelectedBoardId] = useState<number>(
    boardIdMap[location.pathname as keyof typeof boardIdMap] || 1
  );
  const [totalPages, setTotalPages] = useState<number>(1);

  const postsPerPage = 10;

  useEffect(() => {
    if (!hasToken()) {
      console.warn("토큰이 없습니다. 로그인이 필요할 수 있습니다.");
    }
  }, []);

  useEffect(() => {
    const currentBoardId =
      boardIdMap[location.pathname as keyof typeof boardIdMap] || 1;
    setSelectedBoardId(currentBoardId);
  }, [location.pathname]);

  const fetchPosts = () => {
    setLoading(true);
    const pageNumber = Math.max(1, currentPage);
    
    const params = new URLSearchParams({
      page: String(pageNumber),
      size: String(postsPerPage),
      boardNo: String(selectedBoardId),
      type: "t",
      keyword: searchTerm
    });
    
    fetch(`http://localhost:8080/ourlog/post/list?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    .then(async (res) => {
      if (res.status === 403) {
        removeToken();
        navigate('/login');
        throw new Error("인증이 필요합니다.");
      }
      if (!res.ok) {
        const text = await res.text();
        console.error("서버 에러 응답:", text);
        throw new Error(text || "서버 오류");
      }
      return res.json();
    })
    .then((data) => {
      if (!data.pageResultDTO) {
        throw new Error("잘못된 응답 형식");
      }
      const { pageResultDTO } = data;
      
      // 중복 제거를 위한 Map 사용
      const postMap = new Map();
      
      (pageResultDTO.dtoList || []).forEach((item: any) => {
        const postId = item.postId || item.id;
        // 이미 존재하는 postId가 있다면 건너뛰기
        if (!postMap.has(postId)) {
          postMap.set(postId, {
            id: postId,
            title: item.title,
            author: item.userName || item.author || item.writer || '',
            createdAt: item.regDate || item.createdAt || '',
            thumbnail: item.fileName || item.thumbnail || '',
            boardId: item.boardNo || item.boardId,
          });
        }
      });
      
      // Map의 값들을 배열로 변환
      const uniquePosts = Array.from(postMap.values());
      setPosts(uniquePosts);
      setTotalPages(pageResultDTO.totalPage || 1);
    })
    .catch((err) => {
      console.error("게시글 불러오기 실패:", err);
      setPosts([]);
      setTotalPages(1);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedBoardId, currentPage, searchTerm]);

  const handlePostClick = (postId: number) => navigate(`/Post/${postId}`);
  const handleRegisterClick = () => {
    let category = "";
    switch (selectedBoardId) {
      case 1:
        category = "새소식";
        break;
      case 2:
        category = "자유게시판";
        break;
      case 3:
        category = "홍보게시판";
        break;
      case 4:
        category = "요청게시판";
        break;
      default:
        category = "자유게시판";
    }
    navigate(`/Post/Register?category=${encodeURIComponent(category)}`);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

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

  // 페이지네이션 그룹 계산
  const pageGroup = Math.floor((currentPage - 1) / 10);
  const startPage = pageGroup * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>게시글이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr 
                key={`${post.id}-${post.boardId}-${index}`} 
                onClick={() => handlePostClick(post.id)}
              >
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
            ))
          )}
        </tbody>
      </table>

      <div className="post-list-pagination">
        <button
          onClick={() => startPage > 1 && handlePageClick(startPage - 1)}
          disabled={startPage === 1}
          className="post-list-page-btn post-list-arrow-btn"
        >
          &lt;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={`post-list-page-btn${currentPage === number ? ' post-list-page-active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => endPage < totalPages && handlePageClick(endPage + 1)}
          disabled={endPage === totalPages}
          className="post-list-page-btn post-list-arrow-btn"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default PostList;