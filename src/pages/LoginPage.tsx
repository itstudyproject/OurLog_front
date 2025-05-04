import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const navigate = useNavigate();

  // 자동 로그인 체크 - 페이지 로드 시 실행
  useEffect(() => {
    const savedUser = localStorage.getItem('autoLoginUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // 실제 환경에서는 토큰 검증 등의 과정이 필요합니다
        if (userData.token) {
          // 자동 로그인 처리
          handleLoginSuccess(userData, false);
        }
      } catch (error) {
        console.error('자동 로그인 처리 중 오류 발생:', error);
        localStorage.removeItem('autoLoginUser');
      }
    }
  }, []);

  // 로그인 성공 처리
  const handleLoginSuccess = (userData: any, shouldSave: boolean) => {
    // 실제 애플리케이션에서는 상태 관리 라이브러리(Redux, Context API 등)를 사용하여
    // 사용자 상태를 전역적으로 관리하는 것이 좋습니다.
    
    // 자동 로그인 정보 저장
    if (shouldSave) {
      localStorage.setItem('autoLoginUser', JSON.stringify(userData));
    }
    
    // 로그인 후 메인 페이지로 이동
    navigate('/');
  };

  // 로그인 처리
  const handleLogin = () => {
    // 입력 검증
    if (!username || !password) {
      alert('사용자 이름과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 실제 애플리케이션에서는 여기서 API 호출을 통해 로그인 검증을 수행합니다.
    // 예시 코드입니다.
    const mockApiCall = () => {
      return new Promise<{username: string, token: string}>((resolve) => {
        setTimeout(() => {
          resolve({
            username,
            token: 'mock-token-123456789'
          });
        }, 500);
      });
    };

    // 로그인 API 호출
    mockApiCall()
      .then(userData => {
        handleLoginSuccess(userData, autoLogin);
      })
      .catch(error => {
        console.error('로그인 실패:', error);
        alert('로그인에 실패했습니다. 사용자 이름과 비밀번호를 확인해주세요.');
      });
  };

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    // 실제 애플리케이션에서는 OAuth 인증을 위한 리디렉션이나 팝업 창을 열어야 합니다.
    alert(`${provider} 로그인은 아직 구현되지 않았습니다.`);
  };
  
  return (
    <div className="login-container">
      <div className="login-form">
        {/* 로그인 헤더 */}
        <img src="/images/OurLog.png" alt="Logo" className="logo" />
        {/* <h1 className="login-title">
          OurLog에 로그인하기
        </h1> */}


        
        <div className="form-divider">
          {/* 이메일/사용자 이름 입력 필드 */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              이메일 또는 사용자 이름
            </label>
            <input
              id="username"
              type="text"
              placeholder="이메일 또는 사용자 이름"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          
          {/* 자동 로그인 체크박스 */}
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
            {/* 계속하기 버튼 */}
            <div className="continue-button-wrapper">
              <button className="continue-button" onClick={handleLogin}>
                계속하기
              </button>
            </div>
                  {/* 소셜 로그인 버튼 */}
            <button className="social-login-button" onClick={() => handleSocialLogin('google')}>
              <img src="/images/Google.png" alt="Google" className="social-icon" />
              <span className="social-text">Google로 계속하기</span>
            </button>
            
            <button className="social-login-button" onClick={() => handleSocialLogin('naver')}>
              <img src="/images/Naver.png" alt="Naver" className="social-icon" />
              <span className="social-text">Naver로 계속하기</span>
            </button>
            
            <button className="social-login-button" onClick={() => handleSocialLogin('kakao')}>
              <img src="/images/Kakao.png" alt="Kakao" className="social-icon" />
              <span className="social-text">카카오톡으로 계속하기</span>
            </button>
          </div>
          
          {/* 회원가입 링크 */}
          <div className="register-link-wrapper">
            <span className="register-text">계정이 없나요?</span>{' '}
            <Link to="/register" className="register-link">
              OurLog에 가입하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 