import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setToken } from "../utils/auth";
import { createProfile, fetchProfile, UserProfileDTO } from "../hooks/profileApi";

const SocialLoginHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 소셜 로그인 토큰과 이메일로 사용자 정보 가져와 로그인 처리하는 함수
  const fetchUserDataAndLogin = async (token: string, userEmail: string) => {
    try {
      // 1. 토큰 저장
      setToken(token);

      // 2. 토큰과 이메일로 사용자 정보 요청 (백엔드 /user/get 엔드포인트 사용)
      // 백엔드 /user/get 엔드포인트가 email 쿼리 파라미터를 사용한다고 가정합니다.
      const userResponse = await fetch(`http://localhost:8080/ourlog/user/get?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': crypto.randomUUID(),
        }
      });

      if (!userResponse.ok) {
        // 에러 응답 본문을 로깅하여 디버깅에 도움
        const errorBody = await userResponse.text();
        console.error("Failed to fetch social login user info:", userResponse.status, errorBody);
        // 실패 시 로그인 페이지로 리다이렉트
        navigate("/login?error=social_login_failed"); // 오류 파라미터 추가
        throw new Error("소셜 로그인 사용자 정보를 가져오는데 실패했습니다.");
      }

      const userInfo = await userResponse.json();
      console.log("소셜 로그인 사용자 정보:", userInfo);

      // 3. 사용자 프로필 확인 및 없으면 생성 (기존 로직 재사용)
      let profileId: number | null = null;
      if (userInfo.userId) {
        profileId = await checkAndCreateProfile(userInfo.userId, userInfo);
      }

      // 4. 사용자 정보 저장 및 로그인 처리 (기존 로직 재사용)
       const userData = {
        email: userInfo.email, // 백엔드에서 받은 UserDTO의 이메일 사용
        userId: userInfo.userId, // 백엔드에서 받은 UserDTO의 userId 사용
        token: token,
        profileImage: userInfo.profileImage || "/images/mypage.png",
        profileId: profileId
      };

      handleLoginSuccess(userData, false); // 소셜 로그인은 자동 로그인 체크박스와 무관하게 처리

    } catch (err) {
      console.error("소셜 로그인 처리 중 오류:", err);
      // 실패 시 로그인 페이지로 리다이렉트
      navigate("/login?error=social_login_processing_failed"); // 오류 파라미터 추가
    }
  };

  // 사용자 프로필 확인 및 생성 (기존 함수 유지)
  const checkAndCreateProfile = async (userId: number, userInfo: any): Promise<number | null> => {
    try {
      // 프로필 조회 시도
      const profileData = await fetchProfile(userId);
      console.log("사용자 프로필이 이미 존재합니다:", profileData);
      return profileData.profileId || null;
    } catch (error) {
      console.log("사용자 프로필이 없습니다. 새 프로필을 생성합니다.");

      try {
        // 프로필이 없으면 기본 프로필 생성
        const defaultProfile: UserProfileDTO = {
          userId: userId,
          nickname: userInfo.nickname || userInfo.email.split('@')[0], // userInfo에서 닉네임/이메일 사용
          introduction: `안녕하세요, ${userInfo.nickname || userInfo.email.split('@')[0]}입니다.`, // userInfo에서 닉네임/이메일 사용
          email: userInfo.email, // userInfo에서 이메일 사용
          name: userInfo.name || "", // userInfo에서 이름 사용
          originImagePath: "/images/mypage.png",
          thumbnailImagePath: "/images/mypage.png",
          followCnt: 0,
          followingCnt: 0,
          isFollowing: false,
        };

        const newProfile = await createProfile(defaultProfile);
        console.log("기본 프로필 생성 완료:", newProfile);
        return newProfile.profileId || null;
      } catch (profileErr) {
        console.error("프로필 생성 중 오류:", profileErr);
        return null;
      }
    }
  };

  const handleLoginSuccess = async (userData: any, shouldSave: boolean) => {
    console.log("handleLoginSuccess called", userData);
    // 소셜 로그인 핸들러에서는 자동 로그인 처리를 하지 않음 (별도로 구현 가능)
    // if (shouldSave) {
    //   localStorage.setItem("autoLoginUser", JSON.stringify(userData));
    // } else {
    //   localStorage.removeItem("autoLoginUser");
    // }

    setToken(userData.token);

    // 사용자 정보를 localStorage에 저장
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: userData.email,
        userId: userData.userId,
        profileImage: userData.profileImage || "/images/mypage.png",
        profileId: userData.profileId
      })
    );

    // 로그인 알림 표시를 위한 플래그 설정
    sessionStorage.setItem("loginEvent", "true");
    window.dispatchEvent(new Event("login"));

    // 로그인 처리 완료 후 메인 페이지로 이동
    navigate("/");
  };


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const socialToken = params.get("token");
    const socialEmail = params.get("email");

    if (socialToken && socialEmail) {
      console.log("소셜 로그인 핸들러: 토큰 감지:", socialToken.substring(0, 20) + '...');
      console.log("소셜 로그인 핸들러: 이메일 감지:", socialEmail);

      // URL에서 파라미터 제거
      // navigate(location.pathname, { replace: true }); // 이미 메인으로 이동하므로 필요 없음

      fetchUserDataAndLogin(socialToken, socialEmail);
    } else {
      console.error("소셜 로그인 핸들러: 토큰 또는 이메일 누락");
      // 토큰이나 이메일이 없는 경우 로그인 페이지로 리다이렉트
      navigate("/login?error=missing_social_login_params"); // 오류 파라미터 추가
    }
     // location dependency 추가하여 URL 변경 감지
  }, [navigate, location]);


  // 처리 중임을 사용자에게 보여줄 수 있는 간단한 UI
  return (
    <div className="social-login-handler-container">
      <p>로그인 처리 중입니다...</p>
      {/* 로딩 스피너 등을 추가할 수 있습니다. */}
    </div>
  );
};

export default SocialLoginHandler;
