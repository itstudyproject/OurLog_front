import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import WorkerPage from "./pages/WorkerPage";
import MyPage from "./pages/MyPage";
import PostList from "./pages/Post/PostList";
import PostRegister from "./pages/Post/PostRegister";
import TermsCondition from "./pages/TermsCondition";
import CustomerCenter from "./pages/CustomerCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DeleteAccountPage from "./pages/DeleteAccountPage";
import ArtList from "./pages/Art/ArtList";
import RankingPage from "./pages/Ranking/RankingPage";
// import Header from './layouts/Header';
function App() {
  return (
    <Routes>
      {/* 메인 레이아웃을 사용하는 페이지들 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="terms-condition" element={<TermsCondition />} />
        <Route path="customer-center" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="art">
          <Route index element={<ArtList />} />
        </Route>
        <Route path="ranking" element={<RankingPage />} />
      </Route>

      {/* 별도 레이아웃을 사용하는 페이지들 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/board/:boardId" element={<PostList />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/worker" element={<WorkerPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />
      <Route path="/PostList">
        <Route index element={<PostList />} />
        <Route path="/PostList/Postregister" element={<PostRegister />} />
      </Route>
    </Routes>
  );
}
export default App;
