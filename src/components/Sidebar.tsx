import React from "react";
import { User } from "../types/User";
import "../styles/SidebarStyles.css";

const Sidebar = ({ user }: { user: User }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img
          src={user.profileImageUrl}
          alt="profile"
          className="profile-image"
        />
        <h2 className="profile-name">{user.nickname}</h2>
        <p className="profile-email">{user.email}</p>
        <div className="profile-stats">
          <span>찜한 ⓘ {user.likedCount}</span>
          <span>찜받은 ⓘ {user.likedByCount}</span>
        </div>
      </div>
      <ul className="menu-list">
        <li className="menu-item">
          <a>프로필 수정</a>
        </li>
        <li className="menu-item">
          <a>계정 설정</a>
        </li>
        <li className="menu-item">
          <a>로그아웃</a>
        </li>
        <li className="menu-item menu-item-error">
          <a>계정 삭제</a>
        </li>
      </ul>
      <button className="register-button">내 글 등록하기</button>
    </aside>
  );
};

export default Sidebar;
