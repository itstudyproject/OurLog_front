import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CustomerCenter from "./pages/CustomerCenter";
import HomePage from "./pages/HomePage";

import PostList from "./pages/Post/PostList";
import PostDetail from "./pages/Post/PostDetail";
import PostRegister from "./pages/Post/PostRegister";
import PostModify from "./pages/Post/PostModify";
import ArtList from "./pages/Art/ArtList";
import ArtDetail from "./pages/Art/ArtDetail";
import Payment from "./pages/Art/Payment";
import BidHistory from "./pages/Art/BidHistory"; // 추가
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RankingPage from "./pages/Ranking/RankingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="customer-support" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/board/:boardId" element={<PostList />} />
        {/* 아트 페이지 경로 */}
        <Route path="art">
          <Route index element={<ArtList />} />
          <Route path=":id" element={<ArtDetail />} />
          <Route path="payment/:id" element={<Payment />} />
          <Route path="bids" element={<BidHistory />} />
        </Route>
        <Route path="ranking" element={<RankingPage />} />
        <Route path="post">
          <Route index element={<PostList />} />
          <Route path=":id" element={<PostDetail />} />
          <Route path="register" element={<PostRegister />} />
          <Route path="postModify/:id" element={<PostModify />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
