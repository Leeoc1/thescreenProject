import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "../styles/PieMovieChart.css";

// 파이차트 컴포넌트
const PieMovieChartComponent = ({
  data,
  onPrevious,
  onNext,
  currentChartIndex,
}) => {
  const pieColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#a21caf",
    "#6366f1",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
  ];

  const pieData = (data && data.length > 0 ? data : []).map((item, idx) => ({
    name: item.movieName,
    value: item.totalAmount,
    color: pieColors[idx % pieColors.length],
  }));
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="slo-chart-card">
      <div className="pmc-header">
        <button onClick={onPrevious} className="pmc-nav-button">
          ← 이전
        </button>

        <h3 className="pmc-title">영화별 매출</h3>

        <button
          onClick={onNext}
          className={`pmc-nav-button ${
            currentChartIndex === 1 ? "disabled" : ""
          }`}
          disabled={currentChartIndex === 1}
        >
          다음 →
        </button>
      </div>

      <div className="pmc-stats-info">
        최고 매출: {pieData[0]?.name} ({pieData[0]?.value.toLocaleString()}원)
      </div>

      <div className="slo-chart-placeholder slo-piechart-wrap">
        {pieData.length > 0 ? (
          <div className="pmc-chart-container">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()}원`, "매출"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend
                  verticalAlign="top"
                  align="left"
                  layout="vertical"
                  wrapperStyle={{
                    paddingRight: "20px",
                    paddingLeft: "20px",
                    fontSize: "10px",
                    maxWidth: "200px", // 범례 전체 최대 너비 설정
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="pmc-empty-state">
            <div className="pmc-empty-content">
              <div className="pmc-empty-icon">📊</div>
              <div className="pmc-empty-title">영화별 매출 데이터 준비 중</div>
              <div className="pmc-empty-subtitle">
                예약 데이터를 확인해주세요
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieMovieChartComponent;

