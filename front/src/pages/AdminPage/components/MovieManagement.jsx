import React, { useState, useEffect } from "react";
import {
  getMoviesForAdmin,
  archiveMovie,
  updateScreeningStatus,
  fetchMoviesFromKobis,
} from "../../../api/movieApi";
import "../styles/MovieManagement.css";
import "../styles/AdminPage.css";
import { useNotification } from "../utils/NotificationContext";

const MovieManagement = () => {
  const [readyMovies, setReadyMovies] = useState([]);
  const [screeningMovies, setScreeningMovies] = useState([]);
  const [archivedMovies, setArchivedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("ready");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshNotifications } = useNotification();

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const data = await getMoviesForAdmin();
      const allMovies = data.currentMovies || [];
      setReadyMovies(allMovies.filter((movie) => movie.movieinfo === "N"));
      setScreeningMovies(allMovies.filter((movie) => movie.movieinfo === "Y"));
      setUpcomingMovies(allMovies.filter((movie) => movie.movieinfo === "E"));
      setArchivedMovies(data.archivedMovies || []);

      // 알림 새로고침
      refreshNotifications();
    } catch (error) {
      alert("영화 목록을 불러오는데 실패했습니다.");
    }
  };

  const fetchMoviesFromKobisApi = async () => {
    if (!window.confirm("KOBIS API에서 최신 영화 데이터를 가져오시겠습니까?"))
      return;
    setIsLoading(true);
    try {
      const result = await fetchMoviesFromKobis();
      if (result.success) {
        const allMovies = result.currentMovies || [];
        setReadyMovies(allMovies.filter((movie) => movie.movieinfo === "N"));
        setScreeningMovies(
          allMovies.filter((movie) => movie.movieinfo === "Y")
        );
        setUpcomingMovies(allMovies.filter((movie) => movie.movieinfo === "E"));
        setArchivedMovies(result.archivedMovies || []);

        // 알림 새로고침
        refreshNotifications();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("영화 데이터 가져오기에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScreeningStatus = async (moviecd, currentStatus) => {
    const action = currentStatus === "Y" ? "종료" : "시작";
    if (!window.confirm(`정말로 상영을 ${action}하시겠습니까?`)) return;
    try {
      await updateScreeningStatus(moviecd);
      await loadMovies();
      alert(`상영 ${action}되었습니다.`);
    } catch (error) {
      alert(`상영 상태 변경에 실패했습니다.`);
    }
  };

  const archiveMovieItem = async (moviecd, movienm) => {
    if (
      !window.confirm(
        `"${movienm}"을 상영 종료하시겠습니까?\n(상영 종료된 영화는 웹 서비스에 더이상 노출되지 않습니다)`
      )
    )
      return;
    try {
      await archiveMovie(moviecd);
      await loadMovies();
      alert("상영이 종료되었습니다.");
    } catch (error) {
      alert("상영 종료에 실패했습니다.");
    }
  };

  const getRating = (isAdult) => {
    return isAdult === "Y" ? "청소년 관람불가" : "전체 관람가";
  };

  const getScreeningStatus = (movieinfo) => {
    if (movieinfo === "Y") return "상영중";
    if (movieinfo === "N") return "상영준비";
    if (movieinfo === "E") return "상영예정";
    if (movieinfo === "D") return "상영종료";
    return "알 수 없음";
  };
  // 현재 선택된 탭에 따라 보여줄 영화 목록 결정
  const displayMovies =
    activeTab === "ready"
      ? readyMovies
      : activeTab === "screening"
      ? screeningMovies
      : activeTab === "archived"
      ? archivedMovies
      : upcomingMovies;

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>영화 관리</h2>
        <button
          className="fetch-movies-btn"
          onClick={fetchMoviesFromKobisApi}
          disabled={isLoading}
        >
          {isLoading ? "데이터 가져오는 중..." : "영화 데이터 가져오기"}
        </button>
      </div>
      <div className="mvm-movie-management-tabs">
        <div className="mvm-tab-nav">
          <button
            className={`mvm-tab-btn ${
              activeTab === "ready" ? "mvm-active" : ""
            }`}
            onClick={() => setActiveTab("ready")}
          >
            상영 준비중 ({readyMovies.length})
          </button>
          <button
            className={`mvm-tab-btn ${
              activeTab === "screening" ? "mvm-active" : ""
            }`}
            onClick={() => setActiveTab("screening")}
          >
            상영중 ({screeningMovies.length})
          </button>
          <button
            className={`mvm-tab-btn ${
              activeTab === "upcoming" ? "mvm-active" : ""
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            상영 예정작 ({upcomingMovies.length})
          </button>
          <button
            className={`mvm-tab-btn ${
              activeTab === "archived" ? "mvm-active" : ""
            }`}
            onClick={() => setActiveTab("archived")}
          >
            상영 종료작 ({archivedMovies.length})
          </button>
        </div>
        <div className="mvm-movie-list">
          <span>총 영화 : {displayMovies.length}개</span>
          {displayMovies.map((movie) =>
            activeTab === "upcoming" ? (
              <div className="mvm-movie-item" key={movie.moviecd}>
                <img
                  src={movie.posterurl || "/images/movie.jpg"}
                  alt={`${movie.movienm} 포스터`}
                  style={{
                    width: "100px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/movie.jpg";
                  }}
                />
                <div className="mvm-movie-details">
                  <h3>{movie.movienm}</h3>
                  <p>장르: {movie.genre}</p>
                  <p>개봉 예정일: {movie.releasedate}</p>
                  <p>감독: {movie.director}</p>
                  <p>배우: {movie.actors}</p>
                  <p>설명: {movie.description}</p>
                </div>
              </div>
            ) : (
              <div className="mvm-movie-item" key={movie.moviecd}>
                <img
                  src={movie.posterurl || "/images/movie.jpg"}
                  alt={`${movie.movienm} 포스터`}
                  style={{
                    width: "100px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/movie.jpg";
                  }}
                />
                <div className="mvm-movie-details">
                  <h3>{movie.movienm}</h3>
                  <p>
                    장르: {movie.genre} | 등급: {getRating(movie.isadult)}
                  </p>
                  <p>
                    상영시간: {movie.runningtime}분 | 개봉일:{" "}
                    {movie.releasedate}
                  </p>
                  <p>감독: {movie.director}</p>
                  <p>배우: {movie.actors}</p>
                  <p>설명: {movie.description}</p>
                  <p>
                    상영상태:{" "}
                    <span
                      className={`status ${
                        movie.movieinfo === "Y"
                          ? "screening"
                          : movie.movieinfo === "N"
                          ? "ready"
                          : "archived"
                      }`}
                    >
                      {getScreeningStatus(movie.movieinfo)}
                    </span>
                  </p>
                  <div className="mvm-action-buttons">
                    {activeTab === "ready" && (
                      <>
                        <button
                          className="mvm-screening-btn start"
                          onClick={() =>
                            toggleScreeningStatus(
                              movie.moviecd,
                              movie.movieinfo
                            )
                          }
                        >
                          상영 시작
                        </button>
                        <button
                          className="mvm-archive-btn"
                          onClick={() =>
                            archiveMovieItem(movie.moviecd, movie.movienm)
                          }
                        >
                          삭제
                        </button>
                      </>
                    )}
                    {activeTab === "screening" && (
                      <>
                        <button
                          className="mvm-screening-btn stop"
                          onClick={() =>
                            toggleScreeningStatus(
                              movie.moviecd,
                              movie.movieinfo
                            )
                          }
                        >
                          상영 종료
                        </button>
                        <button
                          className="mvm-archive-btn"
                          onClick={() =>
                            archiveMovieItem(movie.moviecd, movie.movienm)
                          }
                        >
                          삭제
                        </button>
                      </>
                    )}
                    {activeTab === "archived" && (
                      <span className="mvm-archived-info">
                        상영 종료된 영화입니다
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieManagement;

