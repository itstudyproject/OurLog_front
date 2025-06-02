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
  const [mobile, setMobile] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
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

    if (!currentPw) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
    }
    if (newPw.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
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
  }
  const handleBack = () => {
    navigate("/mypage");
  };
  // userId가 null이면 로그인 요청 메시지 표시 또는 리다이렉트
  if (userId === null) {
    return (
      <div className="account-edit-container">
        <p>회원 정보를 수정하려면 로그인이 필요합니다.</p>
        <button onClick={() => navigate("/login")}>로그인 페이지로 이동</button>
      </div>
    );
  }

  return (
    <div className="account-edit-container">
            <div className="profile-header">
      <h1 className="header-title">회원 정보 수정</h1>
      </div>
      <div className="ae-form-group">
        <label htmlFor='currentPw'>현재 비밀번호</label>
        <input
          type="password"
          id='currentPw'
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />
      </div>
      <div className="ae-form-group">
        <label htmlFor="new-password">새 비밀번호:</label>
        <input
          type="password"
          id="newPw"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />
      </div>
      <div className="ae-form-group">
        <label htmlFor="confirm-password">비밀번호 확인:</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />
      </div>
      <div className="action-buttons">
      <button className="ae-back-button" onClick={handleBack}>취소</button>
      <button className="ae-update-button" onClick={handlePasswordChange}>비밀번호 변경</button>
      </div>
    </div>
  );
};
export default AccountEdit
