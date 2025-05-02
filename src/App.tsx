import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CustomerCenter from "./pages/CustomerCenter";
import HomePage from "./pages/HomePage";
import PostList from "./pages/Post/List";
import PostRegister from "./pages/Post/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="customer-support" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/board/:boardId" element={<PostList />} />
        <Route path="post">
          <Route index element={<PostList />} />
          <Route path="register" element={<PostRegister />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
