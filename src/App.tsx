import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import WorkerPage from "./pages/WorkerPage";
import MyPage from "./pages/MyPage";
import PostList from "./pages/Post/PostList";
import PostRegister from "./pages/Post/PostRegister";
import ArtList from "./pages/Art/ArtList";
import ArtDetail from "./pages/Art/ArtDetail";
import ChatPage from "./pages/ChatPage";
// import Header from './layouts/Header';

function App() {
  return (
    <Routes>
      {/* 메인 레이아웃을 사용하는 페이지들 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<WorkerPage />} />
      </Route>

      {/* 별도 레이아웃을 사용하는 페이지들 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/board/:boardId" element={<PostList />} />
      <Route path="mypage" element={<MyPage />} />
      {/* <Route path="worker" element={<WorkerPage />} /> */}
      <Route path="/chat" element={<ChatPage />} /> {/* 👈 등록 */}
      <Route path="post">
        <Route index element={<PostList />} />
        <Route path="register" element={<PostRegister />} />

      </Route>
      <Route path="/Art/:id" element={<ArtDetail />} />
    </Routes>
  );
}
export default App;
