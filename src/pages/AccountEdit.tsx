// src/pages/AccountEdit.tsx
import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountEdit.css';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// interface AccountEditProps {
//   onBack: () => void;
// }

interface UserDTO {
  id: number;
  email: string;
}

const AccountEditPage: React.FC = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const userId = stored ? JSON.parse(stored).id : null;
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8080/user/get/${userId}`, { headers: authHeader() })
      .then(res => res.json())
      .then((data: UserDTO) => setEmail(data.email))
      .catch(() => setError("사용자 정보를 불러올 수 없습니다."));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!currentPw || !newPw) {
      setError("비밀번호를 모두 입력해주세요.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8080/user/edit/${userId}`,
        {
          method: "PUT",
          headers: authHeader(),
          body: JSON.stringify({ email, currentPassword: currentPw, newPassword: newPw })
        }
      );
      if (!res.ok) throw new Error();
      navigate(-1);
    } catch {
      setError("회원정보 수정에 실패했습니다.");
    }
  };

  return (
    <div className="account-edit">
      <h2>회원정보 수정</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>이메일</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>현재 비밀번호</label>
        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />

        <label>새 비밀번호</label>
        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />

        <button type="submit">저장</button>
      </form>
    </div>
  );
};

export default AccountEditPage;