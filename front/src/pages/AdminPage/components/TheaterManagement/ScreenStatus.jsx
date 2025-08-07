import React, { useState } from "react";
import "../../styles/TheaterManagement.css";

const ScreenStatus = ({ screen, onStatusChange, onClose }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "운영중":
        return "adp-active";
      case "점검중":
        return "adp-maintenance";
      case "비활성":
        return "adp-terminated";
      default:
        return "adp-pending";
    }
  };

  const handleStatusSelect = (newStatus) => {
    onStatusChange(screen, newStatus);
  };

  return (
    <div className="scm-popup-overlay" onClick={onClose}>
      <div className="scm-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="scm-popup-header">
          <h3>상영관 상태 변경</h3>
          <button className="scm-popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="scm-popup-body">
          <p className="scm-popup-info">
            <strong>
              {screen.cinemanm} - {screen.screenname}
            </strong>
            <br />
            현재 상태:{" "}
            <span
              className={`scm-current-status ${getStatusClass(
                screen.screenstatus
              )}`}
            >
              {screen.screenstatus}
            </span>
          </p>
          <div className="scm-status-options">
            <button
              className="scm-status-option"
              onClick={() => handleStatusSelect("운영중")}
            >
              운영중
            </button>
            <button
              className="scm-status-option"
              onClick={() => handleStatusSelect("점검중")}
            >
              점검중
            </button>
            <button
              className="scm-status-option"
              onClick={() => handleStatusSelect("비활성")}
            >
              비활성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenStatus;

