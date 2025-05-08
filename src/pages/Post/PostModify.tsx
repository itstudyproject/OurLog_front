import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/PostRegiModi.css"; // PostRegister와 동일한 CSS 사용

interface FormData {
  title: string;
  content: string;
  thumbnail: File | null;
  category: string;
}

const dummyData = {
  1: {
    title: "지금부터 마카오 환타지아 클라이맥스 썸머...",
    content: `지금부터 마카오 환타지아 클라이맥스 썸머 영상 리뷰 시작합니다.

이 영상은 마카오에서 펼쳐지는 환상적인 쇼에 대한 내용으로, 화려한 퍼포먼스와 다양한 문화적 요소가 조화롭게 어우러져 있습니다.`,
    thumbnail: "/images/post1.jpg",
    category: "자유게시판",
  },
  // ... 추가 더미 데이터
};

const PostModify = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    thumbnail: null,
    category: "자유게시판",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);

  useEffect(() => {
    if (id && dummyData[id as keyof typeof dummyData]) {
      const data = dummyData[id as keyof typeof dummyData];
      setFormData({
        title: data.title,
        content: data.content,
        thumbnail: null,
        category: data.category,
      });
      setPreviewUrl(data.thumbnail || null);
      setCharacterCount(data.content.length);
    } else {
      alert("수정할 게시글을 찾을 수 없습니다.");
      navigate("/post");
    }
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "content") {
      setCharacterCount(value.length);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newPreviewUrls: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newPreviewUrls.push(reader.result as string);
          if (newPreviewUrls.length === fileArray.length) {
            setPreviewUrls(newPreviewUrls);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveThumbnail = () => {
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, thumbnail: null }));
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      alert("게시물이 삭제되었습니다.");
      navigate("/post");
    }
  };
  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      alert("게시물이 성공적으로 수정되었습니다.");
      navigate(`/post/${id}`);
    } catch (error) {
      alert("게시물 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) {
      navigate(`/post/${id}`);
    }
  };

  return (
    <div className="post-register-wrapper">
      <div className="post-register-container">
        <div className="category-select">
          <label>카테고리:</label>
          <select
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="자유게시판">자유게시판</option>
            <option value="요청게시판">요청게시판</option>
            <option value="홍보게시판">홍보게시판</option>
          </select>
        </div>
      </div>

      <div className="post-register-container">
        <div className="title-input">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목"
          />
        </div>
      </div>

      <div className="post-register-container">
        <div className="content-box">
          <div className="file-upload">
            <button type="button" onClick={handleFileButtonClick}>
              이미지 업로드
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
            {previewUrl && (
              <div className="preview-img-wrapper">
                <img src={previewUrl} alt="미리보기" className="preview-img" />
                <button
                  type="button"
                  className="remove-thumbnail-btn"
                  onClick={handleRemoveThumbnail}
                  aria-label="썸네일 삭제"
                >
                  ×
                </button>
              </div>
            )}
            <p className="file-guide">썸네일로 사용됩니다. (최대 10MB)</p>
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            className="content-textarea"
            rows={8}
          />
          <div className="char-count">{characterCount}자</div>
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={handleCancel}>
          취소
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={handleDelete}
          style={{ background: "#ef4444", color: "#fff" }}
        >
          삭제
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          저장
        </button>
      </div>
    </div>
  );
};

export default PostModify;
