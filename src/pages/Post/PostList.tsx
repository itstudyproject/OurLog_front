import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("t");

  const [selectedBoardId, setSelectedBoardId] = useState<number>(
    boardIdMap[location.pathname as keyof typeof boardIdMap] || 1
  );
  const [totalPages, setTotalPages] = useState<number>(1);
  const postsPerPage = 10;

  // ✅ 토큰 확인 및 localStorage에서 저장된 페이지 번호 불러오기
  useEffect(() => {
    if (!hasToken()) {
      console.warn("토큰이 없습니다. 로그인이 필요할 수 있습니다.");
    }

    // localStorage에서 저장된 페이지 번호 확인 (ArtList와 다른 키 사용)
    const savedPage = localStorage.getItem('postListPage');
    if (savedPage) {
      const pageNumber = parseInt(savedPage, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1) {
        setCurrentPage(pageNumber); // 저장된 페이지로 상태 업데이트
      }
      localStorage.removeItem('postListPage'); // 사용 후 삭제
    }
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // ✅ pathname이 바뀌면 boardId 재설정
  useEffect(() => {
    const currentBoardId =
      boardIdMap[location.pathname as keyof typeof boardIdMap] || 1;
    setSelectedBoardId(currentBoardId);
  }, [location.pathname]);

  // ✅ URL에서 검색 파라미터 추출 (ex. ?keyword=고양이)
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    if (keywordFromUrl) {
      setSearchInput(keywordFromUrl);
      setSearchTerm(keywordFromUrl);
      setCurrentPage(1);
    }
  }, [location.search]);

  // ✅ 게시글 목록 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const pageNumber = Math.max(1, currentPage);

      const params = new URLSearchParams({
        page: String(pageNumber),
        size: String(postsPerPage),
        boardNo: String(selectedBoardId),
        type: "all",
        keyword: searchTerm,
      });

      try {
        const res = await fetch(
          `http://localhost:8080/ourlog/post/list?${params.toString()}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (res.status === 403) {
          removeToken();
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "서버 오류");
        }

        const data = await res.json();
        const dtoList = data.pageResultDTO?.dtoList || [];

        const postMap = new Map();
        dtoList.forEach((item: any) => {
          const postId = item.postId || item.id;
          // 썸네일 이미지 정보 찾기
          const thumbnailPic = item.pictureDTOList?.find(
            (pic: any) => pic.uuid === item.fileName
          );

          if (!postMap.has(postId)) {
            postMap.set(postId, {
              id: postId,
              title: item.title,
              author: item.nickname || "익명", // nickname 필드 사용
              createdAt: item.regDate || item.createdAt || "",
              thumbnail:
                thumbnailPic && thumbnailPic.originImagePath
                  ? `http://localhost:8080/ourlog/picture/display/${thumbnailPic.originImagePath}`
                  : "",
              boardId: item.boardNo || item.boardId,
            });
          }
        });

        setPosts(Array.from(postMap.values()));
        setTotalPages(data.pageResultDTO?.totalPage || 1);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedBoardId, currentPage, searchTerm, navigate]); // currentPage와 navigate를 의존성 배열에 추가

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // 검색 시에는 1페이지로 이동
  };

  const handlePostClick = (postId: number) => {
    // 상세 페이지로 이동하기 전에 현재 페이지 번호를 localStorage에 저장
    localStorage.setItem('postListPage', String(currentPage));
    navigate(`/Post/${postId}`);
  };

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

  const handleTabClick = (boardId: number) => {
    setSelectedBoardId(boardId);
    setCurrentPage(1);
    const route = {
      1: "/post/news",
      2: "/post/free",
      3: "/post/promotion",
      4: "/post/request",
    }[boardId];
    navigate(route || "/post");
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // 페이지네이션 계산
  const pageGroup = Math.floor((currentPage - 1) / 10);
  const startPage = pageGroup * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

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
        {["새소식", "자유게시판", "홍보게시판", "요청게시판"].map(
          (label, i) => (
            <div
              key={i}
              className={selectedBoardId === i + 1 ? "active" : ""}
              onClick={() => handleTabClick(i + 1)}
            >
              {label}
            </div>
          )
        )}
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
            {/* 기존 검색 input */}
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
        <colgroup>
          <col style={{ width: "60px" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th style={{ textAlign: "left" }}>제목</th>
            <th>썸네일</th>
            <th>작성자</th>
            <th style={{ minWidth: "100px" }}>작성일자</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                게시글이 없습니다.
              </td>
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
                    <div className="thumbnail" style={{ fontSize: 0 }}>
                      없음
                    </div>
                  )}
                </td>
                <td>{post.author}</td>
                <td>{formatDate(post.createdAt)}</td>
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
            className={`post-list-page-btn${
              currentPage === number ? " post-list-page-active" : ""
            }`}
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
