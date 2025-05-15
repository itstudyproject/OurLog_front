import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';
import '../styles/AccountEdit.css';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const AccountEdit: React.FC = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const userId = stored ? JSON.parse(stored).id : null;

  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // 필요시 표시
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8080/ourlog/user/get/${userId}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        setEmail(data.email);
        setName(data.name || '');
        setPhone(data.phone || '');
      })
      .catch(() => setMessage(' 사용자 정보를 불러올 수 없습니다.'));
  }, [userId]);

const handlePasswordChange = async () => {
  if (newPw !== confirmPw) {
    alert(' 새 비밀번호가 일치하지 않습니다.');
    return;
  }
  try {
    const res = await fetch(`http://localhost:8080/user/edit/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, currentPassword: currentPw, newPassword: newPw })
    });
    if (!res.ok) throw new Error();
    alert(' 비밀번호가 변경되었습니다.');
  } catch {
    alert(' 비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
  }
};

const handlePhoneUpdate = async () => {
  try {
    const res = await fetch(`http://localhost:8080/user/edit-phone/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone })
    });
    if (!res.ok) throw new Error();
    alert(' 연락처가 변경되었습니다.');
  } catch {
    alert(' 연락처 변경에 실패했습니다. 다시 시도해주세요.');
  }
};


  return (
    <div className="account-edit-container">
      <div className="header-row">
        <h1 className="title">회원정보 수정</h1>
        {/* <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeftIcon /> 뒤로가기
        </button> */}
      </div>

      <form className="form-grid">
        <div className="form-group">
          <label>현재 비밀번호</label>
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        </div>

        <div className="form-group">
          <label>새 비밀번호</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
        </div>

        <div className="form-group full-width">
          <label>새 비밀번호 확인</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
        </div>

        <div className="form-group full-width">
          <button type="button" className="primary-button" onClick={handlePasswordChange}>
            비밀번호 변경하기
          </button>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input type="text" value={name} disabled />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={email} disabled />
        </div>

        <div className="form-group full-width">
          <label>연락처</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div className="form-group full-width">
          <button type="button" className="secondary-button" onClick={handlePhoneUpdate}>
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
