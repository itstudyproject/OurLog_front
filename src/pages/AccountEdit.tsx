import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/auth';
import { updateUserInfo, UserDTO } from "../hooks/userApi";
import '../styles/AccountEdit.css';
import { useNavigate } from 'react-router-dom';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const AccountEdit: React.FC = () => {
  const stored = localStorage.getItem("user");
  const userId = stored ? JSON.parse(stored).userId as number : null;
  const [mobile,    setMobile]    = useState("");
  const [currentPw,setCurrentPw]= useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confirmPw,setConfirmPw]= useState("");
  const navigate = useNavigate();

useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8080/ourlog/profile/get/${userId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json() as Promise<UserDTO>)
      .then((data) => setMobile(data.mobile || ""))
      .catch(() => alert("사용자 정보를 불러올 수 없습니다."));
  }, [userId]);

const handlePasswordChange = async () => {
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!userId) return;
    try {
      await updateUserInfo(userId, { password: newPw, mobile: mobile });
      alert("비밀번호가 변경되었습니다.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      navigate("/mypage")
    } catch (e: any) {
      alert("비밀번호 변경 실패: " + (e.message || e));
    }
  };

  return (
    <div className="account-edit-container">
            <div className="account-edit-header">
        <h1 className="header-title">회원정보수정</h1>
      </div>
      {/* 비밀번호 변경 섹션 */}
      <div className="form-group">
        <label htmlFor='currentPw'>현재 비밀번호</label>
        <input
          type="password"
          id='currentPw'
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor='newPw'>새 비밀번호</label>
        <input
          type="password"
          id='newPw'
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPw">새 비밀번호 확인</label>
        <input
          type="password"
          value={confirmPw}
          id="confirmPw"
          onChange={(e) => setConfirmPw(e.target.value)}
        />
      </div>

      {/* 연락처 변경 섹션 */}
      <div className="form-group">
        <label htmlFor="mobile">연락처</label>
        <input
          type="tel"
          id="mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </div>
      <button className="secondary-button" onClick={handlePasswordChange}>
        변경하기
      </button>
    </div>
  );
};

export default AccountEdit;
