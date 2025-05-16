import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProfile, UserProfileDTO } from "../hooks/profileApi";

const WorkerPage = () => {
  const location = useLocation();
  const userId = location.state?.userId; // <- 전달받은 userId

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId)
        .then(setProfile)
        .catch((err) => console.error("프로필 조회 실패", err));
    }
  }, [userId]);

  return (
    <div>
      {profile ? (
        <div>
          <h2>{profile.nickname}</h2>
          <img src={profile.thumbnailImagePath} alt="작가 이미지" />
          <p>{profile.introduction}</p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
};

export default WorkerPage;
