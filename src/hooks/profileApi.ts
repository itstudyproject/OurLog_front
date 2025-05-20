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
  isFollowing?: boolean; // ✅ 이 줄이 있어야 함
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
    `http://localhost:8080/ourlog/profile/profileEdit/${userId}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("프로필 수정 실패: " + text);
  }

  return res.json();
};

// 새로운 사용자 프로필 생성
export const createProfile = async (
  profile: UserProfileDTO
): Promise<UserProfileDTO> => {
  // userId를 객체로 감싸지 않습니다.
  const profileData = { ...profile };

  const res = await fetch(`http://localhost:8080/ourlog/profile/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("프로필 생성 실패");
  return res.json();
};

///////////
export async function uploadProfileImage(
  userId: number,
  file: File
): Promise<string> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("로그인이 필요합니다.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `http://localhost:8080/ourlog/profile/upload-image/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type 는 FormData 쓰면 자동 설정됩니다
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("이미지 업로드 실패: " + text);
  }

  const json = (await res.json()) as { imagePath: string };
  return json.imagePath;
}
