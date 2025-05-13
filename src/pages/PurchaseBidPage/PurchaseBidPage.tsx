// src/pages/PurchaseBidPage/PurchaseBidPage.tsx
import React, { useState } from "react";
import PurchaseList from "./PurchaseList";
import BidStatusList from "./BidStatusList";
import "../../styles/PurchaseBidPage.css"; // 새로 만든 CSS

const PurchaseBidPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"purchase" | "bid">("purchase");

  return (
    <div className="purchase-bid-page">
      {/* ─── Sub-Tab Navigation ─── */}
      <div className="sub-tab-nav">
        <div
          className={`sub-tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}
        >
          구매목록
        </div>
        <div
          className={`sub-tab ${activeTab === "bid" ? "active" : ""}`}
          onClick={() => setActiveTab("bid")}
        >
          입찰현황
        </div>
      </div>

      {/* ─── 실제 콘텐츠 ─── */}
      {activeTab === "purchase" ? <PurchaseList /> : <BidStatusList />}
    </div>
  );
};

export default PurchaseBidPage;
