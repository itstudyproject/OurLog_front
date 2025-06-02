import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, removeToken } from '../utils/auth';
import '../styles/AccountDelete.css';

interface AccountDeleteProps {
  // userId: number | null; // ✅ MyPage에서 prop으로 받지 않고 localStorage에서 직접 가져옵니다.
}

const AccountDelete: React.FC<AccountDeleteProps> = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

   // ✅ localStorage에서 userId를 직접 가져옵니다.
  const stored = localStorage.getItem("user");
  const userId = stored ? (JSON.parse(stored).userId as number) : null;

  const handleDeleteAccount = async () => {
    if (userId === null) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const confirmDelete = window.confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmDelete) return;

    try {
       const headers = getAuthHeaders();
       if (!headers) {
           alert("로그인이 필요합니다.");
           navigate("/login");
           return;
       }

      const response = await fetch(`http://localhost:8080/ourlog/users/${userId}`, {
        method: 'DELETE',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
      });

      if (!response.ok) {
         const errorText = await response.text();
         console.error("회원 탈퇴 실패 응답:", errorText);
         alert(`회원 탈퇴 실패: ${errorText || "서버 오류"}`);
         return;
      }

      // 회원 탈퇴 성공 시 로컬 스토리지에서 토큰 및 사용자 정보 제거
      removeToken();
      localStorage.removeItem('user');

      alert('회원 탈퇴가 성공적으로 완료되었습니다.');
      navigate('/'); // 메인 페이지로 이동

    } catch (error) {
      console.error('회원 탈퇴 요청 중 오류 발생:', error);
       alert(`회원 탈퇴 요청 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  // userId가 null이면 로그인 요청 메시지 표시 또는 리다이렉트
   if (userId === null) {
       return (
           <div className="account-delete-container">
               <p>회원 탈퇴는 로그인 후에 가능합니다.</p>
               <button onClick={() => navigate("/login")}>로그인 페이지로 이동</button>
           </div>
       );
   }

  return (
    <div className="account-delete-container">
      <h3>회원 탈퇴</h3>
      <p>회원 탈퇴를 위해 비밀번호를 입력해주세요.</p>
      <div className="form-group">
        <label htmlFor="password">비밀번호:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="delete-button" onClick={handleDeleteAccount}>회원 탈퇴</button>
      <button className="back-button" onClick={handleBack}>뒤로가기</button>
    </div>
  );
};

export default AccountDelete;
