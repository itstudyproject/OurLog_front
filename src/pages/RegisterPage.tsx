import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    from_social: false,
    termsAgreed: false,
    privacyAgreed: false
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 동의사항 확인
    if (!formData.termsAgreed || !formData.privacyAgreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/ourlog/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          nickname: formData.nickname,
          password: formData.password,
          mobile: formData.mobile,
          from_social: formData.from_social
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      // 성공 시 로그인 페이지로 이동
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="register-container">
      <div className="login-form">
        {/* 회원가입 헤더 */}
        <img src="/images/OurLog.png" alt="Logo" className="logo" />
        {/* <h1 className="login-title">
          OurLog에 가입하기
        </h1> */}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-divider">
          {/* 이메일 입력 필드 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="이메일 주소"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* 이름 입력 필드 */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="이름"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* 닉네임 입력 필드 */}
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="닉네임"
              className="form-input"
              value={formData.nickname}
              onChange={handleChange}
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
              name="password"
              type="password"
              placeholder="비밀번호"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* 비밀번호 확인 입력 필드 */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* 전화번호 입력 필드 */}
          <div className="form-group">
            <label htmlFor="mobile" className="form-label">
              전화번호
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="전화번호"
              className="form-input"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* 약관 동의 */}
          <div className="terms-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="termsAgreed"
                name="termsAgreed"
                checked={formData.termsAgreed}
                onChange={handleChange}
                required
              />
              <label htmlFor="termsAgreed">
                <Link to="/terms-condition" className="terms-link">이용약관</Link>에 동의합니다. (필수)
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="privacyAgreed"
                name="privacyAgreed"
                checked={formData.privacyAgreed}
                onChange={handleChange}
                required
              />
              <label htmlFor="privacyAgreed">
                <Link to="/privacy-policy" className="terms-link">개인정보 처리방침</Link>에 동의합니다. (필수)
              </label>
            </div>
          </div>
          
          <div className="social-buttons-container">
            {/* 가입하기 버튼 */}
            <div className="continue-button-wrapper">
              <button type="submit" className="continue-button">
                가입하기
              </button>
            </div>
            
            {/* 소셜 로그인 버튼 */}
            <button 
              type="button" 
              className="social-login-button"
              onClick={() => {
                setFormData(prev => ({ ...prev, from_social: true }));
                // 소셜 로그인 처리 로직 추가
              }}
            >
              <img src="/images/Google.png" alt="Google" className="social-icon" />
              <span className="social-text">Google로 계속하기</span>
            </button>
            
            <button 
              type="button" 
              className="social-login-button"
              onClick={() => {
                setFormData(prev => ({ ...prev, from_social: true }));
                // 소셜 로그인 처리 로직 추가
              }}
            >
              <img src="/images/Naver.png" alt="Naver" className="social-icon" />
              <span className="social-text">Naver로 계속하기</span>
            </button>
            
            <button 
              type="button" 
              className="social-login-button"
              onClick={() => {
                setFormData(prev => ({ ...prev, from_social: true }));
                // 소셜 로그인 처리 로직 추가
              }}
            >
              <img src="/images/Kakao.png" alt="Kakao" className="social-icon" />
              <span className="social-text">카카오톡으로 계속하기</span>
            </button>
          </div>
          
          {/* 로그인 링크 */}
          <div className="register-link-wrapper">
            <span className="register-text">이미 계정이 있나요?</span>{' '}
            <Link to="/login" className="register-link">
              로그인하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 