import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/PostRegister.css";

interface FormData {
  title: string;
  content: string;
  thumbnail: File | null;
  categoryType: "그림 게시판" | "글 게시판";
  category: string;
}

const PostRegister = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    thumbnail: null,
    categoryType: "글 게시판",
    category: "자유게시판",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);

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

  const handleCategoryTypeChange = (type: "그림 게시판" | "글 게시판") => {
    setFormData((prev) => ({
      ...prev,
      categoryType: type,
      category: type === "그림 게시판" ? "그림" : "자유게시판",
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("제출할 데이터:", formData);
      alert("게시물이 성공적으로 등록되었습니다.");
      navigate("/post");
    } catch (error) {
      console.error("게시물 등록 중 오류:", error);
      alert("게시물 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?")) {
      navigate("/post");
    }
  };

  const handleTemporarySave = () => {
    localStorage.setItem("draftPost", JSON.stringify(formData));
    alert("임시저장 되었습니다.");
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="category-select">
          <label>게시판:</label>
          <select
            value={formData.categoryType}
            onChange={(e) =>
              handleCategoryTypeChange(
                e.target.value as "그림 게시판" | "글 게시판"
              )
            }
          >
            <option value="그림 게시판">그림 게시판</option>
            <option value="글 게시판">글 게시판</option>
          </select>

          {formData.categoryType === "글 게시판" && (
            <>
              <label>카테고리:</label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="자유게시판">자유게시판</option>
                <option value="요청게시판">요청게시판</option>
                <option value="홍보게시판">홍보게시판</option>
              </select>
            </>
          )}
        </div>
      </div>

      <div className="register-container">
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

      <div className="register-container">
        <div className="content-box">
          <div className="file-upload">
            <button onClick={handleFileButtonClick}>이미지 업로드</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
            />
            {previewUrl && (
              <div className="preview-img">
                <img src={previewUrl} alt="미리보기" />
              </div>
            )}
            <p className="file-guide">썸네일로 사용됩니다. (최대 10MB)</p>
          </div>

          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
          />
          <div className="char-count">{characterCount}자</div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleCancel}>뒤로 가기</button>
        <button onClick={handleTemporarySave} disabled={isSubmitting}>
          임시저장
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          등록
        </button>
      </div>
    </div>
  );
};

export default PostRegister;
