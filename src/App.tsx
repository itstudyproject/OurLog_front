import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CustomerCenter from "./pages/CustomerCenter";
import HomePage from "./pages/HomePage";
import PostList from "./pages/Post/List";
import PostDetail from "./pages/Post/PostDetail";
import PostRegister from "./pages/Post/Register";
import ArtDetail from "./pages/Art/ArtDetail";
import ArtList from "./pages/Art/ArtList"; // 추가
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="customer-support" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/board/:boardId" element={<PostList />} />
        {/* 아트 페이지 경로 추가 */}
        <Route path="art">
          <Route index element={<ArtList />} />
          <Route path=":id" element={<ArtDetail />} />
        </Route>
        <Route path="post">
          <Route index element={<PostList />} />
          <Route path=":id" element={<PostDetail />} />
          <Route path="register" element={<PostRegister />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;