// src/pages/PurchaseBidPage/PurchaseBidPage.tsx
import React, { useState } from 'react';
import PurchaseList from './PurchaseList'; // 구매목록 컴포넌트
import BidStatusList from './BidStatusList'; // 입찰현황 컴포넌트
import '../../styles/BidStatusList.css'

const PurchaseBidPage = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'bid'>('purchase'); // 활성화된 탭 상태 관리

  return (
    <div className="purchase-bid-page">
      {/* 탭 메뉴 */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
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

      {/* 탭에 따라 컴포넌트 렌더링 */}
      <div className="tab-content">
        {activeTab === 'purchase' ? <PurchaseList /> : <BidStatusList />}
      </div>
    </div>
  );
};

export default PurchaseBidPage;
