// 토큰 관리를 위한 유틸리티 함수들

// 토큰 저장
export const setToken = (token: string) => {
  if (!token) return;
  localStorage.setItem('token', token.trim());
};

// 토큰 가져오기
export const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token.trim()}` : '';
};

// 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('token');
};

// 토큰 존재 여부 확인
export const hasToken = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// API 요청을 위한 기본 헤더 생성
export const getAuthHeaders = () => {
  return {
    'Authorization': getToken(),
    'Content-Type': 'application/json',
  };
}; 