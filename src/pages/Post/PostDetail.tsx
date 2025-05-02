import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Detail.css";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: number;
  boardId?: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  thumbnail?: string;
  comments: Comment[];
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentContent, setCommentContent] = useState<string>("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // 실제 구현에서는 API 호출로 대체됩니다
        // 테스트용으로 1번 게시물에 대한 더미 데이터를 제공합니다
        if (id === "1") {
          const dummyPost: Post = {
            id: 1,
            title: "지금부터 마카오 환타지아 클라이맥스 썸머...",
            author: "판타지스트",
            content: `지금부터 마카오 환타지아 클라이맥스 썸머 영상 리뷰 시작합니다.
            
이 영상은 마카오에서 펼쳐지는 환상적인 쇼에 대한 내용으로, 화려한 퍼포먼스와 다양한 문화적 요소가 조화롭게 어우러져 있습니다.

특히 무대 설계와 조명 효과는 정말 놀라웠습니다. 마치 다른 세계에 온 것 같은 느낌을 줍니다.

퍼포머들의 기술적인 완성도와 예술성도 매우 뛰어났습니다. 고난이도 기술들을 완벽하게 소화해내는 모습이 인상적이었습니다.

음악과 시각적 효과의 조화도 훌륭했으며, 스토리텔링 방식으로 관객들을 끝까지 몰입시켰습니다.

다음에 마카오를 방문할 기회가 있다면 꼭 직접 관람해보시길 추천합니다.`,
            createdAt: "2023.03.26.14:22",
            thumbnail: "/images/post1.jpg",
            comments: [
              {
                id: 1,
                author: "여행좋아",
                content: "저도 얼마 전에 다녀왔는데 정말 환상적이었어요! 특히 마지막 장면은 압권이었습니다.",
                createdAt: "2023.03.26.15:30"
              },
              {
                id: 2,
                author: "쇼마니아",
                content: "영상만 봐도 대단한데 실제로 보면 어떨지 궁금하네요. 입장료는 얼마인가요?",
                createdAt: "2023.03.26.16:45"
              }
            ]
          };
          setPost(dummyPost);
        } else {
          // 1번 외의 다른 게시물은 준비되지 않았다는 메시지를 표시합니다
          alert("현재 준비된 게시물은 1번 게시물뿐입니다.");
          navigate("/Post");
        }
        setLoading(false);
      } catch (error) {
        console.error("포스트를 불러오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate("/Post");
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    alert("댓글 기능은 현재 개발 중입니다.");
    setCommentContent("");
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <p>게시물을 찾을 수 없습니다.</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="header">
        <h1 style={{ fontFamily: "'Kolker Brush', cursive" }}>OurLog</h1>
      </div>

      <div className="tab-menu">
        <div>새소식</div>
        <div className="active">자유게시판</div>
        <div>홍보게시판</div>
        <div>요청게시판</div>
      </div>

      <div className="post-detail">
        <div className="post-header">
          <h2>{post.title}</h2>
          <div className="post-info">
            <span>작성자: {post.author}</span>
            <span>작성일: {post.createdAt}</span>
          </div>
        </div>

        {post.thumbnail && (
          <div className="post-thumbnail">
            <img src={post.thumbnail} alt={post.title} />
          </div>
        )}

        <div className="post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="post-actions">
          <button onClick={handleGoBack} className="back-button">목록으로</button>
        </div>

        <div className="comments-section">
          <h3>댓글 ({post.comments.length})</h3>
          
          <div className="comments-list">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">{comment.createdAt}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={4}
            ></textarea>
            <button type="submit" className="submit-button">댓글 등록</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;