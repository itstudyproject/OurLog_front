import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import WorkerPage from "./pages/WorkerPage";
import MyPage from "./pages/MyPage";
import PostList from "./pages/Post/PostList";
import PostDetail from "./pages/Post/PostDetail";
import PostRegister from "./pages/Post/PostRegister";
// import Header from './layouts/Header';
import TermsCondition from "./pages/TermsCondition";
import CustomerCenter from "./pages/CustomerCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RankingPage from "./pages/Ranking/RankingPage";
import Payment from "./pages/Art/Payment";
import PostModify from "./pages/Post/PostModify";
import ArtDetail from "./pages/Art/ArtDetail";
import BidHistory from "./pages/Art/BidHistory";
import RegisterPage from "./pages/RegisterPage";
import ArtList from "./pages/Art/ArtList";
import ArtRegister from "./pages/Art/ArtRegister";
import SearchPage from "./pages/SearchPage";
import PurchaseBidPage from "./pages/PurchaseBidPage/PurchaseBidPage";
import SalePage from "./pages/SalePage/SalePage";
import BookmarkPage from "./pages/BookmarkPage";
import AccountEditPage from "./pages/AccountEdit";
import ProfileEditPage from "./pages/ProfileEdit";
import AccountEdit from "./pages/AccountEdit";
import AccountDelete from "./pages/AccountDelete";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="terms-condition" element={<TermsCondition />} />
        <Route path="customer-center" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="art">
          <Route index element={<ArtList />} />
          <Route path=":id" element={<ArtDetail />} />
          <Route path="register" element={<ArtRegister />} />
          <Route path="payment/:id" element={<Payment />} />
          <Route path="bids" element={<BidHistory />} />
        </Route>

        <Route path="ranking" element={<RankingPage />} />

        <Route path="mypage/*" element={<MyPage />} />
        <Route path="worker/:userId" element={<WorkerPage />} />
        {/*<Route path="worker" element={<WorkerPage />} />*/}

        <Route path="post">
          <Route index element={<PostList />} />
          <Route path="news" element={<PostList />} />
          <Route path="free" element={<PostList />} />
          <Route path="promotion" element={<PostList />} />
          <Route path="request" element={<PostList />} />
          <Route path=":id" element={<PostDetail />} />
          <Route path="Register" element={<PostRegister />} />
          <Route path="postModify/:id" element={<PostModify />} />
        </Route>
      </Route>

      {/* 별도 레이아웃을 사용하는 페이지들 */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/board/:boardId" element={<PostList />} />
      <Route path="/chat" element={<ChatPage />} />

      <Route path="post">
        <Route index element={<PostList />} />
        <Route path="register" element={<PostRegister />} />
      </Route>

      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
export default App;
