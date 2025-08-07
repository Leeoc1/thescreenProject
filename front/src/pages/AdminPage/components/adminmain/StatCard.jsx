import React, { useEffect } from "react";
import { getTotalVolume, getReservation } from "../../../../api/reservationApi";

const StatCard = ({ title, value, change, isNegative = false, onClick }) => {

  // change 값에서 숫자 부분만 추출
  const changeValue = change ? parseFloat(change.replace('%', '')) : 0;
  // 0보다 크면 + 붙이기
  const formattedChange = change ? (changeValue > 0 ? `+${change}` : change) : change;

  return (
    <div className="slo-stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h3>{title}</h3>
      <div className="slo-stat-value">{value}</div>
      {change && (
        <div className={`slo-stat-change ${isNegative ? "slo-negative" : "slo-positive"}`}>
          {formattedChange}
        </div>
      )}
    </div>
  );
};

export default StatCard;

