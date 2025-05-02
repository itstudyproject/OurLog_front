import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  title: string;
  content: string;
  thumbnail: File | null;
  categoryType: "그림 게시판" | "글 게시판";
  category: string;
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
    <div className="w-full min-h-screen pb-20 text-gray-300 bg-gray-900">
      {/* 카테고리 선택 */}
      <div className="max-w-[1200px] mx-auto px-5 mt-4">
        <div className="flex items-center mb-3 space-x-4">
          <label className="text-gray-400">게시판:</label>
          <select
            value={formData.categoryType}
            onChange={(e) =>
              handleCategoryTypeChange(
                e.target.value as "그림 게시판" | "글 게시판"
              )
            }
            className="px-2 py-1 text-gray-200 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="그림 게시판">그림 게시판</option>
            <option value="글 게시판">글 게시판</option>
          </select>

          {formData.categoryType === "글 게시판" && (
            <>
              <label className="text-gray-400">카테고리:</label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-2 py-1 text-gray-200 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="자유게시판">자유게시판</option>
                <option value="요청게시판">요청게시판</option>
                <option value="홍보게시판">홍보게시판</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* 제목 입력 */}
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="py-2 border-b border-gray-800">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목"
            className="w-full py-2 text-lg text-gray-200 placeholder-gray-500 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* 내용 입력 */}
      <div className="max-w-[1200px] mx-auto px-5 mt-4">
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-md">
          <div className="mb-4">
            <button
              onClick={handleFileButtonClick}
              className="flex items-center px-4 py-2 mb-2 text-white bg-gray-700 border border-gray-600 rounded hover:bg-gray-600"
            >
              이미지 업로드
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
            </button>
            {previewUrl && (
              <div className="max-w-sm">
                <img src={previewUrl} alt="미리보기" className="rounded-md" />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              썸네일로 사용됩니다. (최대 10MB)
            </p>
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            className="w-full p-3 text-gray-300 bg-gray-900 rounded outline-none h-[450px] resize-none"
          />
          <div className="mt-1 text-sm text-right text-gray-500">
            {characterCount}자
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700"
        >
          뒤로 가기
        </button>
        <button
          onClick={handleTemporarySave}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-indigo-800 border border-indigo-900 rounded-full hover:bg-indigo-700"
        >
          임시저장
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-700 border border-blue-800 rounded-full hover:bg-blue-600"
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default Register;
