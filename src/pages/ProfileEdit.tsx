// src/pages/ProfileEdit.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadResultDTO, UserProfileDTO, uploadProfileImage } from "../hooks/profileApi";
import "../styles/ProfileEdit.css";

interface ProfileEditProps {
  profile: UserProfileDTO | null;
  onBack: () => void;
  onSave: (updated: Partial<UserProfileDTO>) => Promise<void>;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({
  profile,
  onBack,
  onSave,
}) => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    // name:         profile?.name || "",
    // email:        profile?.email || "",
    nickname:     profile?.nickname || "",
    introduction: profile?.introduction || "",
    originImagePath: profile?.originImagePath || "",
    thumbnailImagePath:
      profile?.thumbnailImagePath || "/images/mypage.png",
      // "현대 미술과 사진을 좋아합니다. 특히 추상화에 관심이 많습니다.",
      // profilePicture: profile?.thumbnailImagePath || "/images/Logo.png",
    });

  // 입력 필드 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 프로필 이미지 변경 핸들러
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // 선택된 파일 로그
      console.log("선택된 프로필 이미지 파일:", e.target.files[0]);
      try {
        // userId 가져오기
        const userId = typeof profile?.userId === 'number' ? profile.userId : profile?.userId?.userId;
        if (!userId) {
          alert("유저 정보가 없습니다.");
          return;
        }
        // uploadProfileImage는 이제 UploadResultDTO 객체를 반환합니다.
        const uploadResult: UploadResultDTO = await uploadProfileImage(userId, e.target.files[0]);
        // 업로드 성공 후 반환된 결과 로그
        console.log("프로필 이미지 업로드 성공, 반환 결과:", uploadResult);

        // 백엔드 응답 객체의 imageURL과 thumbnailURL을 사용하여 상태 업데이트
        setProfileData((prev) => ({
          ...prev,
          originImagePath: uploadResult.originImagePath, // originImagePath 업데이트
          thumbnailImagePath: uploadResult.thumbnailImagePath, // thumbnailImagePath 업데이트
        }));
      } catch (err: any) {
        alert("이미지 업로드 실패: " + (err.message || err));
      }
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 프로필 수정 요청 데이터 로그
    console.log("프로필 수정 요청 데이터:", profileData);

    try {
      // 프로필 업데이트를 onSave prop 함수를 사용하여 처리
      await onSave({
        // name: profileData.name,
        // email: profileData.email,
        nickname:             profileData.nickname,
        introduction:         profileData.introduction,
        originImagePath:   profileData.originImagePath,
        thumbnailImagePath:   profileData.thumbnailImagePath,
      });

      // 성공 알림 후 돌아가기
      alert("프로필이 성공적으로 업데이트되었습니다.");
      if (onBack) {
        onBack();
      } else {
        navigate("/mypage");
      }
    } catch (error) {
      console.error(error);
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
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
              src={profileData.thumbnailImagePath}
              alt="프로필 사진"
              className="profile-photo"
            />
            <div className="photo-overlay">
              <label
                htmlFor="profile-photo-input"
                className="change-photo-button"
              >
                사진 변경
              </label>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="profile-main">
          <div className="form-section">
            <h2 className="section-title">기본 정보</h2>
{/* 
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                사용자 이름
              </label> */}
              {/* <input
                type="text"
                id="username"
                name="username"
                value={profileData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div> */}

            <div className="form-group">
              <label htmlFor="nickName" className="form-label">
                닉네임
              </label>
              <input
                type="text"
                id="nickName"
                name="nickname"
                value={profileData.nickname}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                소개
              </label>
              <textarea
                id="introduction"
                name="introduction"
                value={profileData.introduction}
                onChange={handleInputChange}
                className="form-input"
                rows={4}
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
            <button type="submit" className="pe-save-button">
              변경사항 저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
