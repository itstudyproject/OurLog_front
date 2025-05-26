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

  useEffect(() => {
    // URL에서 소셜 로그인 토큰 및 이메일 확인 로직 제거
    // const params = new URLSearchParams(location.search);
    // const socialToken = params.get("token");
    // const socialEmail = params.get("email");

    // 소셜 로그인 처리 로직 제거
    // if (socialToken && socialEmail) {
    //   console.log("소셜 로그인 토큰 감지:", socialToken.substring(0, 20) + '...');
    //   console.log("소셜 로그인 이메일 감지:", socialEmail);
    //   navigate(location.pathname, { replace: true });
    //   fetchUserDataAndLogin(socialToken, socialEmail);
    // } else {
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
        } else {
           setError("로그인 처리 중 알 수 없는 오류가 발생했습니다.");
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

      // 4. 사용자 프로필 확인 및 없으면 생성 (일반 로그인 후 프로필 생성 로직은 LoginPage에 유지)
      let profileId: number | null = null;
      // fetchProfile, createProfile 함수는 필요에 따라 LoginPage에 유지하거나 별도 유틸로 분리 가능
      // 현재는 fetchUserDataAndLogin에서만 호출되므로 SocialLoginHandler로 이동하는 것이 좋음
      // 만약 일반 로그인 후에도 프로필 생성/확인 로직이 필요하다면 여기에 유지해야 함.
      // 현재 구조상 fetchUserDataAndLogin만 이 함수들을 호출하므로 SocialLoginHandler로 이동하는 것이 맞습니다.
      // 아래 checkAndCreateProfile 호출 부분도 제거해야 합니다.
      // if (userInfo.userId) {
      //   profileId = await checkAndCreateProfile(userInfo.userId, userInfo);
      // }

       // 5. 사용자 정보 저장 및 로그인 처리 (일반 로그인용 handleLoginSuccess 로직)
       const userData = {
        email: email,
        userId: userInfo.userId,
        token: token,
        profileImage: userInfo.profileImage || "/images/mypage.png",
        // profileId: userData.profileId // checkAndCreateProfile 호출 제거 시 이 부분도 수정
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
          // profileId: userData.profileId // 프로필 ID가 필요하다면 여기도 수정
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