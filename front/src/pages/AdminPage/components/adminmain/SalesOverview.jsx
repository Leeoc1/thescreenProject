import React from "react";
import "../../styles/SalesOverview.css";
import "../../styles/AdminPage.css";
import { useSalesData } from "./DataFetcher";
import StatCard from "./StatCard";
import ChartSection from "./ChartSection";
import { useNavigate } from "react-router-dom";

const SalesOverview = () => {
  const {
    totalVolume,
    increaseVolume,
    todayReservationCount,
    increaseReservationCount,
    averagePrice,
    increaseAveragePrice,
    staffCount,
    increaseStaffCount,
    userCount,
    increaseUserCount,
  } = useSalesData();

  const navigate = useNavigate();

  const handleSalesPage = () => {
    navigate("/admin/sales");
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>매출 현황</h2>
      </div>

      <div className="slo-stats-grid">
        <StatCard
          title="오늘 매출"
          value={`₩ ${totalVolume.toLocaleString("ko-KR")}`}
          change={`${increaseVolume}%`}
          isNegative={increaseVolume < 0}
          onClick={handleSalesPage}
        />
        <StatCard
          title="예매 건수"
          value={todayReservationCount}
          change={`${increaseReservationCount}%`}
          isNegative={increaseReservationCount < 0}
        />
        <StatCard
          title="평균 객단가"
          value={`₩ ${(Math.round(averagePrice / 100) * 100).toLocaleString(
            "ko-KR"
          )}`}
          change={`${increaseAveragePrice}%`}
          isNegative={increaseAveragePrice < 0}
        />
        <StatCard
          title="직원 수"
          value={staffCount}
          change={`${increaseStaffCount}`}
        />
        <StatCard
          title="유저 수"
          value={userCount}
          change={`${increaseUserCount}`}
        />
      </div>

      <ChartSection />
    </div>
  );
};

export default SalesOverview;

