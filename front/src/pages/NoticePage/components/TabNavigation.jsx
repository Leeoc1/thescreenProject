import React from 'react';

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${activeTab === 'notice' ? 'active' : ''}`}
        onClick={() => onTabChange('notice')}
      >
        공지사항
      </button>
      <button 
        className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
        onClick={() => onTabChange('faq')}
      >
        FAQ
      </button>
    </div>
  );
};

export default TabNavigation; 

