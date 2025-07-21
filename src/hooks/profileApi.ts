// src/hooks/profileApi.ts
import { getAuthHeaders } from "../utils/auth";

// 백엔드의 UploadResultDTO에 맞는 타입 정의
export interface UploadResultDTO {
  fileName: string;
  uuid: string;
  folderPath: string;
  originImagePath: string; // 백엔드 getImageUrl()에 해당
  thumbnailImagePath: string; // 백엔드 getThumbnailUrl()에 해당
}

export interface UserProfileDTO {
  profileId?: number;
  userId: number;
  nickname?: string;
  introduction?: string;
  originImagePath?: string;
  thumbnailImagePath?: string;
  email?: string;
  name?: string;
  followCnt?: number;
  followingCnt?: number;
  isFollowing?: boolean;
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
  profile: UserProfileDTO,
  token: string
): Promise<UserProfileDTO> => {
  // userId를 객체로 감싸지 않습니다.
  const profileData = { ...profile };

  // 닉네임이 제공되지 않았을 경우 기본값 설정 (선택 사항)
  // if (!profileData.nickname) {
  //   profileData.nickname = "새 사용자"; // 여기에 원하는 기본 닉네임을 입력
  // }

  // 다른 필드에도 유사하게 기본값을 설정할 수 있습니다. (선택 사항)
  // 예: introduction이 없을 경우 빈 문자열 설정
  // if (!profileData.introduction) {
  //     profileData.introduction = "";
  // }

  console.log("Creating profile with data:", profileData); // 서버 전송 직전 로그 추가

  const res = await fetch(`http://localhost:8080/ourlog/profile/create`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("프로필 생성 응답 오류:", res.status, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `프로필 생성 실패: ${res.status}`);
    } catch (parseError) {
      throw new Error(`프로필 생성 실패: ${res.status} - ${errorText}`);
    }
  }
  return res.json();
};

///////////
export async function uploadProfileImage(
  userId: number,
  file: File
): Promise<UploadResultDTO> { // 반환 타입을 UploadResultDTO로 변경
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
        'X-Request-ID': crypto.randomUUID(),
        // Content-Type 는 FormData 쓰면 자동 설정됩니다
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("이미지 업로드 실패: " + text);
  }

  // 백엔드 응답 형태 (UploadResultDTO) 그대로 JSON 파싱하여 반환
  const result: UploadResultDTO = await res.json();
  return result; // UploadResultDTO 객체를 반환
}
