import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../styles/PostRegiModi.css";
import { getAuthHeaders } from "../../utils/auth";

interface ImageFile {
  file: File | null;
  preview: string;
  id: string;
  picId?: string;
  uuid: string;
  picName: string;
  path: string;
}

interface FormData {
  title: string;
  content: string;
  images: ImageFile[];
  thumbnailId: string | null;
  category: string;
}

const PostModify = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/ourlog/post/read/${id}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("게시글을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        if (!data || !data.postDTO) {
          throw new Error("잘못된 데이터 형식입니다.");
        }

        const postData = data.postDTO;
        setFormData({
          title: postData.title,
          content: postData.content,
          images:
            postData.pictureDTOList?.map((pic: any) => ({
              file: null,
              preview: `http://localhost:8080/ourlog/picture/display/${pic.path}/${pic.uuid}_${pic.picName}`,
              id: pic.uuid,
              picId: pic.picId,
              uuid: pic.uuid,
              picName: pic.picName,
              path: pic.path,
            })) || [],
          thumbnailId: postData.fileName || null,
          category: getBoardCategory(postData.boardNo),
        });
        setTags(postData.tag ? postData.tag.split(",") : []);
        setCharacterCount(postData.content.length);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        alert("게시글을 불러오는데 실패했습니다.");
        navigate("/post");
      }
    };

    if (id) {
      fetchPost();
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
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드 가능합니다.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "파일 크기는 10MB 이하여야 합니다.";
    }
    return null;
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("files", file);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/ourlog/picture/upload", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: fd,
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
            preview: `/uploads/${uploaded.path}/${uploaded.uuid}_${uploaded.picName}`,
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
        thumbnailId:
          prev.thumbnailId || (newImages.length > 0 ? newImages[0].id : null),
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
      const deletedImage = prev.images.find((img) => img.id === id);

      return {
        ...prev,
        images: newImages,
        thumbnailId:
          deletedImage?.picName === prev.thumbnailId
            ? newImages.length > 0
              ? newImages[0].picName
              : null
            : prev.thumbnailId,
      };
    });
  };

  const handleThumbnailSelect = (picName: string) => {
    setFormData((prev) => ({
      ...prev,
      thumbnailId: picName,
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

  const getBoardCategory = (boardNo: number): string => {
    switch (boardNo) {
      case 1:
        return "새소식";
      case 2:
        return "자유게시판";
      case 3:
        return "홍보게시판";
      case 4:
        return "요청게시판";
      default:
        return "자유게시판";
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
      const postDTO = {
        postId: id,
        title: formData.title,
        content: formData.content,
        boardNo: getBoardNo(formData.category),
        fileName: formData.thumbnailId,
        pictureDTOList: formData.images.map((img) => ({
          uuid: img.uuid,
          picName: img.picName,
          path: img.path,
        })),
        tag: tags.join(","),
      };

      const response = await fetch(`http://localhost:8080/ourlog/post/modify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postDTO),
      });

      if (!response.ok) throw new Error("게시물 수정에 실패했습니다.");
      alert("게시물이 성공적으로 수정되었습니다.");
      navigate(`/post/detail/${id}`);
    } catch (error) {
      alert("게시물 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "수정 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?"
      )
    ) {
      navigate(`/post/detail/${id}`);
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
                            className={`image-item ${
                              snapshot.isDragging ? "dragging" : ""
                            } ${
                              formData.thumbnailId === image.picName
                                ? "thumbnail-selected"
                                : ""
                            }`}
                          >
                            <img
                              src={image.preview}
                              alt="업로드 이미지"
                              className="preview-img"
                              onClick={() =>
                                handleThumbnailSelect(image.picName)
                              }
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
                              {formData.thumbnailId === image.picName ? (
                                <span className="thumbnail-badge">썸네일</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleThumbnailSelect(image.picName)
                                  }
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

          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            className="content-textarea"
            rows={8}
          />
          <div className="char-count">{characterCount}자</div>

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
        <button onClick={handleCancel}>취소</button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          수정하기
        </button>
      </div>
    </div>
  );
};

export default PostModify;
