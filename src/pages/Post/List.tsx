import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  // 페이지당 게시글 수를 10개로 설정
  const postsPerPage = 10;

  useEffect(() => {
    // API에서 포스트 데이터를 가져오는 함수
    const fetchPosts = async () => {
      try {
        // 임시 데이터 - 실제로는 API 호출로 대체
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

  // 현재 페이지에 표시할 게시글 계산
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
    // 실제로는 검색 API 호출
    console.log("검색어:", searchTerm);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    // 실제로는 해당 페이지 데이터 호출
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-gray-900">
        <p className="text-gray-300">로딩 중...</p>
      </div>
    );
  }

  // 페이지네이션 생성
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="w-full min-h-screen text-gray-300 bg-gray-900">
      {/* 로고 및 메뉴 영역 - 실제로는 Header 컴포넌트에서 처리될 수 있음 */}
      <div className="py-4 text-center border-b border-gray-800">
        <div
          className="text-3xl font-bold text-gray-100"
          style={{ fontFamily: "'Kolker Brush', cursive" }}
        >
          OurLog
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5">
        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-800">
          <div className="px-6 py-3 transition-colors duration-200 cursor-pointer hover:bg-gray-800 hover:text-gray-100">
            새소식
          </div>
          <div className="px-6 py-3 text-gray-100 bg-gray-800 cursor-pointer">
            자유게시판
          </div>
          <div className="px-6 py-3 transition-colors duration-200 cursor-pointer hover:bg-gray-800 hover:text-gray-100">
            홍보게시판
          </div>
          <div className="px-6 py-3 transition-colors duration-200 cursor-pointer hover:bg-gray-800 hover:text-gray-100">
            요청게시판
          </div>
        </div>

        {/* 게시판 제목 및 검색 */}
        <div className="flex items-center justify-between py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-100">자유게시판</h2>
          <div className="flex items-center">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="키워드로 검색해주세요"
                className="px-3 py-1 mr-2 text-gray-200 placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
              <button
                type="submit"
                className="p-1 text-gray-400 transition-colors duration-200 bg-gray-800 rounded-full hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </form>
            <div className="ml-4">
              <button
                onClick={handleRegisterClick}
                className="px-4 py-1 text-black transition duration-200 bg-blue-700 border border-blue-800 rounded-md hover:bg-blue-600"
              >
                게시글/작품 등록
              </button>
            </div>
          </div>
        </div>

        {/* 게시물 테이블 */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="w-16 py-3 text-center text-gray-400">No.</th>
              <th className="py-3 text-left text-gray-400">제목</th>
              <th className="w-20 py-3 text-center text-gray-400">썸네일</th>
              <th className="w-24 py-3 text-center text-gray-400">작성자</th>
              <th className="py-3 text-center text-gray-400 w-36">작성일자</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((post) => (
              <tr
                key={post.id}
                className="transition duration-150 border-b border-gray-800 cursor-pointer hover:bg-gray-800"
                onClick={() => handlePostClick(post.id)}
              >
                <td className="py-4 text-center text-gray-500">{post.id}</td>
                <td className="py-4 text-left text-gray-300">{post.title}</td>
                <td className="py-4 text-center">
                  {post.thumbnail ? (
                    <div className="w-12 h-12 mx-auto overflow-hidden border border-gray-700 rounded-md">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-gray-600 bg-gray-800 border border-gray-700 rounded-md">
                      <span>없음</span>
                    </div>
                  )}
                </td>
                <td className="py-4 text-center text-gray-400">
                  {post.author}
                </td>
                <td className="py-4 text-center text-gray-500">
                  {post.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center py-6">
          <button
            className="px-3 py-1 mx-1 text-gray-400 bg-gray-800 border border-gray-700 rounded-md hover:text-white disabled:text-gray-700 disabled:bg-gray-900 disabled:border-gray-800"
            onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageClick(number)}
              className={`px-3 py-1 mx-1 rounded-md border ${
                currentPage === number
                  ? "bg-blue-700 text-white border-blue-800"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
              } transition-colors duration-200`}
            >
              {number}
            </button>
          ))}
          <button
            className="px-3 py-1 mx-1 text-gray-400 bg-gray-800 border border-gray-700 rounded-md hover:text-white disabled:text-gray-700 disabled:bg-gray-900 disabled:border-gray-800"
            onClick={() =>
              currentPage < totalPages && handlePageClick(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostList;
