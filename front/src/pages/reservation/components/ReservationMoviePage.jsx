import React, { useEffect, useState } from "react";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import Movies from "../../MoviePage/components/Movies";
import "../style/ReservationMoviePage.css";
import "../../MoviePage/styles/MoviePage.css"; // Import styles for tabs

const ReservationMoviePage = () => {
  const [activeTab, setActiveTab] = useState("boxoffice");

  useEffect(() => {
    document.body.classList.add("no-header-padding");
    return () => {
      document.body.classList.remove("no-header-padding");
    };
  }, []);
  useEffect(() => {
    // 예매 과정 시작 시 기존 예매 정보만 정리 (로그인 정보는 유지)
    sessionStorage.removeItem("finalReservationInfo");
    sessionStorage.removeItem("selectedSeats");
    sessionStorage.removeItem("reservationInfo");
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="rmpp-page">
      <Header />
      <div className="rmpp-container">
        <h1 className="rmpp-title">영화 예매</h1>
        <p className="rmpp-subtitle">원하는 영화를 선택하여 예매하세요.</p>

        {/* 탭 네비게이션 */}
        <div className="mvp-tab-navigation">
          <button
            className={`mvp-tab-button ${
              activeTab === "boxoffice" ? "active" : ""
            }`}
            onClick={() => handleTabChange("boxoffice")}
          >
            박스오피스순
          </button>
          <button
            className={`mvp-tab-button ${
              activeTab === "latest" ? "active" : ""
            }`}
            onClick={() => handleTabChange("latest")}
          >
            최신개봉순
          </button>
        </div>

        {/* Movies 컴포넌트 */}
        <Movies activeTab={activeTab} showDetailButton={false} />
      </div>
      <Footer />
    </div>
  );
};

export default ReservationMoviePage;

