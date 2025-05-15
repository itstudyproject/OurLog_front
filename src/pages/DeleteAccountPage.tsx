import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DeleteAccountPage.css';

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/ourlog/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT 토큰
        },
        body: JSON.stringify({
          password,
          confirmText,
          isChecked
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
      }

      // 성공 시 처리
      localStorage.removeItem('token'); // 토큰 삭제
      localStorage.removeItem('user'); // 사용자 정보 삭제
      localStorage.removeItem('autoLoginUser'); // 자동 로그인 정보 삭제
      
      // 로그아웃 이벤트 발생
      window.dispatchEvent(new Event('logout'));
      
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/'); // 홈페이지로 이동
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다.');
    }
  };

  return (
    <div className="delete-account-container">
      <div className="delete-account-card">
        <h2 className="delete-account-title">회원 탈퇴</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="delete-account-warning">
          <svg className="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="warning-text">회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</span>
        </div>

        <form onSubmit={handleSubmit} className="delete-account-form">
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">확인 문구 입력</label>
            <input
              type="text"
              placeholder="'회원탈퇴'를 입력해주세요"
              className="form-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="deleteAgreement"
              className="checkbox-input"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label htmlFor="deleteAgreement" className="checkbox-label">
              위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다.
            </label>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button
              type="submit"
              className="delete-button"
              disabled={!isChecked || confirmText !== '회원탈퇴'}
            >
              회원 탈퇴
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountPage; 