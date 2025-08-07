import React, { useState } from "react";
import CurrentMoviesList from "./CurrentMoviesList";
import AvailableMoviesList from "./AvailableMoviesList";
import EndedMoviesList from "./EndedMoviesList";

const MovieTabs = ({
  movies,
  loading,
  selectedMovies,
  onMovieSelect,
  theater,
  onCloseParent,
}) => {
  const [activeTab, setActiveTab] = useState("available");

  // 탭별 메시지
  const tabMessages = {
    available: "등록 가능한 영화가 없습니다.",
    current: "현재 상영중인 영화가 없습니다.",
    ended: "상영 종료된 영화가 없습니다.",
  };

  const tabs = [
    { key: "available", label: "상영 가능 영화" },
    { key: "current", label: "상영중인 영화" },
    { key: "ended", label: "상영 종료 영화" },
  ];

  return (
    <div>
      <div className="mrm-tab-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`mrm-tab-button ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mrm-tab-content">
        {loading ? (
          <div className="mrm-loading">영화 목록을 불러오는 중...</div>
        ) : movies[activeTab].length === 0 ? (
          <div className="mrm-no-movies">{tabMessages[activeTab]}</div>
        ) : activeTab === "current" ? (
          <CurrentMoviesList
            movieList={movies.current}
            selectedMovies={selectedMovies}
            onMovieSelect={onMovieSelect}
            theater={theater}
            onCloseParent={onCloseParent}
          />
        ) : activeTab === "available" ? (
          <AvailableMoviesList
            movieList={movies.available}
            selectedMovies={selectedMovies}
            onMovieSelect={onMovieSelect}
          />
        ) : (
          <EndedMoviesList
            movieList={movies.ended}
            selectedMovies={selectedMovies}
            onMovieSelect={onMovieSelect}
          />
        )}
      </div>
    </div>
  );
};

export default MovieTabs;

