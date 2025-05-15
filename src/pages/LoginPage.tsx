import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { setToken } from "../utils/auth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 로그인되어 있는지 확인
    const token = localStorage.getItem("token");
    
    if (token) {
      navigate("/");
      return;
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
              userId: userData.userId || userData.id,
              profileImage: userData.profileImage || "/images/mypage.png",
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
  }, [navigate]);

  const handleLoginSuccess = (userData: any, shouldSave: boolean) => {
    if (shouldSave) {
      localStorage.setItem("autoLoginUser", JSON.stringify(userData));
    }

    setToken(userData.token);
    
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: userData.email,
        userId: userData.userId || userData.id,
        profileImage: userData.profileImage || "/images/mypage.png",
      })
    );
    
    // 로그인 알림 표시를 위한 플래그 설정
    sessionStorage.setItem("loginEvent", "true");
    window.dispatchEvent(new Event("login"));
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 1. 로그인 요청
      const loginResponse = await fetch(
        `http://localhost:8080/ourlog/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // 2. 토큰 추출
      const tokenText = await loginResponse.text();
      
      if (tokenText.startsWith('{"code"')) {
        setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        return;
      }

      const token = tokenText.trim();
      setToken(token);

      // 3. 토큰으로 사용자 정보 요청
      const userResponse = await fetch(`http://localhost:8080/ourlog/user/get?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!userResponse.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
      }

      const userInfo = await userResponse.json();
      console.log("사용자 정보:", userInfo);

      // 4. 사용자 정보 저장 및 로그인 처리
      const userData = {
        email: email,
        userId: userInfo.id || userInfo.userId,
        token: token,
        profileImage: userInfo.profileImage || "/images/mypage.png",
      };
      
      handleLoginSuccess(userData, autoLogin);
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSocialLogin = (provider: "google" | "naver" | "kakao") => {
    alert(`${provider} 로그인은 아직 구현되지 않았습니다.`);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/images/OurLog.png" alt="Logo" className="logo" />

        {error && <div className="error-message">{error}</div>}

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
              required
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
              required
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
