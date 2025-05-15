// src/pages/PurchaseBidPage/PurchaseBidPage.tsx

import React, { useState } from "react";
import PurchaseList from "./PurchaseList";
import BidStatusList from "./BidStatusList";
import "../../styles/PurchaseBidPage.css";
import '../../styles/BidHistory.css';

const PurchaseBidPage = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'bid'>('purchase'); // 활성화된 탭 상태 관리

  return (
    <div className="purchase-bid-page">

      <div className="sub-tab-nav">
        <div
          className={`sub-tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}

        >
          구매목록
        </button>
        <button
          className={`tab-button ${activeTab === 'bid' ? 'active' : ''}`}
          onClick={() => setActiveTab('bid')}
        >
          입찰현황
        </button>
      </div>


      {activeTab === "purchase" ? <PurchaseList /> : <BidStatusList />}

    </div>
  );
};

export default PurchaseBidPage;