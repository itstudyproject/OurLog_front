import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginPage.css';

const SignupPage: React.FC = () => {
  return (
    <div className="signup-container">
      <div className="login-form">
        {/* 회원가입 헤더 */}
        <img src="/images/OurLog.png" alt="Logo" className="logo" />
        {/* <h1 className="login-title">
          OurLog에 가입하기
        </h1> */}
        
        <div className="form-divider">
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
            />
          </div>
          
          {/* 사용자 이름 입력 필드 */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              사용자 이름
            </label>
            <input
              id="username"
              type="text"
              placeholder="사용자 이름"
              className="form-input"
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
            />
          </div>
          
          {/* 비밀번호 확인 입력 필드 */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              className="form-input"
            />
          </div>
          
        <div className="social-buttons-container">
          {/* 가입하기 버튼 */}
          <div className="continue-button-wrapper">
            <button className="continue-button">
              가입하기
            </button>
          </div>
                  {/* 소셜 로그인 버튼 */}
          <button className="social-login-button">
            <img src="/images/Google.png" alt="Google" className="social-icon" />
            <span className="social-text">Google로 계속하기</span>
          </button>
          
          <button className="social-login-button">
            <img src="/images/Naver.png" alt="Naver" className="social-icon" />
            <span className="social-text">Naver로 계속하기</span>
          </button>
          
          <button className="social-login-button">
            <img src="/images/Kakao.png" alt="Kakao" className="social-icon" />
            <span className="social-text">카카오톡으로 계속하기</span>
          </button>
        </div>
          
          {/* 로그인 링크 */}
          <div className="signup-link-wrapper">
            <span className="signup-text">이미 계정이 있나요?</span>{' '}
            <Link to="/login" className="signup-link">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 