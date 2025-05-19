// src/hooks/favoriteApi.ts
import { getAuthHeaders } from "../utils/auth";

// src/hooks/favoriteApi.ts
export interface PostDTO {
  postId:      number;
  title:       string;
  imagePath:   string;
  artist:      string;
  favoriteCnt: number;
}

export interface FavoriteDTO {
  favoriteId: number;
  userDTO:    { userId: number };
  postDTO:    PostDTO;
}

// 토글용 요청 DTO
export interface FavoriteRequestDTO {
  userDTO: { userId: number };
  postDTO: { postId: number };
}

// 1) 유저가 좋아요한 전체 즐겨찾기 조회
export async function getFavoritesByUser(userId: number): Promise<FavoriteDTO[]> {
  const res = await fetch(
    `http://localhost:8080/ourlog/profile/favorites/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("북마크 조회 실패");
  return res.json();
}

