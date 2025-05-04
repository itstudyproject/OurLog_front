import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CustomerCenter from "./pages/CustomerCenter";
import HomePage from "./pages/HomePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ArtList from "./pages/Art/ArtList";
import RankingPage from "./pages/Ranking/RankingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="customer-support" element={<CustomerCenter />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="art">
          <Route index element={<ArtList />} />
        </Route>
        <Route path="ranking" element={<RankingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
