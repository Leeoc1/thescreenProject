import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import Footer from "../../shared/Footer";
import Movies from "./components/Movies";
import "./styles/MoviePage.css";

const MoviePage = () => {
  const [activeTab, setActiveTab] = useState("boxoffice");

  useEffect(() => {
    document.body.classList.add("no-header-padding");
    return () => {
      document.body.classList.remove("no-header-padding");
    };
  }, []);

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="mvp-page">
      <Header />
      <div>
        <div className="mvp-container">
          <h1 className="mvp-title">전체 영화</h1>

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
            <button
              className={`mvp-tab-button ${
                activeTab === "upcoming" ? "active" : ""
              }`}
              onClick={() => handleTabChange("upcoming")}
            >
              상영예정작
            </button>
          </div>

          <Movies activeTab={activeTab} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MoviePage;

