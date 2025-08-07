import React, { useEffect, useState } from "react";
import {
  getTotalVolume,
  getCinemaVolume,
  getAllUsers,
  getReservation,
} from "../../../../api/api";
import BarChart from "./chart/BarChart";
import LineChart from "./chart/LineChart";
import PieChartComponent from "./chart/PieChart";
import PieMovieChartComponent from "./chart/PieMovieChart";

const ChartSection = () => {
  const [totalVolume, setTotalVolume] = useState([]);
  const [cinemaVolume, setCinemaVolume] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [currentRightChartIndex, setCurrentRightChartIndex] = useState(0);
  const [dailyUserCount, setDailyUserCount] = useState([]);
  const [movieVolume, setMovieVolume] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          totalVolumeData,
          cinemaVolumeData,
          allUsersData,
          reservationData,
        ] = await Promise.all([
          getTotalVolume(),
          getCinemaVolume(),
          getAllUsers(),
          getReservation(),
        ]);

        setTotalVolume(totalVolumeData);
        setCinemaVolume(cinemaVolumeData);

        // 날짜별 전체 유저 수 계산 (오늘부터 7일 전까지)
        const today = new Date();
        const dailyCounts = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD 형식

          // 해당 날짜까지의 전체 유저 수 계산 (누적)
          const totalUsersOnDate = allUsersData.filter((user) => {
            if (user.reg_date) {
              const userDate = new Date(user.reg_date);
              const userDateStr = userDate.toISOString().split("T")[0];
              return userDateStr <= dateStr; // 해당 날짜까지 가입한 모든 유저
            }
            return false;
          });

          dailyCounts.push({
            date: dateStr,
            count: totalUsersOnDate.length,
          });
        }

        setDailyUserCount(dailyCounts);

        // 영화별 매출 계산
        const movieSales = {};
        reservationData.forEach((reservation) => {
          if (reservation.movienm && reservation.amount) {
            if (movieSales[reservation.movienm]) {
              movieSales[reservation.movienm] += reservation.amount;
            } else {
              movieSales[reservation.movienm] = reservation.amount;
            }
          }
        });

        const movieVolumeData = Object.entries(movieSales)
          .map(([movieName, totalAmount]) => ({
            movieName,
            totalAmount,
          }))
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);

        setMovieVolume(movieVolumeData);
      } catch (error) {
        // 에러 처리
      }
    };

    fetchData();
  }, []);

  const handlePrevious = () => {
    setCurrentChartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentChartIndex((prev) => Math.min(1, prev + 1));
  };

  const handleRightPrevious = () => {
    setCurrentRightChartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRightNext = () => {
    setCurrentRightChartIndex((prev) => Math.min(1, prev + 1));
  };

  const renderChart = () => {
    switch (currentChartIndex) {
      case 0:
        return (
          <BarChart
            data={totalVolume}
            userData={userData}
            onPrevious={handlePrevious}
            onNext={handleNext}
            currentChartIndex={currentChartIndex}
          />
        );
      case 1:
        return (
          <LineChart
            data={dailyUserCount}
            onPrevious={handlePrevious}
            onNext={handleNext}
            currentChartIndex={currentChartIndex}
          />
        );
      default:
        return (
          <BarChart
            data={totalVolume}
            userData={userData}
            onPrevious={handlePrevious}
            onNext={handleNext}
            currentChartIndex={currentChartIndex}
          />
        );
    }
  };

  const renderRightChart = () => {
    switch (currentRightChartIndex) {
      case 0:
        return (
          <PieChartComponent
            data={cinemaVolume}
            onPrevious={handleRightPrevious}
            onNext={handleRightNext}
            currentChartIndex={currentRightChartIndex}
          />
        );
      case 1:
        return (
          <PieMovieChartComponent
            data={movieVolume}
            onPrevious={handleRightPrevious}
            onNext={handleRightNext}
            currentChartIndex={currentRightChartIndex}
          />
        );
      default:
        return (
          <PieChartComponent
            data={cinemaVolume}
            onPrevious={handleRightPrevious}
            onNext={handleRightNext}
            currentChartIndex={currentRightChartIndex}
          />
        );
    }
  };

  return (
    <div className="slo-charts-section">
      {renderChart()}
      {renderRightChart()}
    </div>
  );
};

export default ChartSection;

