import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../styles/PostRegiModi.css";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface FormData {
  title: string;
  content: string;
  images: ImageFile[];
  thumbnailId: string | null;
  category: string;
}

const PostRegister = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    images: [],
    thumbnailId: null,
    category: "자유게시판",
  });
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

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return '파일 크기는 10MB 이하여야 합니다.';
    }
    return null;
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
          if (error) {
            throw new Error(error);
          }

          return new Promise<ImageFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                file,
                preview: reader.result as string,
                id: Math.random().toString(36).substring(7),
              });
            };
            reader.onerror = () => reject(new Error('이미지 로드 중 오류가 발생했습니다.'));
            reader.readAsDataURL(file);
          });
        })
      );

      const newImages = [...formData.images, ...processedImages];
      
      setFormData(prev => ({
        ...prev,
        images: newImages,
        thumbnailId: prev.thumbnailId || (newImages.length > 0 ? newImages[0].id : null),
      }));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (id: string) => {
    setFormData(prev => {
      const newImages = prev.images.filter(img => img.id !== id);
      return {
        ...prev,
        images: newImages,
        thumbnailId: prev.thumbnailId === id 
          ? (newImages.length > 0 ? newImages[0].id : null)
          : prev.thumbnailId,
      };
    });
  };

  const handleThumbnailSelect = (id: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnailId: id,
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      images: items,
    }));
  };

  const handleContentImageDragEnd = (result: any) => {
    if (!result.destination) return;

    const content = formData.content;
    const lines = content.split('\n');
    const imageLines = lines.filter(line => line.startsWith('!['));
    const [movedImage] = imageLines.splice(result.source.index, 1);
    imageLines.splice(result.destination.index, 0, movedImage);

    const newContent = lines.map(line => {
      if (line.startsWith('![')) {
        return imageLines.shift() || line;
      }
      return line;
    }).join('\n');

    setFormData(prev => ({
      ...prev,
      content: newContent,
    }));
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
            <button type="button" onClick={handleFileButtonClick}>이미지 업로드</button>
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
                    className="image-grid"
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
                            className={`image-item ${snapshot.isDragging ? 'dragging' : ''} ${formData.thumbnailId === image.id ? 'thumbnail-selected' : ''}`}
                          >
                            <img 
                              src={image.preview} 
                              alt="업로드 이미지" 
                              className="preview-img"
                              onClick={() => handleThumbnailSelect(image.id)}
                            />
                            <div className="image-overlay">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="remove-image-btn"
                                aria-label="이미지 삭제"
                              >
                                ×
                              </button>
                              {formData.thumbnailId === image.id ? (
                                <span className="thumbnail-badge">썸네일</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleThumbnailSelect(image.id)}
                                  className="thumbnail-button"
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

          <DragDropContext onDragEnd={handleContentImageDragEnd}>
            <Droppable droppableId="content-images" direction="horizontal">
              {(provided) => (
                <div 
                  className="content-images"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formData.images.map((image, index) => (
                    <Draggable 
                      key={image.id} 
                      draggableId={`content-${image.id}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`content-image-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <img 
                            src={image.preview} 
                            alt="내용 이미지" 
                            className="content-image"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
          등록하기
        </button>
      </div>
    </div>
  );
};

export default PostRegister;
