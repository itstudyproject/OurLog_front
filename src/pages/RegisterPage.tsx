import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { createProfile, UserProfileDTO } from '../hooks/profileApi';
import { setToken } from '../utils/auth';
import { checkEmailExists, checkNicknameExists, checkMobileExists, registerUser, UserRegisterDTO } from '../hooks/userApi';
import { debounce } from '../utils/debounce';

// 유효성 검사 상태를 위한 타입
interface ValidationState {
  email: {
    isValid: boolean;
    message: string;
    checking: boolean;
  };
  nickname: {
    isValid: boolean;
    message: string;
    checking: boolean;
  };
  mobile: {
    isValid: boolean;
    message: string;
    checking: boolean;
  };
  name: {
    isValid: boolean;
    message: string;
  };
  password: {
    isValid: boolean;
    message: string;
  };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    fromSocial: false,
    termsAgreed: false,
    privacyAgreed: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 유효성 검사 상태
  const [validation, setValidation] = useState<ValidationState>({
    email: {
      isValid: true,
      message: '',
      checking: false
    },
    nickname: {
      isValid: true,
      message: '',
      checking: false
    },
    mobile: {
      isValid: true,
      message: '',
      checking: false
    },
    name: {
      isValid: true,
      message: ''
    },
    password: {
      isValid: true,
      message: ''
    }
  });

  // 필드별 ref 추가
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);

  // 이메일 유효성 검사 (디바운스 적용)
  const validateEmail = debounce(async (email: string) => {
    if (!email) {
      setValidation(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: '이메일은 필수 입력 항목입니다.',
          checking: false
        }
      }));
      return;
    }
    
    // 기본 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidation(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: '유효한 이메일 형식이 아닙니다.',
          checking: false
        }
      }));
      return;
    }
    
    try {
      setValidation(prev => ({
        ...prev,
        email: {
          ...prev.email,
          checking: true
        }
      }));
      
      const exists = await checkEmailExists(email);
      
      setValidation(prev => ({
        ...prev,
        email: {
          isValid: !exists,
          message: exists ? '이미 사용 중인 이메일입니다.' : '',
          checking: false
        }
      }));
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: '이메일 확인 중 오류가 발생했습니다.',
          checking: false
        }
      }));
    }
  }, 500);

  // 닉네임 유효성 검사 (디바운스 적용)
  const validateNickname = debounce(async (nickname: string) => {
    if (!nickname) {
      setValidation(prev => ({
        ...prev,
        nickname: {
          isValid: false,
          message: '닉네임은 필수 입력 항목입니다.',
          checking: false
        }
      }));
      return;
    }
    
    // 길이 검사
    if (nickname.length < 2 || nickname.length > 20) {
      setValidation(prev => ({
        ...prev,
        nickname: {
          isValid: false,
          message: '닉네임은 2~20자 사이어야 합니다.',
          checking: false
        }
      }));
      return;
    }
    
    // 문자 패턴 검사 (한글, 영문, 숫자만 허용)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]*$/;
    if (!nicknameRegex.test(nickname)) {
      setValidation(prev => ({
        ...prev,
        nickname: {
          isValid: false,
          message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.',
          checking: false
        }
      }));
      return;
    }
    
    try {
      setValidation(prev => ({
        ...prev,
        nickname: {
          ...prev.nickname,
          checking: true
        }
      }));
      
      const exists = await checkNicknameExists(nickname);
      
      setValidation(prev => ({
        ...prev,
        nickname: {
          isValid: !exists,
          message: exists ? '이미 사용 중인 닉네임입니다.' : '',
          checking: false
        }
      }));
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        nickname: {
          isValid: false,
          message: '닉네임 확인 중 오류가 발생했습니다.',
          checking: false
        }
      }));
    }
  }, 500);

  // 이름 유효성 검사
  const validateName = (name: string) => {
    if (!name) {
      setValidation(prev => ({
        ...prev,
        name: {
          isValid: false,
          message: '이름은 필수 입력 항목입니다.'
        }
      }));
      return;
    }
    
    if (name.length < 2 || name.length > 20) {
      setValidation(prev => ({
        ...prev,
        name: {
          isValid: false,
          message: '이름은 2~20자 사이어야 합니다.'
        }
      }));
      return;
    }
    
    setValidation(prev => ({
      ...prev,
      name: {
        isValid: true,
        message: ''
      }
    }));
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    if (!password) {
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: false,
          message: '비밀번호는 필수 입력 항목입니다.'
        }
      }));
      return;
    }
    
    if (password.length < 8 || password.length > 20) {
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: false,
          message: '비밀번호는 8~20자 사이어야 합니다.'
        }
      }));
      return;
    }
    
    // 패턴 검사: 영문자, 숫자, 특수문자 조합
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: false,
          message: '비밀번호는 최소 8자 이상이어야 하며, 영문자, 숫자, 특수문자를 포함해야 합니다.'
        }
      }));
      return;
    }
    
    setValidation(prev => ({
      ...prev,
      password: {
        isValid: true,
        message: ''
      }
    }));
  };

  // 전화번호 유효성 검사 (디바운스 적용)
  const validateMobile = debounce(async (mobile: string) => {
    if (!mobile) {
      setValidation(prev => ({
        ...prev,
        mobile: {
          isValid: false,
          message: '전화번호는 필수 입력 항목입니다.',
          checking: false
        }
      }));
      return;
    }
    
    // 전화번호 형식 검사
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    if (!phoneRegex.test(mobile)) {
      setValidation(prev => ({
        ...prev,
        mobile: {
          isValid: false,
          message: '유효한 전화번호 형식이 아닙니다.',
          checking: false
        }
      }));
      return;
    }
    
    try {
      setValidation(prev => ({
        ...prev,
        mobile: {
          ...prev.mobile,
          checking: true
        }
      }));
      
      const exists = await checkMobileExists(mobile);
      
      setValidation(prev => ({
        ...prev,
        mobile: {
          isValid: !exists,
          message: exists ? '이미 사용 중인 전화번호입니다.' : '',
          checking: false
        }
      }));
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        mobile: {
          isValid: false,
          message: '전화번호 확인 중 오류가 발생했습니다.',
          checking: false
        }
      }));
    }
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 입력 필드에 따른 유효성 검사 실행
    if (name === 'email') {
      validateEmail(value);
    } else if (name === 'nickname') {
      validateNickname(value);
    } else if (name === 'mobile') {
      validateMobile(value);
    } else if (name === 'name') {
      validateName(value);
    } else if (name === 'password') {
      validatePassword(value);
    }
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

    // 필수 입력 항목 검사를 순차적으로 진행
    if (!formData.email) {
      setError('이메일은 필수 입력 항목입니다.');
      emailRef.current?.focus();
      return;
    }

    if (!formData.name) {
      setError('이름은 필수 입력 항목입니다.');
      nameRef.current?.focus();
      return;
    }

    if (!formData.nickname) {
      setError('닉네임은 필수 입력 항목입니다.');
      nicknameRef.current?.focus();
      return;
    }

    if (!formData.password) {
      setError('비밀번호는 필수 입력 항목입니다.');
      passwordRef.current?.focus();
      return;
    }

    if (!formData.confirmPassword) {
      setError('비밀번호 확인은 필수 입력 항목입니다.');
      confirmPasswordRef.current?.focus();
      return;
    }

    if (!formData.mobile) {
      setError('전화번호는 필수 입력 항목입니다.');
      mobileRef.current?.focus();
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      confirmPasswordRef.current?.focus();
      return;
    }

    // 필수 동의사항 확인
    if (!formData.termsAgreed) {
      setError('이용약관에 동의해주세요.');
      termsRef.current?.focus();
      return;
    }

    if (!formData.privacyAgreed) {
      setError('개인정보 처리방침에 동의해주세요.');
      privacyRef.current?.focus();
      return;
    }
    
    // 유효성 검사 순차적으로 진행
    if (!validation.email.isValid) {
      setError(validation.email.message || '이메일 형식이 올바르지 않습니다.');
      emailRef.current?.focus();
      return;
    }
    
    if (!validation.name.isValid) {
      setError(validation.name.message || '이름 형식이 올바르지 않습니다.');
      nameRef.current?.focus();
      return;
    }
    
    if (!validation.nickname.isValid) {
      setError(validation.nickname.message || '닉네임 형식이 올바르지 않습니다.');
      nicknameRef.current?.focus();
      return;
    }
    
    if (!validation.password.isValid) {
      setError(validation.password.message || '비밀번호 형식이 올바르지 않습니다.');
      passwordRef.current?.focus();
      return;
    }
    
    if (!validation.mobile.isValid) {
      setError(validation.mobile.message || '전화번호 형식이 올바르지 않습니다.');
      mobileRef.current?.focus();
      return;
    }
    
    // 유효성 검사 진행 중 체크
    if (validation.email.checking || validation.nickname.checking || validation.mobile.checking) {
      setError('유효성 검사가 진행 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      // 1. 회원가입 요청
      const userData: UserRegisterDTO = {
        email: formData.email,
        name: formData.name,
        nickname: formData.nickname,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        mobile: formData.mobile,
        fromSocial: formData.fromSocial
      };
      
      const userIdResult = await registerUser(userData);
      console.log("회원가입 성공 - 생성된 userId:", userIdResult);
      console.log("프로필에 사용할 userId 값:", userIdResult.userId, "타입:", typeof userIdResult.userId);

      // 3. 회원가입 성공 후 자동 로그인하여 토큰 획득
      try {
        const token = await performLogin(formData.email, formData.password);
        console.log("자동 로그인 완료, 토큰 획득:", token);
        
        // 4. 프로필 정보 생성 시도 (인증 토큰이 있는 상태에서)
        try {
          const defaultProfile: UserProfileDTO = {
            userId: userIdResult.userId,
            nickname: formData.nickname,
            introduction: `안녕하세요, ${formData.nickname}입니다.`,
            email: formData.email,
            name: formData.name,
            followCnt: 0,
            followingCnt: 0,
            originImagePath: '/images/mypage.png',
            thumbnailImagePath: '/images/mypage.png',
          };
          
          await createProfile(defaultProfile, token);
          console.log("기본 프로필 생성 완료");
          
          // 5. 자동 로그인 세션 제거 (사용자가 명시적으로 로그인하도록) - 프로필 생성 성공 후에 제거
          localStorage.removeItem('token');
          
        } catch (profileErr) {
          console.error("프로필 생성 중 오류:", profileErr);
          // 프로필 생성 실패해도 회원가입은 완료된 것으로 처리
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
        
      } catch (loginErr) {
        console.error("자동 로그인 중 오류:", loginErr);
        // 로그인 실패해도 회원가입은 완료됨
      }
      
    } catch (err) {
      console.error("회원가입 실패:", err);
      
      // 오류 메시지 처리
      let errorMessage = '회원가입에 실패했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // 객체 형태의 오류인 경우 (백엔드에서 오류 맵 반환)
        const errorObj = err as Record<string, string>;
        const firstErrorField = Object.keys(errorObj)[0];
        
        if (firstErrorField && errorObj[firstErrorField]) {
          errorMessage = errorObj[firstErrorField];
          
          // 해당 필드에 포커스
          switch (firstErrorField) {
            case 'email':
              emailRef.current?.focus();
              break;
            case 'name':
              nameRef.current?.focus();
              break;
            case 'nickname':
              nicknameRef.current?.focus();
              break;
            case 'password':
              passwordRef.current?.focus();
              break;
            case 'passwordConfirm':
              confirmPasswordRef.current?.focus();
              break;
            case 'mobile':
              mobileRef.current?.focus();
              break;
            default:
              break;
          }
        }
      }
      
      setError(errorMessage);
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
              className={`form-input ${!validation.email.isValid ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              ref={emailRef}
            />
            {validation.email.checking && <div className="validation-message checking">이메일 확인 중...</div>}
            {!validation.email.isValid && <div className="validation-message error">{validation.email.message}</div>}
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
              className={`form-input ${!validation.name.isValid ? 'input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              ref={nameRef}
            />
            {!validation.name.isValid && <div className="validation-message error">{validation.name.message}</div>}
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
              className={`form-input ${!validation.nickname.isValid ? 'input-error' : ''}`}
              value={formData.nickname}
              onChange={handleChange}
              ref={nicknameRef}
            />
            {validation.nickname.checking && <div className="validation-message checking">닉네임 확인 중...</div>}
            {!validation.nickname.isValid && <div className="validation-message error">{validation.nickname.message}</div>}
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
              placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8~20자)"
              className={`form-input ${!validation.password.isValid ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              ref={passwordRef}
            />
            {!validation.password.isValid && <div className="validation-message error">{validation.password.message}</div>}
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
              className={`form-input ${formData.password !== formData.confirmPassword && formData.confirmPassword ? 'input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              ref={confirmPasswordRef}
            />
            {formData.password !== formData.confirmPassword && formData.confirmPassword && 
              <div className="validation-message error">비밀번호가 일치하지 않습니다.</div>
            }
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
              placeholder="전화번호 (예: 010-1234-5678)"
              className={`form-input ${!validation.mobile.isValid ? 'input-error' : ''}`}
              value={formData.mobile}
              onChange={handleChange}
              ref={mobileRef}
            />
            {validation.mobile.checking && <div className="validation-message checking">전화번호 확인 중...</div>}
            {!validation.mobile.isValid && <div className="validation-message error">{validation.mobile.message}</div>}
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
                ref={termsRef}
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
                ref={privacyRef}
              />
              <label htmlFor="privacyAgreed">
                <Link to="/privacy-policy" className="terms-link">개인정보 처리방침</Link>에 동의합니다. (필수)
              </label>
            </div>
          </div>
          
          <div className="social-buttons-container">
            {/* 가입하기 버튼 */}
            <div className="continue-button-wrapper">
              <button 
                type="submit" 
                className="continue-button"
                disabled={!validation.email.isValid || !validation.nickname.isValid || !validation.mobile.isValid ||
                        !validation.name.isValid || !validation.password.isValid ||
                        validation.email.checking || validation.nickname.checking || validation.mobile.checking ||
                        formData.password !== formData.confirmPassword}
              >
                가입하기
              </button>
            </div>
            
            {/* 소셜 로그인 버튼 */}
            <button 
              type="button" 
              className="social-login-button"
              onClick={() => {
                setFormData(prev => ({ ...prev, fromSocial: true }));
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
                setFormData(prev => ({ ...prev, fromSocial: true }));
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
                setFormData(prev => ({ ...prev, fromSocial: true }));
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