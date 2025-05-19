import { getAuthHeaders } from "../utils/auth";

// 사용자 등록 시 필요한 데이터 타입
export interface UserRegisterDTO {
  email: string;
  name: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  mobile: string;
  fromSocial: boolean;
}

export interface UserDTO {
  userId:   number;
  email:    string;
  name:     string;
  mobile?:  string;
  // password는 보통 백엔드에서만 쓰이지만 필요하면 추가
}

// updates: { password?: string; mobile?: string; }
export async function updateUserInfo(
  userId: number,
  updates: Partial<Pick<UserDTO, "mobile"> & { password?: string }>
): Promise<UserDTO> {
  const res = await fetch(
    `http://localhost:8080/ourlog/profile/accountEdit/${userId}`,  // 컨트롤러 매핑에 맞춘 경로
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error("회원정보 수정 실패: " + text);
  }
  return res.json();
}

// 이메일 중복 검사
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/ourlog/user/check/email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('서버 요청이 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error("이메일 중복 확인 중 오류:", error);
    throw error;
  }
};

// 닉네임 중복 검사
export const checkNicknameExists = async (nickname: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/ourlog/user/check/nickname?nickname=${encodeURIComponent(nickname)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('서버 요청이 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error("닉네임 중복 확인 중 오류:", error);
    throw error;
  }
};

// 전화번호 중복 검사
export const checkMobileExists = async (mobile: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/ourlog/user/check/mobile?mobile=${encodeURIComponent(mobile)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('서버 요청이 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error("전화번호 중복 확인 중 오류:", error);
    throw error;
  }
};

// 사용자 등록 함수
export const registerUser = async (userData: UserRegisterDTO): Promise<number> => {
  try {
    const registerResponse = await fetch('http://localhost:8080/ourlog/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      
      // 백엔드에서 반환하는 오류 맵을 그대로 반환
      if (typeof errorData === 'object') {
        throw errorData;
      }
      
      throw new Error(errorData.message || '회원가입에 실패했습니다.');
    }

    return await registerResponse.json();
  } catch (error) {
    console.error("회원가입 중 오류:", error);
    throw error;
  }
}; 