// src/pages/PurchaseBidPage/PurchaseBidPage.tsx
import React, { useState } from "react";
import PurchaseList from "./PurchaseList";
import BidStatusList from "./BidStatusList";
import "../../styles/PurchaseBidPage.css";
import '../../styles/BidHistory.css';

const PurchaseBidPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"purchase" | "bid">("purchase");

  return (
    <div className="purchase-bid-page">
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

      {activeTab === "purchase" ? <PurchaseList /> : <BidStatusList />}
    </div>
  );
};

export default PurchaseBidPage;