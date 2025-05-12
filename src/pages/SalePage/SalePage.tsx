// src/pages/SalePage/SalePage.tsx
import React, { useState } from "react";
import SaleList from "./SaleList";
import SaleStatusList from "./SaleStatusList";
import "../../styles/SalePage.css"; // 아래에 새로 만들 CSS를 import

const SalePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "status">("list");

  return (
    <div className="sale-page">
      {/* ─── Sub-Tab Navigation ─── */}
      <div className="sub-tab-nav">
        <div
          className={`sub-tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          판매목록
        </div>
        <div
          className={`sub-tab ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          판매현황
        </div>
      </div>

      {/* ─── 실제 콘텐츠(판매목록 or 판매현황) ─── */}
      {activeTab === "list" ? <SaleList /> : <SaleStatusList />}
    </div>
  );
};

export default SalePage;
