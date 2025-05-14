// src/services/profileApi.ts
export interface UserProfileDTO {
  id: number;
  user: { id: number; email: string };
  nickname: string;
  bio?: string;
  imagePath?: string;
  followerCount?: number;
  followingCount?: number;
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

// 공통 헤더
function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 프로필 조회
export async function fetchProfile(userId: number): Promise<UserProfileDTO> {
  const res = await fetch(`http://localhost:8080/profile/get/${userId}`, {
    headers: { ...authHeader(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("프로필 조회 실패");
  return res.json();
}

// 프로필 수정
export async function updateProfile(
  userId: number,
  payload: Partial<UserProfileDTO>
): Promise<UserProfileDTO> {
  const res = await fetch(`http://localhost:8080/profile/edit/${userId}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("프로필 수정 실패");
  return res.json();
}
