// src/hooks/profileApi.ts
import { getAuthHeaders } from "../utils/auth";

export interface PictureDTO {}

export const fetchProfile = async (userId: number): Promise<PictureDTO> => {
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
  profile: Partial<PictureDTO>
): Promise<PictureDTO> => {
  const res = await fetch(
    `http://localhost:8080/ourlog/picture/edit/${userId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    }
  );
  if (!res.ok) throw new Error("프로필 수정 실패");
  return res.json();
};
