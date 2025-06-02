import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../styles/PostRegiModi.css";

interface ImageFile {
  file: File | null;
  preview: string;
  id: string; // 서버에 저장된 파일명
  picId: string;
  uuid: string;
  picName: string;
  path: string;
}

interface FormData {
  title: string;
  content: string;
  images: ImageFile[];
  fileName: string | null;
  category: string;
}

const PostRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("category") || "자유게시판";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    images: [],
    fileName: null,
    category: initialCategory === "새소식" ? "자유게시판" : initialCategory,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("경매 정보 없음");

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

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드 가능합니다.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "파일 크기는 10MB 이하여야 합니다.";
    }
    return null;
  };

  // 이미지 업로드 API 호출
  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("files", file);
    const token = localStorage.getItem('token');
    const res = await fetch("http://localhost:8080/ourlog/picture/upload", {
      method: "POST",
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: fd
    });
    if (!res.ok) throw new Error("이미지 업로드 실패");
    const data = await res.json();
    return data[0];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - formData.images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      const processedImages = await Promise.all(
        filesToProcess.map(async (file) => {
          const error = validateImage(file);
          if (error) throw new Error(error);

          const uploaded = await uploadImage(file);
          return {
            file: null,
            preview: `http://localhost:8080/ourlog/picture/display/${uploaded.path}/${uploaded.uuid}_${uploaded.picName}`,
            id: uploaded.uuid,
            picId: uploaded.picId,
            uuid: uploaded.uuid,
            picName: uploaded.picName,
            path: uploaded.path,
          };
        })
      );

      const newImages = [...formData.images, ...processedImages];

      setFormData((prev) => ({
        ...prev,
        images: newImages,
        fileName:
          prev.fileName || (newImages.length > 0 ? newImages[0].id : null),
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "이미지 업로드 오류");
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (id: string) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((img) => img.id !== id);
      return {
        ...prev,
        images: newImages,
        fileName:
          prev.fileName === id
            ? newImages.length > 0
              ? newImages[0].id
              : null
            : prev.fileName,
      };
    });
  };

  const handleThumbnailSelect = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      fileName: id,
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData((prev) => ({
      ...prev,
      images: items,
    }));
  };

  const handleContentImageDragEnd = (result: any) => {
    if (!result.destination) return;

    const content = formData.content;
    const lines = content.split("\n");
    const imageLines = lines.filter((line) => line.startsWith("!["));
    const [movedImage] = imageLines.splice(result.source.index, 1);
    imageLines.splice(result.destination.index, 0, movedImage);

    const newContent = lines
      .map((line) => {
        if (line.startsWith("![")) {
          return imageLines.shift() || line;
        }
        return line;
      })
      .join("\n");

    setFormData((prev) => ({
      ...prev,
      content: newContent,
    }));
  };

  const getBoardNo = (category: string): number => {
    switch (category) {
      case "새소식":
        return 1;
      case "자유게시판":
        return 2;
      case "홍보게시판":
        return 3;
      case "요청게시판":
        return 4;
      default:
        return 2;
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (removeTag: string) => {
    setTags(tags.filter((tag) => tag !== removeTag));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.userId) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const postDTO = {
        title: formData.title,
        content: formData.content,
        boardNo: getBoardNo(formData.category),
        fileName: formData.fileName,
        pictureDTOList: formData.images.map((img) => ({
          picId: img.picId,
          uuid: img.uuid,
          picName: img.picName,
          path: img.path,
          downloads: 0,
          tag: null,
          originImagePath: `${img.path}/${img.uuid}_${img.picName}`,
          thumbnailImagePath: `${img.path}/s_${img.uuid}_${img.picName}`,
          resizedImagePath: `${img.path}/r_${img.uuid}_${img.picName}`
        })),
        userDTO: {
          userId: user.userId,
          nickname: user.nickname || user.email || "익명"
        },
        tag: tags.join(','),
        views: 0,
        followers: 0,
        downloads: 0,
        replyCnt: 0
      };

      console.log("전송할 데이터:", postDTO);

      const response = await fetch("http://localhost:8080/ourlog/post/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postDTO),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "게시물 등록에 실패했습니다.");
      }

      const result = await response.json();
      console.log("등록 결과:", result);

      alert("게시물이 성공적으로 등록되었습니다.");
      navigate("/post");
    } catch (error) {
      console.error("에러 발생:", error);
      alert(error instanceof Error ? error.message : "게시물 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?")) {
      navigate("/post");
    }
  };

  const handleTemporarySave = () => {
    localStorage.setItem("draftPost", JSON.stringify(formData));
    alert("임시저장 되었습니다.");
  };

  const handleInsertImage = (image: ImageFile) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const imageUrl = image.preview;
    const markdownImage = `\\n![${image.picName} 이미지](${imageUrl})\\n`;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue =
      currentValue.substring(0, start) +
      markdownImage +
      currentValue.substring(end);

    setFormData((prev) => ({
      ...prev,
      content: newValue,
    }));

    const newCursorPosition = start + markdownImage.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
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
            {/* '새소식' 옵션 추가 */}
            {/* <option value="새소식">새소식</option> */}
            <option value="자유게시판">자유게시판</option>
            <option value="홍보게시판">홍보게시판</option>
            <option value="요청게시판">요청게시판</option>
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div
                    className="post-image-grid"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {formData.images.map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`post-image-item ${snapshot.isDragging ? "dragging" : ""
                              } ${formData.fileName === image.id
                                ? "post-thumbnail-selected"
                                : ""
                              }`}
                          >
                            <img
                              src={image.preview}
                              alt="업로드 이미지"
                              className="preview-img"
                              onClick={() => handleThumbnailSelect(image.id)}
                            />
                            <div className="post-image-overlay">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="post-remove-image-btn"
                                aria-label="이미지 삭제"
                              >
                                ×
                              </button>
                              {formData.fileName === image.id ? (
                                <span className="post-thumbnail-badge">썸네일</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleThumbnailSelect(image.id)
                                  }
                                  className="post-thumbnail-button"
                                >
                                  썸네일로 설정
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <p className="file-guide">
              {formData.images.length === 0
                ? "썸네일로 사용할 이미지를 업로드해주세요. (최대 10MB)"
                : `${formData.images.length}/10개 이미지 업로드됨`}
            </p>
          </div>

          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            className="content-textarea"
            rows={8}
            ref={contentTextareaRef}
          />
          <div className="char-count">{characterCount}자</div>

          {/* 태그 입력 UI */}
          <div className="tag-input-area">
            <div className="tag-list">
              {tags.map((tag) => (
                <span className="tag-pill" key={tag}>
                  {tag}
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label="태그 삭제"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                type="text"
                className="tag-input-box"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그"
                maxLength={15}
              />
              <button
                type="button"
                className="tag-add-btn"
                onClick={handleAddTag}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleCancel}>뒤로 가기</button>
        <button onClick={handleTemporarySave} disabled={isSubmitting}>
          임시저장
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          등록하기
        </button>
      </div>
    </div>
  );
};

export default PostRegister;