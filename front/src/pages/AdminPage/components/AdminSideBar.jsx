import React from "react";
import "../styles/AdminSideBar.css";
import { sidebarItems } from "../../../utils/data/SideBarData.js";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="adsb-sidebar">
      <nav className="adsb-sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`adsb-sidebar-item ${
              activeTab === item.id ? "adsb-active" : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="adsb-sidebar-icon">{item.icon}</span>
            <span className="adsb-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;

