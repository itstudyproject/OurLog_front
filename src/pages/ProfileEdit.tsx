// src/pages/ProfileEditPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileEdit.css';

interface ProfileEditPageProps {
  onBack?: () => void;
}

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: 'art_lover',
    email: 'user@example.com',
    fullName: '김예술',
    bio: '현대 미술과 사진을 좋아합니다. 특히 추상화에 관심이 많습니다.',
    location: '서울특별시',
    website: 'https://myartblog.com',
    profilePicture: '/images/Logo.png',
  });

  // 입력 필드 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 // 프로필 이미지 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileData(prev => ({
            ...prev,
            profilePicture: event.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };



  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 실제 API 엔드포인트에 맞게 URL을 수정
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error('Network response was not ok');

      //  응답으로 받은 최신 프로필 데이터로 상태 갱신 가능
      // const updated = await res.json();
      // setProfileData(updated);

      // 성공 알림 후 돌아가기
      alert('프로필이 성공적으로 업데이트되었습니다.');
      if (onBack) {
        onBack();
      } else {
        navigate('/mypage');
      }
    } catch (error) {
      console.error(error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="header-title">프로필수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-content">
        {/* 사이드바: 프로필 사진 */}
        <div className="profile-sidebar">
          <div className="profile-photo-container">
            <img
              src={profileData.profilePicture}
              alt="프로필 사진"
              className="profile-photo"
            />
            <div className="photo-overlay">
              <label htmlFor="profile-photo-input" className="change-photo-button">
                사진 변경
              </label>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="profile-main">
          <div className="form-section">
            <h2 className="section-title">기본 정보</h2>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                사용자 이름
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                실명
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                소개
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="form-input"
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">추가 정보</h2>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                위치
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website" className="form-label">
                웹사이트
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="action-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={onBack || (() => navigate(-1))}
            >
              취소
            </button>
            <button type="submit" className="save-button">
              변경사항 저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditPage;
