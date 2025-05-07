import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Register.css";

interface FormData {
  title: string;
  content: string;
  thumbnail: File | null;
  categoryType: "그림 게시판" | "글 게시판";
  category: string;
  // 추가: 그림게시판용
  description?: string;
  auction?: {
    startPrice: number | "";
    instantPrice: number | "";
    startDate: string;
    endDate: string;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    thumbnail: null,
    categoryType: "글 게시판",
    category: "자유게시판",
    description: "",
    auction: {
      startPrice: "",
      instantPrice: "",
      startDate: "",
      endDate: "",
    },
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);

  // 기존 핸들러 유지
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

  // 그림게시판용 핸들러
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleAuctionChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      auction: {
        ...prev.auction,
        [field]: value,
      },
    }));
  };

  const handleCategoryTypeChange = (type: "그림 게시판" | "글 게시판") => {
    setFormData((prev) => ({
      ...prev,
      categoryType: type,
      category: type === "그림 게시판" ? "그림" : "자유게시판",
      // 그림게시판 전환 시 내용 초기화
      content: "",
      description: "",
      auction: {
        startPrice: "",
        instantPrice: "",
        startDate: "",
        endDate: "",
      },
    }));
    setCharacterCount(0);
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
    if (!formData.title) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (formData.categoryType === "글 게시판" && !formData.content) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (formData.categoryType === "그림 게시판") {
      if (!formData.description) {
        alert("작품설명을 입력해주세요.");
        return;
      }
      if (
        !formData.auction?.startPrice ||
        !formData.auction?.startDate ||
        !formData.auction?.endDate
      ) {
        alert("경매 정보를 모두 입력해주세요.");
        return;
      }
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
            <button type="button" onClick={handleFileButtonClick}>이미지 업로드</button>
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

          {/* 글 게시판: 기존 내용 입력란 */}
          {formData.categoryType === "글 게시판" && (
            <>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="내용을 입력하세요"
              />
              <div className="char-count">{characterCount}자</div>
            </>
          )}

          {/* 그림 게시판: 작품설명 + 경매설정 */}
          {formData.categoryType === "그림 게시판" && (
            <div className="artbid-section">
              <label className="artbid-label">작품설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="작품에 대한 설명을 입력하세요."
                className="artbid-textarea"
                rows={4}
              />
              <div className="auction-grid">
                <div className="auction-field">
                  <label className="artbid-label">경매 시작가 (₩)</label>
                  <input
                    type="number"
                    min={0}
                    className="artbid-input"
                    value={formData.auction?.startPrice}
                    onChange={e =>
                      handleAuctionChange(
                        "startPrice",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="예: 10000"
                    required
                  />
                </div>
                <div className="auction-field">
                  <label className="artbid-label">즉시구매가 (₩, 선택)</label>
                  <input
                    type="number"
                    min={0}
                    className="artbid-input"
                    value={formData.auction?.instantPrice}
                    onChange={e =>
                      handleAuctionChange(
                        "instantPrice",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="예: 50000"
                  />
                </div>
                <div className="auction-field">
                  <label className="artbid-label">경매 시작일</label>
                  <input
                    type="datetime-local"
                    className="artbid-input"
                    value={formData.auction?.startDate}
                    onChange={e =>
                      handleAuctionChange("startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="auction-field">
                  <label className="artbid-label">경매 종료일</label>
                  <input
                    type="datetime-local"
                    className="artbid-input"
                    value={formData.auction?.endDate}
                    onChange={e =>
                      handleAuctionChange("endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={handleCancel}>뒤로 가기</button>
        <button type="button" onClick={handleTemporarySave} disabled={isSubmitting}>
          임시저장
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          등록
        </button>
      </div>
    </div>
  );
};

export default Register;