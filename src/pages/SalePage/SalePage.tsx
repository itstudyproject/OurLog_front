import React, { useState } from 'react';
import SaleList from './SaleList';
import SaleStatusList from './SaleStatusList';
import '../../styles/SalePage.css';

const SalePage = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'status'>('list');

  return (
    <div className="sale-page">
      <div className="tab-buttons">
        <button
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          내 판매목록
        </button>
        <button
          className={activeTab === 'status' ? 'active' : ''}
          onClick={() => setActiveTab('status')}
        >
          판매현황
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' ? <SaleList /> : <SaleStatusList />}
      </div>
    </div>
  );
};

export default SalePage;
