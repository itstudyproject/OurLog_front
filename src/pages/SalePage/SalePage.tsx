// src/pages/SalePage/SalePage.tsx
import React, { useState } from "react";
import SaleList from "./SaleList";
import SaleStatusList from "./SaleStatusList";
import "../../styles/SalePage.css";
import "../../styles/BidHistory.css";
import "../../styles/PurchaseBidPage.css";

const SalePage = () => {
  const [activeTab, setActiveTab] = useState<"list" | "status">("list");

  return (
    <div className="sale-page">
      <div className="sub-tab-nav">
        <button
          className={`sub-tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          내 판매목록
        </button>
        <button
          className={`sub-tab ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          판매현황
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "list" ? <SaleList /> : <SaleStatusList />}
      </div>
    </div>
  );
};

export default SalePage;
