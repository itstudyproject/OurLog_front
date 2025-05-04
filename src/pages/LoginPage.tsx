import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 자동 로그인 체크 - 페이지 로드 시 실행
  useEffect(() => {
    const savedUser = localStorage.getItem('autoLoginUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.token) {
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
    if (shouldSave) {
      localStorage.setItem('autoLoginUser', JSON.stringify(userData));
    }
    localStorage.setItem('token', userData.token);
    navigate('/');
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 입력 검증
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      new Promise((resolve, reject) => {
        // prettier ignore
        fetch(
          'http://localhost:8080/ourlog/auth/login?email=' +
            email +
            '&password=' +
            password,
          {
            method: 'POST'
          }
        )
          .then(res => res.text())
          .then(token => {
            if (token.startsWith('{"code"')) {
              navigate('/login')
            } else {
              sessionStorage.setItem('token', token)
              sessionStorage.setItem('email', email)
              navigate('/')
            }
          })
          .catch(err => console.log('Error:', err))
      })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    // 실제 애플리케이션에서는 OAuth 인증을 위한 리디렉션이나 팝업 창을 열어야 합니다.
    alert(`${provider} 로그인은 아직 구현되지 않았습니다.`);
  };
  
  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/images/OurLog.png" alt="Logo" className="logo" />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="form-divider">
          {/* 이메일 입력 필드 */}
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
          
          {/* 비밀번호 입력 필드 */}
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
              <button type="submit" className="continue-button">
                계속하기
              </button>
            </div>
            
            {/* 소셜 로그인 버튼 */}
            <button 
              type="button" 
              className="social-login-button" 
              onClick={() => handleSocialLogin('google')}
            >
              <img src="/images/Google.png" alt="Google" className="social-icon" />
              <span className="social-text">Google로 계속하기</span>
            </button>
            
            <button 
              type="button" 
              className="social-login-button" 
              onClick={() => handleSocialLogin('naver')}
            >
              <img src="/images/Naver.png" alt="Naver" className="social-icon" />
              <span className="social-text">Naver로 계속하기</span>
            </button>
            
            <button 
              type="button" 
              className="social-login-button" 
              onClick={() => handleSocialLogin('kakao')}
            >
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 