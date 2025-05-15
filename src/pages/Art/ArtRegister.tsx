import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ko } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/ArtRegister.css";
//  npm install react-datepicker date-fns 설치할것

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ArtworkForm {
  title: string;
  description: string;
  startPrice: string;
  instantPrice: string;
  startTime: Date;
  endTime: Date;
  images: ImageFile[];
  thumbnailId: string | null;
  tags: string[];
}

const ArtRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ArtworkForm>({
    title: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: new Date(),
    endTime: new Date(),
    images: [],
    thumbnailId: null,
    tags: [],
  });

  const [newTag, setNewTag] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ImageFile = {
            file,
            preview: reader.result as string,
            id: Math.random().toString(36).substring(7),
          };
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
            thumbnailId: prev.thumbnailId || newImage.id,
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleThumbnailSelect = (imageId: string) => {
    setForm((prev) => {
      // 선택된 이미지 찾기
      const selectedImageIndex = prev.images.findIndex(
        (img) => img.id === imageId
      );
      if (selectedImageIndex === -1) return prev;

      // 이미지 배열 복사
      const newImages = [...prev.images];
      // 선택된 이미지를 배열에서 제거
      const [selectedImage] = newImages.splice(selectedImageIndex, 1);
      // 선택된 이미지를 배열의 첫 번째 위치에 추가
      newImages.unshift(selectedImage);

      return {
        ...prev,
        images: newImages,
        thumbnailId: imageId,
      };
    });
  };

  const handleImageDelete = (imageId: string) => {
    setForm((prev) => {
      const newImages = prev.images.filter((img) => img.id !== imageId);
      return {
        ...prev,
        images: newImages,
        thumbnailId:
          prev.thumbnailId === imageId
            ? newImages[0]?.id || null
            : prev.thumbnailId,
      };
    });
  };

  const formatPrice = (value: string) => {
    const number = value.replace(/[^\d]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: formatPrice(value),
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (form.tags.includes(newTag.trim())) {
        alert("이미 존재하는 태그입니다.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) {
      alert("최소 한 개의 이미지를 업로드해주세요.");
      return;
    }

    // TODO: API 연동 후에는 실제 생성된 작품의 ID를 받아서 이동
    const dummyArtId = "1";
    alert("작품이 성공적으로 등록되었습니다!");
    navigate(`/art/${dummyArtId}`);
  };

  return (
    <div className="art-register-container">
      <div className="art-register-grid">
        {/* 왼쪽 섹션: 이미지 업로드 */}
        <div className="image-upload-section">
          <div className="image-grid">
            {/* 첫 번째 슬롯: 메인 이미지 업로드 또는 미리보기 */}
            {form.images.length > 0 ? (
              <div
                className={`image-item ${
                  form.thumbnailId === form.images[0].id
                    ? "thumbnail-selected"
                    : ""
                }`}
              >
                <img
                  src={form.images[0].preview}
                  alt="메인 이미지"
                  className="uploaded-image"
                  onClick={() => handleThumbnailSelect(form.images[0].id)}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => handleImageDelete(form.images[0].id)}
                    className="delete-button"
                  >
                    ✕
                  </button>
                  {form.thumbnailId === form.images[0].id && (
                    <span className="thumbnail-badge">썸네일</span>
                  )}
                  {form.thumbnailId !== form.images[0].id && (
                    <button
                      type="button"
                      onClick={() => handleThumbnailSelect(form.images[0].id)}
                      className="thumbnail-button"
                    >
                      썸네일로 설정
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="artwork-image-main"
                  multiple
                />
                <label htmlFor="artwork-image-main">
                  <span>메인 이미지를 업로드해주세요</span>
                  <span className="mt-2 text-sm">(클릭하여 파일 선택)</span>
                </label>
              </div>
            )}

            {/* 나머지 이미지들 */}
            {form.images.slice(1).map((image) => (
              <div
                key={image.id}
                className={`image-item ${
                  form.thumbnailId === image.id ? "thumbnail-selected" : ""
                }`}
              >
                <img
                  src={image.preview}
                  alt="업로드 이미지"
                  className="uploaded-image"
                  onClick={() => handleThumbnailSelect(image.id)}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="delete-button"
                  >
                    ✕
                  </button>
                  {form.thumbnailId === image.id && (
                    <span className="thumbnail-badge">썸네일</span>
                  )}
                  {form.thumbnailId !== image.id && (
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
            ))}

            {/* 추가 이미지 업로드 플레이스홀더 */}
            {form.images.length < 10 && (
              <div className="image-upload-placeholder small">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="artwork-image-additional"
                  multiple
                />
                <label htmlFor="artwork-image-additional">
                  <span>추가 이미지</span>
                  <span className="mt-1 text-sm">
                    ({form.images.length}/10)
                  </span>
                </label>
              </div>
            )}
          </div>
          {form.images.length > 0 && (
            <>
              <p className="image-help-text">
                * 이미지를 클릭하여 썸네일로 설정할 수 있습니다.
              </p>

              {/* 태그 입력 섹션 수정 */}
              <div className="tags-section">
                {form.tags.length > 0 && (
                  <div className="tags-container">
                    {form.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="remove-tag"
                          title="태그 삭제"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="tags-input-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleAddTag}
                    placeholder="태그 입력 후 Enter"
                    className="tag-input"
                    maxLength={20}
                  />
                  <button
                    onClick={() => {
                      if (newTag.trim()) {
                        if (form.tags.includes(newTag.trim())) {
                          alert("이미 존재하는 태그입니다.");
                          return;
                        }
                        setForm((prev) => ({
                          ...prev,
                          tags: [...prev.tags, newTag.trim()],
                        }));
                        setNewTag("");
                      }
                    }}
                    className="tag-add-button"
                    type="button"
                  >
                    추가
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 섹션: 작품 정보 */}
        <div className="art-info-section">
          <div className="user-info">
            <div className="user-profile"></div>
            <span className="user-name">일러스트레이터</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                작품 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                작품 설명
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="form-textarea"
                required
              />
            </div>

            <div className="price-info">
              <div className="price-box">
                <div className="price-label">시작가</div>
                <div className="price-value">{form.startPrice || "0"}원</div>
              </div>
              <div className="price-box current-price">
                <div className="price-label">현재 입찰가</div>
                <div className="price-value">{form.startPrice || "0"}원</div>
              </div>
              <div className="price-box">
                <div className="price-label">즉시 구매가</div>
                <div className="price-value">{form.instantPrice || "0"}원</div>
              </div>
            </div>

            <div className="bid-section">
              <div className="form-group">
                <label htmlFor="startPrice" className="form-label">
                  경매 시작가 설정
                </label>
                <input
                  type="text"
                  id="startPrice"
                  name="startPrice"
                  value={form.startPrice}
                  onChange={handlePriceChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="instantPrice" className="form-label">
                  즉시 구매가 설정
                </label>
                <input
                  type="text"
                  id="instantPrice"
                  name="instantPrice"
                  value={form.instantPrice}
                  onChange={handlePriceChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">경매 시작 시간</label>
                <DatePicker
                  selected={form.startTime}
                  onChange={(date: Date | null) =>
                    date && setForm((prev) => ({ ...prev, startTime: date }))
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy.MM.dd HH:mm"
                  className="form-input"
                  locale={ko}
                />
              </div>

              <div className="form-group">
                <label className="form-label">경매 종료 시간</label>
                <DatePicker
                  selected={form.endTime}
                  onChange={(date: Date | null) =>
                    date && setForm((prev) => ({ ...prev, endTime: date }))
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy.MM.dd HH:mm"
                  className="form-input"
                  locale={ko}
                  minDate={form.startTime}
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="button button-secondary"
              >
                취소
              </button>
              <button type="submit" className="button button-primary">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtRegister;
