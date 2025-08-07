import React from "react";

const ScreenItem = ({ screen, onStatusClick, getStatusClass }) => {
  return (
    <li className="thm-screen-list-item">
      <div className="thm-screen-list-info">
        {/* 상태 뱃지 */}
        <div
          className={`thm-screen-status-badge ${getStatusClass(
            screen.screenstatus
          )}`}
        >
          {screen.screenstatus}
        </div>
        <strong>{screen.screenname}</strong> | {screen.screentype} | 전체좌석:{" "}
        {screen.allseat} | 예약좌석: {screen.reservationseat}
      </div>
      {/* 점검 버튼 */}
      <button
        className="adp-btn-edit thm-status-btn"
        onClick={() => onStatusClick(screen)}
      >
        점검
      </button>
    </li>
  );
};

export default ScreenItem;

