import React from "react";
import { User } from "../types/User";

const Sidebar = ({ user }: { user: User }) => {
  return (
    <aside className="menu p-4 w-72 bg-base-100 text-base-content">
      <div className="flex flex-col items-center mb-6">
        <img
          src={user.profileImageUrl}
          alt="profile"
          className="w-24 h-24 rounded-full mb-2"
        />
        <h2 className="text-xl font-semibold">{user.nickname}</h2>
        <p className="text-sm">{user.email}</p>
        <div className="mt-2 text-sm space-x-2">
          <span>찜한 ⓘ {user.likedCount}</span>
          <span>찜받은 ⓘ {user.likedByCount}</span>
        </div>
      </div>
      <ul className="menu">
        <li>
          <a>프로필 수정</a>
        </li>
        <li>
          <a>계정 설정</a>
        </li>
        <li>
          <a>로그아웃</a>
        </li>
        <li>
          <a className="text-error">계정 삭제</a>
        </li>
      </ul>
      <button className="btn btn-outline mt-4">내 글 등록하기</button>
    </aside>
  );
};

export default Sidebar;
