import React, { useState } from 'react';
import '../styles/AccountDelete.css';

const AccountDelete = () => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [password, setPassword] = useState('');

  const reasons = [
    '기록 삭제하고 싶어요',
    '이용이 불편하고 장애가 많아요',
    '마음에 드는 콘텐츠가 없어요',
    '사용빈도가 낮아요',
    '기타',
  ];

  const handleDelete = () => {
    // 탈퇴 처리 로직 (API 연동 등)
    alert('회원 탈퇴가 처리되었습니다.');
  };

  return (
    <div className="account-delete-container">
      <h1 className="delete-title">회원 탈퇴</h1>
      <div className="warning-banner">
        <span className="icon">⚠️</span>
        <p><strong>회원 탈퇴</strong>로 삭제된 계정과 이용정보는 다시 복구할 수 없으니 신중하게 결정해주세요.</p>
      </div>

      <h2 className="section-title">회원 탈퇴 시 유의사항</h2>
      <ul className="caution-list">
        <li>계정 및 프로필, 콘텐츠와 수익 내역이 모두 삭제돼요.</li>
        <li>댓글, 좋아요 등은 ‘탈퇴한 이용자’로 마스킹돼요.</li>
        <li>팀 채널 글은 삭제되지 않고 소유권이 이전돼요.</li>
        <li>미정산 수익은 즉시 소멸되며 복구가 불가해요.</li>
        <li>출금 내역은 확인할 수 없으니 참고해주세요.</li>
      </ul>

      <h2 className="section-title">회원 탈퇴 사유</h2>
      <div className="reason-options">
        {reasons.map((r) => (
          <label key={r} className="reason-label">
            <input
              type="radio"
              name="reason"
              value={r}
              onChange={() => setReason(r)}
              checked={reason === r}
            />
            {r}
            {r === '기타' && reason === '기타' && (
              <input
                type="text"
                className="custom-reason-input"
                placeholder="사유를 입력해주세요"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div className="form-group">
        <label>현재 비밀번호</label>
        <input
          type="password"
          className="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="delete-button" onClick={handleDelete}>
        탈퇴하기
      </button>
    </div>
  );
};

export default AccountDelete;
