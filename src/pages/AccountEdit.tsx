// src/pages/AccountEdit.tsx

import React, { useState } from 'react';
import '../styles/AccountEdit.css';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

interface AccountEditProps {
  onBack: () => void;
}

const AccountEdit: React.FC<AccountEditProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('xoxo');
  const [email] = useState('xoxo@example.com');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setMessage('비밀번호가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      setMessage('비밀번호 변경 실패.');
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/update-phone', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ phone })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setMessage('연락처가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      setMessage('연락처 변경 실패.');
    }
  };

  return (
    <div className="account-edit-container">
      <div className="header-row">
        <h1 className="title">회원정보수정</h1>
        {/* <button onClick={onBack} className="back-button">
          <ArrowLeftIcon />
          뒤로가기
        </button> */}
      </div>

      <form className="form-grid" onSubmit={e => e.preventDefault()}>
        <div className="form-group">
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <button
            type="button"
            className="primary-button"
            onClick={handlePasswordChange}
          >
            비밀번호 변경하기
          </button>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={email} disabled />
        </div>

        <div className="form-group full-width">
          <label>연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <button
            type="button"
            className="secondary-button"
            onClick={handlePhoneUpdate}
          >
            연락처 변경하기
          </button>
        </div>

        {message && (
          <div className="form-group full-width">
            <p className="message">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AccountEdit;
