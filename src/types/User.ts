// types/User.ts
export interface User {
  id?: number;
  userId?: number;  // 호환성을 위해 추가
  email: string;
  name?: string;
  nickname?: string;
  profileImage?: string;
  token?: string;
  profileId?: number;
}

export interface UserProfile {
  profileId?: number;
  user: number;
  nickname?: string;
  originImagePath?: string;
  thumbnailImagePath?: string;
  introduction?: string;
  email?: string;
  name?: string;
  location?: string;
  website?: string;
  followerCount?: number;
  followingCount?: number;
}
