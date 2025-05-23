import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders, hasToken, removeToken } from "../../utils/auth";
import "../../styles/PostDetail.css";
import { PictureDTO } from "../../types/pictureTypes";

interface Comment {
  replyId: number;
  content: string;

  userDTO: { userId: number; nickname: string };
  regDate: string;
  modDate: string;
  isEditing?: boolean;
  editedContent?: string;
}

interface Post {
  postId: number;
  boardNo: number;
  title: string;
  content: string;
  userId: number;
  nickname: string;

  regDate: string;
  modDate: string;
  fileName?: string;
  uuid?: string; // ✅ 추가
  path?: string;
  replyDTOList: Comment[];
  pictureDTOList?: PictureDTO[];
  views: number;
  tag?: string;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<string>("");

  const handleModify = () => {
    navigate(`/post/modify/${post?.postId}`);
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/post/read/${id}`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 403) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("게시글을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setPost({
        ...data.postDTO,
        replyDTOList: data.postDTO.replyDTOList.map((comment: Comment) => ({
          ...comment,
          isEditing: false,
          editedContent: comment.content,
        })),
      });
    } catch (error) {
      console.error("게시글 조회 실패:", error);
      alert("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false); // ✅ 무조건 로딩 상태 해제!
    }
  };

  const increaseViewCount = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/post/increaseViews/${id}`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 403) {
        console.warn("조회수 증가 실패: 인증 필요");
        return;
      }

      if (!response.ok) {
        throw new Error("조회수 증가 실패");
      }
    } catch (error) {
      console.error("조회수 증가 실패:", error);
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      try {
        await increaseViewCount(); // 조회수 실패해도 넘어감
      } catch (e) {
        console.warn("조회수 증가 실패:", e);
      } finally {
        fetchPost(); // 무조건 게시글 불러오기 실행
      }
    };

    if (id) {
      loadPost(); // 반드시 실행
    }
  }, [id]);

  const handleGoBack = () => {
    navigate("/post");
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.userId) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:8080/ourlog/reply/${id}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          content: commentContent,
          postDTO: {
            postId: Number(id),
          },
          userDTO: {
            userId: user.userId,
            nickname: user.nickname || user.email || "익명",
          },
        }),
      });

      if (response.status === 403) {
        alert("댓글 등록 권한이 없습니다. 로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "댓글 등록에 실패했습니다.");
      }

      setCommentContent("");
      fetchPost();
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleModifyComment = (replyId: number) => {
    setPost((prevPost) => {
      if (!prevPost) return null;
      return {
        ...prevPost,
        replyDTOList: prevPost.replyDTOList.map((comment) =>
          comment.replyId === replyId
            ? { ...comment, isEditing: !comment.isEditing }
            : comment
        ),
      };
    });
  };

  const handleDeleteComment = async (replyId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/reply/remove/${replyId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 403) {
        alert("댓글 삭제 권한이 없습니다. 로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "댓글 삭제에 실패했습니다.");
      }

      fetchPost();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // Handler to save the edited comment
  const handleSaveComment = async (replyId: number, content: string) => {
    try {
      // Assuming PUT request to http://localhost:8080/ourlog/reply/update/:replyId
      const response = await fetch(
        `http://localhost:8080/ourlog/reply/update/${replyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            replyId: replyId,
            content: content,
          }),
        }
      );

      if (response.status === 403) {
        alert("댓글 수정 권한이 없습니다. 로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "댓글 수정에 실패했습니다.");
      }

      // Assuming successful update, refetch post to refresh comments list
      alert("댓글이 수정되었습니다.");
      fetchPost();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
      // Optionally revert to original content or stay in editing mode on error
      handleCancelEdit(replyId); // Revert content and exit editing on save error
    }
  };

  // Handler to cancel comment editing
  const handleCancelEdit = (replyId: number) => {
    // Revert edited content and exit editing mode
    setPost((prevPost) => {
      if (!prevPost) return null;
      return {
        ...prevPost,
        replyDTOList: prevPost.replyDTOList.map((comment) =>
          comment.replyId === replyId
            ? { ...comment, isEditing: false, editedContent: comment.content }
            : comment
        ),
      };
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={handleGoBack}>목록으로 돌아가기</button>
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
      <div className="tab-menu">
        <div>새소식</div>
        <div className="active">자유게시판</div>
        <div>홍보게시판</div>
        <div>요청게시판</div>
      </div>

      <div className="post-detail">
        <div className="post-header">
          <div>
            <h2>{post.title}</h2>
            <span>작성자: {post.nickname}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>
              <div>
                <span>작성일: {new Date(post.regDate).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: "10px" }}>
                <span>조회수: {post.views}</span>
              </div>
            </div>
          </div>
        </div>

        {post.fileName && post.uuid && post.path && (
          <div className="post-thumbnail">
            <img
              src={`http://localhost:8080/ourlog/picture/display/${post.path}/s_${post.uuid}_${post.fileName}`}
              alt={post.title}
            />
          </div>
        )}
        {post.pictureDTOList && post.pictureDTOList.length > 0 && (
          <div className="post-image-gallery">
            {post.pictureDTOList.map((pic, index) => (
              <img
                key={index}
                src={`http://localhost:8080/ourlog/picture/display/${pic.path}/${pic.uuid}_${pic.picName}`}
                alt={`이미지 ${index + 1}`}
                className="post-image"
                style={{ maxWidth: "100%", marginBottom: "1rem" }}
              />
            ))}
          </div>
        )}

        <div className="post-content">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.tag && (
          <div className="post-tags">
            {post.tag.split(",").map((tag) => (
              <span
                key={tag}
                className="tag-pill"
                style={{
                  marginRight: "8px",
                  cursor: "pointer",
                  color: "#007bff",
                }}
                onClick={() =>
                  navigate(
                    `/post?type=t&keyword=${encodeURIComponent(tag.trim())}`
                  )
                }
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="post-actions">
          <button onClick={handleGoBack} className="back-button">
            목록으로
          </button>
          <button onClick={handleModify} className="modify-button">
            수정
          </button>
        </div>

        <div className="comments-section">
          <h3>댓글 ({post.replyDTOList?.length || 0})</h3>

          <div className="comments-list">
            {post.replyDTOList?.map((comment) => (
              <div key={comment.replyId} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.userDTO?.nickname}
                  </span>
                  <div
                    className="comment-meta-actions"
                    style={{ textAlign: "right" }}
                  >
                    <div>
                      <span className="comment-date">
                        {new Date(comment.regDate).toLocaleString()}
                      </span>
                    </div>
                    {hasToken() &&
                      JSON.parse(localStorage.getItem("user") || "{}")
                        .userId === comment.userDTO?.userId && (
                        <div>
                          {!comment.isEditing ? (
                            <>
                              <span
                                onClick={() =>
                                  handleModifyComment(comment.replyId)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "white",
                                  textDecoration: "underline",
                                  marginRight: "5px",
                                }}
                              >
                                수정
                              </span>
                              |
                              <span
                                onClick={() =>
                                  handleDeleteComment(comment.replyId)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "white",
                                  textDecoration: "underline",
                                  marginLeft: "5px",
                                }}
                              >
                                삭제
                              </span>
                            </>
                          ) : (
                            <>
                              <span
                                onClick={() =>
                                  handleSaveComment(
                                    comment.replyId,
                                    comment.editedContent || ""
                                  )
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "white",
                                  textDecoration: "underline",
                                  marginRight: "5px",
                                }}
                              >
                                저장
                              </span>
                              |
                              <span
                                onClick={() =>
                                  handleCancelEdit(comment.replyId)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "white",
                                  textDecoration: "underline",
                                  marginLeft: "5px",
                                }}
                              >
                                취소
                              </span>
                            </>
                          )}
                        </div>
                      )}
                  </div>
                </div>
                {comment.isEditing ? (
                  <textarea
                    value={comment.editedContent}
                    onChange={(e) => {
                      setPost((prevPost) => {
                        if (!prevPost) return null;
                        return {
                          ...prevPost,
                          replyDTOList: prevPost.replyDTOList.map((c) =>
                            c.replyId === comment.replyId
                              ? { ...c, editedContent: e.target.value }
                              : c
                          ),
                        };
                      });
                    }}
                    className="edit-comment-textarea"
                    rows={3}
                  />
                ) : (
                  <div className="comment-content">{comment.content}</div>
                )}
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
            <button type="submit" className="submit-button">
              댓글 등록
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
