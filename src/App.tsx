import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import PostDetail from "./pages/Post/PostDetail";
import PostList from "./pages/Post/PostList";
import PostRegister from "./pages/Post/PostRegister";
import WorkerPage from "./pages/WorkerPage";
// import Header from './layouts/Header';
import ArtDetail from "./pages/Art/ArtDetail";
import ArtList from "./pages/Art/ArtList";
import ArtRegister from "./pages/Art/ArtRegister";
import BidHistory from "./pages/Art/BidHistory";
import Payment from "./pages/Art/Payment";
import ChatPage from "./pages/ChatPage";
import CustomerCenter from "./pages/CustomerCenter";
import PostModify from "./pages/Post/PostModify";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RankingPage from "./pages/Ranking/RankingPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import TermsCondition from "./pages/TermsCondition";
import SocialLoginHandler from './components/SocialLoginHandler';

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
          <Route path="register" element={<ArtRegister />} />
          <Route path="payment" element={<Payment />} />
          <Route path="bidhistory" element={<BidHistory />} />
          <Route path=":id" element={<ArtDetail />} />
        </Route>

        <Route path="ranking" element={<RankingPage />} />

        <Route path="mypage/*" element={<MyPage />} />
        <Route path="worker/:userId" element={<WorkerPage />} />

        <Route path="post">
          <Route index element={<PostList />} />
          <Route path="news" element={<PostList />} />
          <Route path="free" element={<PostList />} />
          <Route path="promotion" element={<PostList />} />
          <Route path="request" element={<PostList />} />
          <Route path=":id" element={<PostDetail />} />
          <Route path="Register" element={<PostRegister />} />
          <Route path="modify/:id" element={<PostModify />} />
        </Route>
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/social-login-handler" element={<SocialLoginHandler />} />

      <Route path="/register" element={<RegisterPage />} />

    </Routes>
  );
}
export default App;
