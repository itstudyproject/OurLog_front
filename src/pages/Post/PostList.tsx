import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthHeaders, removeToken, hasToken } from "../../utils/auth";
import "../../styles/PostList.css";
import { BasePost, PostListResponse } from "../../types/post";

const boardIdMap = {  "/post": 1,  "/post/news": 1,  "/post/free": 2,  "/post/promotion": 3,  "/post/request": 4,};

const PostList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<BasePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBoardId, setSelectedBoardId] = useState<number>(
    boardIdMap[location.pathname as keyof typeof boardIdMap] || 1
  );
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);

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
      const mappedPosts: BasePost[] = (pageResultDTO.dtoList || []).map((item: any) => ({
        post_id: item.postId || item.id,
        boardNo: item.boardNo || item.boardId,
        title: item.title,
        content: item.content || '',
        author: {
          id: item.userId || 0,
          name: item.userName || item.author || item.writer || '',
          profileImage: item.userProfileImage || '/images/default-avatar.png'
        },
        createdAt: item.regDate || item.createdAt || '',
        updatedAt: item.modDate || item.updatedAt || '',
        likes: item.likeCount || 0,
        views: item.viewCount || 0,
        images: item.fileName ? [item.fileName] : [],
        isLiked: item.isLiked || false
      }));
      setPosts(mappedPosts);
      setTotalPages(pageResultDTO.totalPage || 1);
      setTotalPosts(pageResultDTO.total || 0);
    })
    .catch((err) => {
      console.error("게시글 불러오기 실패:", err);
      setPosts([]);
      setTotalPages(1);
      setTotalPosts(0);
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
    setCurrentPage(1);
  };
  const handlePageClick = (page: number) => {
    const validPage = Math.max(1, page);
    setCurrentPage(validPage);
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 게시글 필터링 (boardNo 1~4만)
  const filteredPosts = posts.filter(post => [1,2,3,4].includes(post.boardNo));

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
          {filteredPosts.map((post, index) => (
            <tr key={post.post_id} onClick={() => handlePostClick(post.post_id)}>
              <td>{totalPosts - (currentPage - 1) * postsPerPage - index}</td>
              <td>{post.title}</td>
              <td>
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt="썸네일"
                    className="thumbnail-image"
                  />
                )}
              </td>
              <td>{post.author.name}</td>
              <td>{post.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostList;
