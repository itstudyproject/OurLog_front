import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/LoginPage.css";
import { setToken } from "../utils/auth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 프로필 정보를 가져오는 함수 (userId 기준)
  const fetchProfile = async (userId: number, token: string): Promise<any | null> => {
    try {
      const profileResponse = await fetch(`http://localhost:8080/ourlog/profile/get/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        }
      });

      if (!profileResponse.ok) {
         // 프로필이 없는 경우 (404 Not Found 등) null 반환
         if (profileResponse.status === 404) {
            console.log(`Profile not found for userId: ${userId}`);
            return null;
         }
         const errorBody = await profileResponse.text();
         console.error("Failed to fetch profile:", profileResponse.status, errorBody);
         throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileInfo = await profileResponse.json();
      console.log("Fetched profile:", profileInfo);
      return profileInfo;

    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; // 오류 발생 시 throw
    }
  };

  // 새 프로필을 생성하는 함수
  const createProfile = async (userId: number, nickname: string, token: string): Promise<number | null> => {
     try {
        const createResponse = await fetch(`http://localhost:8080/ourlog/profile/create`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID(),
          },
          body: JSON.stringify({
            userId: userId,
            nickname: nickname,
            originImagePath: "/images/mypage.png",
            thumbnailImagePath: "/images/mypage.png",
            followCnt: 0,
            followingCnt: 0,
            introduction: `안녕하세요, ${nickname}입니다.`
          })
        });

        if (!createResponse.ok) {
           const errorBody = await createResponse.text();
           console.error("Failed to create profile:", createResponse.status, errorBody);
           throw new Error(`Failed to create profile: ${createResponse.status}`);
        }

        const newProfile = await createResponse.json();
        console.log("Created new profile:", newProfile);
        return newProfile.profileId;

     } catch (error) {
        console.error("Error creating profile:", error);
        throw error; // 오류 발생 시 throw
     }
  };

  const checkAndCreateProfile = async (userId: number, userInfo: any, token: string): Promise<number | null> => {
      try {
          // 1. 프로필 조회
          const existingProfile = await fetchProfile(userId, token);

          if (existingProfile) {
              // 프로필이 존재하면 해당 ID 반환
              return existingProfile.profileId;
          } else {
              // 프로필이 없으면 생성
              console.log("Profile does not exist. Creating new profile...");
              const userNickname = userInfo.nickname || userInfo.email.split('@')[0];
              return await createProfile(userId, userNickname, token);
          }
      } catch (error) {
          console.error("Error in checkAndCreateProfile:", error);
          return null; // 오류 발생 시 null 반환
      }
  };

  useEffect(() => {
      // 일반 로그인 토큰 확인 또는 자동 로그인 처리 (기존 로직)
      const token = localStorage.getItem("token");

      if (token) {
        // 이미 로그인된 경우 메인 페이지로 이동
        navigate("/");
        return;
      }

      // 회원가입 후 넘어온 경우 메시지 표시 및 오류 파라미터 처리
      if (location.state) {
        const state = location.state as { email?: string; message?: string };
        if (state.email) {
          setEmail(state.email);
        }
        if (state.message) {
          setSuccess(state.message);
        }
      }

      // 소셜 로그인 실패 시 오류 메시지 표시 (URL 쿼리 파라미터 확인)
      const params = new URLSearchParams(location.search);
      const errorMessage = params.get("error");
      if (errorMessage) {
        if (errorMessage === "social_login_failed") {
          setError("소셜 로그인 사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
        } else if (errorMessage === "social_login_processing_failed") {
           setError("소셜 로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else if (errorMessage === "missing_social_login_params") {
           setError("소셜 로그인 정보가 부족합니다. 다시 시도해주세요.");
        }
        // 오류 메시지 표시 후 URL에서 오류 파라미터 제거
         navigate(location.pathname, { replace: true });
      }


      // 자동 로그인 처리
      const savedUser = localStorage.getItem("autoLoginUser");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData.token) {
            // 자동 로그인 처리
            setToken(userData.token);

            localStorage.setItem(
              "user",
              JSON.stringify({
                email: userData.email,
                userId: userData.userId,
                profileImage: userData.profileImage || "/images/mypage.png",
                profileId: userData.profileId,
              })
            );

            // 로그인 이벤트 발생
            setTimeout(() => {
              sessionStorage.setItem("loginEvent", "true");
              window.dispatchEvent(new Event("login"));
              navigate("/");
            }, 200);
          }
        } catch (error) {
          console.error("자동 로그인 처리 중 오류 발생:", error);
          localStorage.removeItem("autoLoginUser");
        }
      }
    // } // else 블록 제거
  }, [navigate, location]);

  // 소셜 로그인 관련 함수들 제거 (fetchUserDataAndLogin, checkAndCreateProfile, handleLoginSuccess)
  // const fetchUserDataAndLogin = async (token: string, userEmail: string) => { ... };
  // const checkAndCreateProfile = async (userId: number, userInfo: any): Promise<number | null> => { ... };
  // const handleLoginSuccess = async (userData: any, shouldSave: boolean) => { ... };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 1. 로그인 요청 (표준 로그인)
      const loginResponse = await fetch(
        `http://localhost:8080/ourlog/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID(),
          }
        }
      );

      // 2. 토큰 추출 (표준 로그인)
      const tokenText = await loginResponse.text();

      if (tokenText.startsWith('{"code"')) {
        setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        return;
      }

      const token = tokenText.trim();
      setToken(token);

      // 3. 토큰으로 사용자 정보 요청 (표준 로그인)
      // 일반 로그인 후에는 email 상태 변수에 값이 있으므로 기존 로직 유지
      const userResponse = await fetch(`http://localhost:8080/ourlog/user/get?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        }
      });

      if (!userResponse.ok) {
         const errorBody = await userResponse.text();
         console.error("Failed to fetch standard login user info:", userResponse.status, errorBody);
         // 사용자 정보 가져오기 실패 시 로그인 상태 제거
         setToken(""); // 토큰 삭제
         localStorage.removeItem("user"); // 사용자 정보 삭제
         setError("사용자 정보를 가져오는데 실패했습니다. 다시 로그인 해주세요.");
         return; // 여기서 함수 종료
      }

      const userInfo = await userResponse.json();
      console.log("사용자 정보:", userInfo);

      // 4. 사용자 프로필 확인 및 없으면 생성 (추가된 로직)
      let profileId: number | null = null;
      if (userInfo.userId) {
        // checkAndCreateProfile 함수 호출 시 userInfo 객체와 token 전달
        profileId = await checkAndCreateProfile(userInfo.userId, userInfo, token);
        if (profileId === null) {
             setError("프로필 정보를 처리하는 중 오류가 발생했습니다.");
             setToken(""); // 토큰 삭제
             localStorage.removeItem("user"); // 사용자 정보 삭제
             return; // 오류 발생 시 중단
        }
      } else {
           setError("사용자 ID를 가져오는데 실패했습니다.");
           setToken(""); // 토큰 삭제
           localStorage.removeItem("user"); // 사용자 정보 삭제
           return; // 오류 발생 시 중단
      }


       // 5. 사용자 정보 저장 및 로그인 처리 (일반 로그인용 handleLoginSuccess 로직)
       const userData = {
        email: email,
        userId: userInfo.userId,
        token: token,
        profileImage: userInfo.profileImage || "/images/mypage.png",
        profileId: profileId // 프로필 ID 저장
      };

      // 일반 로그인 성공 처리 로직 (handleLoginSuccess 로직 복사 또는 별도 함수)
      console.log("Standard login success called", userData);
      if (autoLogin) {
        localStorage.setItem("autoLoginUser", JSON.stringify(userData));
      } else {
        localStorage.removeItem("autoLoginUser");
      }

      setToken(userData.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: userData.email,
          userId: userData.userId,
          profileImage: userData.profileImage || "/images/mypage.png",
          profileId: profileId // 프로필 ID 저장
        })
      );

      sessionStorage.setItem("loginEvent", "true");
      window.dispatchEvent(new Event("login"));
      navigate("/"); // 메인 페이지로 이동


    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const handleSocialLogin = async (provider: "google" | "naver" | "kakao") => {
    const client_id = '831383126225-5oknllf8737qqsmqk9jcc7emh2b9etip.apps.googleusercontent.com';
    // 백엔드 콜백 URL을 SocialLoginHandler 페이지로 변경해야 합니다.
    // 이 부분은 백엔드 설정에서 변경되어야 합니다.
    // 임시로 프론트엔드에서 백엔드 콜백 URL을 지정하되, 실제 백엔드 URL과 일치해야 합니다.
    const redirect_uri = 'http://localhost:8080/ourlog/user/google/callback'; // 백엔드 콜백 URL

    const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

    if (provider === "google") {
      console.log("Google 로그인 시작");
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      window.location.href = googleAuthUrl;
    } else if (provider === "naver") {
      console.log("Naver 로그인 시작");
      // Naver OAuth URL 구성 및 리다이렉트 로직 추가
    } else if (provider === "kakao") {
      console.log("Kakao 로그인 시작");
      // Kakao OAuth URL 구성 및 리다이렉트 로직 추가
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/images/OurLog.png" alt="Logo" className="logo" />

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleLogin} className="form-divider">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="이메일 주소"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}

            />
          </div>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="autoLogin"
              className="checkbox-input"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
            />
            <label htmlFor="autoLogin" className="checkbox-label">
              <span className="checkbox-custom"></span>
              자동 로그인
            </label>
          </div>

          <div className="social-buttons-container">
            <div className="continue-button-wrapper">
              <button type="submit" className="continue-button">
                계속하기
              </button>
            </div>

            <button
              type="button"
              className="social-login-button"
              onClick={() => handleSocialLogin("google")}
            >
              <img
                src="/images/Google.png"
                alt="Google"
                className="social-icon"
              />
              <span className="social-text">Google로 계속하기</span>
            </button>

            <button
              type="button"
              className="social-login-button"
              onClick={() => handleSocialLogin("naver")}
            >
              <img
                src="/images/Naver.png"
                alt="Naver"
                className="social-icon"
              />
              <span className="social-text">Naver로 계속하기</span>
            </button>

            <button
              type="button"
              className="social-login-button"
              onClick={() => handleSocialLogin("kakao")}
            >
              <img
                src="/images/Kakao.png"
                alt="Kakao"
                className="social-icon"
              />
              <span className="social-text">카카오톡으로 계속하기</span>
            </button>
          </div>

          <div className="register-link-wrapper">
            <span className="register-text">계정이 없나요?</span>{" "}
            <Link to="/register" className="register-link">
              OurLog에 가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;