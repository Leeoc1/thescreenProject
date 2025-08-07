import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "../styles/PieChart.css";

// 파이차트 중앙 합계 표시 컴포넌트
const CenteredMetric = ({ cx, cy, total }) => {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 18, fontWeight: 700 }}
    >
      {total.toLocaleString()}원
    </text>
  );
};

// 파이차트 컴포넌트
const PieChartComponent = ({ data, onPrevious, onNext, currentChartIndex }) => {
  const pieColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#a21caf",
    "#6366f1",
  ];

  const pieData = [...data]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 6)
    .map((item, idx) => ({
      name: item.cinemaName,
      value: item.totalAmount,
      color: pieColors[idx % pieColors.length],
    }));
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="slo-chart-card">
      <div className="pc-header">
        <button
          onClick={onPrevious}
          className={`pc-nav-button ${
            currentChartIndex === 0 ? "disabled" : ""
          }`}
          disabled={currentChartIndex === 0}
        >
          ← 이전
        </button>

        <h3 className="pc-title">상영관별 매출</h3>

        <button
          onClick={onNext}
          className={`pc-nav-button ${
            currentChartIndex === 1 ? "disabled" : ""
          }`}
          disabled={currentChartIndex === 1}
        >
          다음 →
        </button>
      </div>

      <div className="pc-stats-info">
        최고 매출: {pieData[0]?.name} ({pieData[0]?.value.toLocaleString()}원)
      </div>
      <div className="slo-chart-placeholder slo-piechart-wrap">
        <div className="pc-chart-container">
          <ResponsiveContainer width="100%" height="100%">
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
                  fontSize: "10px",
                  maxWidth: "100px", // 범례 전체 최대 너비
                  margin: 0, // 여백 제거
                  padding: 0, // 패딩 제거
                  left: 0, // 왼쪽으로 딱 붙게 설정
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PieChartComponent;

