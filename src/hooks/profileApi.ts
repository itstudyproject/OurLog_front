// src/hooks/profileApi.ts
import { getAuthHeaders } from "../utils/auth";

export interface UserProfileDTO {
  profileId?: number;
  userId: number | { userId: number };
  nickname?: string;
  introduction?: string;
  originImagePath?: string;
  thumbnailImagePath?: string;
  email?: string;
  name?: string;
  followCnt?: number;
  followingCnt?: number;
}

export const fetchProfile = async (userId: number): Promise<UserProfileDTO> => {
  const res = await fetch(
    `http://localhost:8080/ourlog/profile/get/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("프로필 조회 실패");
  return res.json();
};

export const updateProfile = async (
  userId: number,
  profile: Partial<UserProfileDTO>
): Promise<UserProfileDTO> => {
  const res = await fetch(
    `http://localhost:8080/ourlog/profile/edit/${userId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    }
  );
  if (!res.ok) throw new Error("프로필 수정 실패");
  return res.json();
};

// 새로운 사용자 프로필 생성
export const createProfile = async (
  profile: UserProfileDTO
): Promise<UserProfileDTO> => {
  // user 필드가 숫자라면 객체로 변환
  const profileData = { ...profile };
  if (typeof profileData.userId === 'number') {
    profileData.userId = { userId: profileData.userId };
  }

  const res = await fetch(`http://localhost:8080/ourlog/profile/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("프로필 생성 실패");
  return res.json();
};
