import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { createProfile, UserProfileDTO } from '../hooks/profileApi';
import { setToken } from '../utils/auth';

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
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 로그인 처리 함수
  const performLogin = async (email: string, password: string): Promise<string> => {
    try {
      const loginResponse = await fetch(
        `http://localhost:8080/ourlog/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const tokenText = await loginResponse.text();
      
      if (tokenText.startsWith('{"code"')) {
        throw new Error("로그인에 실패했습니다.");
      }

      const token = tokenText.trim();
      setToken(token);
      return token;
    } catch (err) {
      console.error("자동 로그인 처리 중 오류:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      // 1. 회원가입 요청
      const registerResponse = await fetch('http://localhost:8080/ourlog/user/register', {
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

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      // 2. 회원가입 응답에서 ID 추출
      const userId = await registerResponse.json();
      console.log("회원가입 성공 - 생성된 userId:", userId);

      // 3. 회원가입 성공 후 자동 로그인하여 토큰 획득
      try {
        const token = await performLogin(formData.email, formData.password);
        console.log("자동 로그인 완료, 토큰 획득:", token);
        
        // 4. 프로필 정보 생성 시도 (인증 토큰이 있는 상태에서)
        try {
          const defaultProfile: UserProfileDTO = {
            user: userId,
            nickname: formData.nickname,
            introduction: `안녕하세요, ${formData.nickname}입니다.`,
            email: formData.email,
            name: formData.name,
            location: '',
            website: '',
            originImagePath: '/images/mypage.png',
            thumbnailImagePath: '/images/mypage.png',
          };
          
          await createProfile(defaultProfile);
          console.log("기본 프로필 생성 완료");
        } catch (profileErr) {
          console.error("프로필 생성 중 오류:", profileErr);
          // 프로필 생성 실패해도 회원가입은 완료된 것으로 처리
        }

        // 5. 자동 로그인 세션 제거 (사용자가 명시적으로 로그인하도록)
        localStorage.removeItem('token');
        
      } catch (loginErr) {
        console.error("자동 로그인 중 오류:", loginErr);
        // 로그인 실패해도 회원가입은 완료됨
      }
      
      // 회원가입 성공 후 메시지 표시하고 로그인 페이지로 즉시 이동
      setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      
      // 1초 후 로그인 페이지로 이동 (사용자가 성공 메시지를 볼 수 있도록 짧은 딜레이 적용)
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: '회원가입이 완료되었습니다. 로그인해 주세요.' 
          } 
        });
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="register-container">
      <div className="login-form">
        {/* 회원가입 헤더 */}
        <img src="/images/OurLog.png" alt="Logo" className="logo" />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
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