import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CustomerCenter from "./pages/CustomerCenter";
import HomePage from "./pages/HomePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="customer-support" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="mypage" element={<MyPage />} />
      </Route>
    </Routes>
  );
}

export default App;
