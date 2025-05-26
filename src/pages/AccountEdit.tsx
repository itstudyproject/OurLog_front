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

interface AccountEditProps {
  // userId: number | null; // ✅ MyPage에서 prop으로 받지 않고 localStorage에서 직접 가져옵니다.
}

const AccountEdit: React.FC<AccountEditProps> = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ localStorage에서 userId를 직접 가져옵니다.
  const stored = localStorage.getItem("user");
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  const handlePasswordChange = async () => {
    if (userId === null) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
        alert("비밀번호는 8자 이상이어야 합니다.");
        return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
      }

      const response = await fetch(
        `http://localhost:8080/ourlog/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
              ...headers,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ newPassword: password }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("비밀번호 변경 실패 응답:", errorText);
        alert(`비밀번호 변경 실패: ${errorText || "서버 오류"}`);
        return;
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setPassword("");
      setConfirmPassword("");
      // 변경 후 마이페이지 또는 로그인 페이지로 이동
      navigate("/mypage");

    } catch (error) {
      console.error("비밀번호 변경 요청 중 오류 발생:", error);
      alert(
        `비밀번호 변경 요청 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

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
      <h3>회원 정보 수정</h3>
      <div className="form-group">
        <label htmlFor="new-password">새 비밀번호:</label>
        <input
          type="password"
          id="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirm-password">비밀번호 확인:</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button className="update-button" onClick={handlePasswordChange}>비밀번호 변경</button>
      <button className="back-button" onClick={handleBack}>뒤로가기</button>
    </div>
  );
};

export default AccountEdit;
