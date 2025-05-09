import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../../styles/ArtRegister.css';

interface ArtworkForm {
  title: string;
  description: string;
  startPrice: string;
  instantPrice: string;
  startTime: Date;
  endTime: Date;
  image: File | null;
}

const ArtRegister = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string>('');
  const [form, setForm] = useState<ArtworkForm>({
    title: '',
    description: '',
    startPrice: '',
    instantPrice: '',
    startTime: new Date(),
    endTime: new Date(),
    image: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPrice = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: formatPrice(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동
    console.log(form);
  };

  return (
    <div className="art-register-container">
      <div className="art-register-grid">
        {/* 왼쪽 섹션: 이미지 업로드 */}
        <div className="image-upload-section">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="미리보기" className="image-preview" />
              <button
                type="button"
                onClick={() => {
                  setPreview('');
                  setForm(prev => ({ ...prev, image: null }));
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="image-upload-placeholder">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="artwork-image"
              />
              <label htmlFor="artwork-image">
                <span>이미지를 업로드해주세요</span>
                <span className="text-sm mt-2">(클릭하여 파일 선택)</span>
              </label>
            </div>
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
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea"
                required
              />
            </div>

            <div className="price-info">
              <div className="price-box">
                <div className="price-label">시작가</div>
                <div className="price-value">{form.startPrice || '0'}원</div>
              </div>
              <div className="price-box current-price">
                <div className="price-label">현재 입찰가</div>
                <div className="price-value">{form.startPrice || '0'}원</div>
              </div>
              <div className="price-box">
                <div className="price-label">즉시 구매가</div>
                <div className="price-value">{form.instantPrice || '0'}원</div>
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
                  onChange={(date: Date | null) => date && setForm(prev => ({ ...prev, startTime: date }))}
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
                  onChange={(date: Date | null) => date && setForm(prev => ({ ...prev, endTime: date }))}
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
              <button type="button" onClick={() => navigate(-1)} className="button button-secondary">
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