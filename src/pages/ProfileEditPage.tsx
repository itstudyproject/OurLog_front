import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ProfileEdit.css';

// 체크 아이콘 컴포넌트
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// 화살표 아이콘 컴포넌트
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

interface ProfileEditPageProps {
  onBack: () => void;
}

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // 사용자 정보 상태
  const [profileData, setProfileData] = useState({
    username: 'art_lover',
    email: 'user@example.com',
    fullName: '김예술',
    bio: '현대 미술과 사진을 좋아합니다. 특히 추상화에 관심이 많습니다.',
    location: '서울특별시',
    website: 'https://myartblog.com',
    profilePicture: '/images/Logo.png',
    isSpotifyConnected: false
  });

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
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

  // Spotify 연결 토글
  const toggleSpotifyConnection = () => {
    setProfileData(prev => ({
      ...prev,
      isSpotifyConnected: !prev.isSpotifyConnected
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 실제 애플리케이션에서는 API로 데이터 전송
    console.log('프로필 데이터 저장:', profileData);

    // 성공 메시지와 함께 프로필 페이지로 리디렉션
    alert('프로필이 성공적으로 업데이트되었습니다.');
    navigate('/profile');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="header-title">회원정보수정</h1>
        <button className="back-button" onClick={onBack}>
          <ArrowLeftIcon /> 돌아가기
        </button>

      </div>

      <form onSubmit={handleSubmit} className="profile-content">
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

        <div className="profile-main">
          <div className="form-section">
            <h2 className="section-title">기본 정보</h2>

            <div className="form-group">
              <label htmlFor="username" className="form-label">사용자 이름</label>
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
              <label htmlFor="email" className="form-label">이메일</label>
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
              <label htmlFor="fullName" className="form-label">실명</label>
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
              <label htmlFor="bio" className="form-label">소개</label>
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
              <label htmlFor="location" className="form-label">위치</label>
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
              <label htmlFor="website" className="form-label">웹사이트</label>
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

          <div className="action-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={onBack}
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