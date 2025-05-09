import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../styles/PostRegiModi.css"; // PostRegister와 동일한 CSS 사용

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

interface DummyImageFile {
  preview: string;
  id: string;
}

interface DummyData {
  [key: string]: {
    title: string;
    content: string;
    images: DummyImageFile[];
    thumbnailId: string;
    category: string;
  };
}

const dummyData: DummyData = {
  "1": {
    title: "지금부터 마카오 환타지아 클라이맥스 썸머...",
    content: `지금부터 마카오 환타지아 클라이맥스 썸머 영상 리뷰 시작합니다.

이 영상은 마카오에서 펼쳐지는 환상적인 쇼에 대한 내용으로, 화려한 퍼포먼스와 다양한 문화적 요소가 조화롭게 어우러져 있습니다.`,
    images: [
      {
        preview: "/images/post1.jpg",
        id: "dummy1",
      }
    ],
    thumbnailId: "dummy1",
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
    images: [],
    thumbnailId: null,
    category: "자유게시판",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);

  useEffect(() => {
    if (id && dummyData[id]) {
      const data = dummyData[id];
      setFormData({
        title: data.title,
        content: data.content,
        images: data.images.map(img => ({
          ...img,
          file: new File([], img.id, { type: 'image/jpeg' })
        })),
        thumbnailId: data.thumbnailId,
        category: data.category,
      });
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
            className="content-textarea"
            rows={8}
          />
          <div className="char-count">{characterCount}자</div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleDelete} className="delete-button">
          삭제하기
        </button>
        <button onClick={handleCancel}>취소</button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          수정하기
        </button>
      </div>
    </div>
  );
};

export default PostModify;
