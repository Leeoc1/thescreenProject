import React, { useEffect, useState } from "react";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import { getCurrentMovies } from "../../../api/movieApi";
import "../style/ReservationPlacePage.css";
import DateSelectorMovie from "../ReservationPage/tomovie/components/DateSelectorMovie";
import TheaterSelector from "../ReservationPage/tomovie/components/TheaterSelector";
import ProgressBar from "./ProgressBar";
import { useLocation, useNavigate } from "react-router-dom";

const ReservationPlacePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movieDetails, setMovieDetails] = useState(null);
  const [isReadyToSeat, setIsReadyToSeat] = useState(false);

  // 영화 정보를 가져와서 세션스토리지에 저장
  useEffect(() => {
    const fetchMovieDetails = async () => {
      // 먼저 selectedMovie에서 정보를 가져오기 (홈페이지에서 선택한 경우)
      const selectedMovieStr = sessionStorage.getItem("selectedMovie");
      if (selectedMovieStr) {
        const selectedMovie = JSON.parse(selectedMovieStr);
        setMovieDetails(selectedMovie);
        return; // selectedMovie가 있으면 API 호출하지 않음
      }

      // selectedMovie가 없으면 기존 방식으로 moviecd 사용
      const storedMovieCd = sessionStorage.getItem("moviecd");
      if (storedMovieCd) {
        const allMovies = await getCurrentMovies();
        const movieData = allMovies.find(
          (movie) => movie.moviecd === storedMovieCd
        );

        if (movieData) {
          sessionStorage.setItem("moviecd", movieData.moviecd);
          sessionStorage.setItem("movienm", movieData.movienm);
          setMovieDetails(movieData);
        }
      }
    };

    fetchMovieDetails();
  }, []);

  // selectedMovieTime이 있을 때만 버튼 활성화
  useEffect(() => {
    const checkSelectedMovieTime = () => {
      const selectedMovieTime = sessionStorage.getItem("selectedMovieTime");
      setIsReadyToSeat(!!selectedMovieTime);
    };

    // 초기 확인
    checkSelectedMovieTime();

    // 커스텀 이벤트 리스너
    const handleSelectedMovieTimeChanged = () => {
      checkSelectedMovieTime();
    };

    const handleSelectedMovieTimeCleared = () => {
      checkSelectedMovieTime();
    };

    window.addEventListener(
      "selectedMovieTimeChanged",
      handleSelectedMovieTimeChanged
    );
    window.addEventListener(
      "selectedMovieTimeCleared",
      handleSelectedMovieTimeCleared
    );

    return () => {
      window.removeEventListener(
        "selectedMovieTimeChanged",
        handleSelectedMovieTimeChanged
      );
      window.removeEventListener(
        "selectedMovieTimeCleared",
        handleSelectedMovieTimeCleared
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      const moviecd = sessionStorage.getItem("moviecd");
      const movienm = sessionStorage.getItem("movienm");
      const selectedMovieTime = sessionStorage.getItem("selectedMovieTime");
      const userToken = sessionStorage.getItem("token");
      const userRole = sessionStorage.getItem("role");

      // 예매 관련 정보만 정리하고 필요한 정보들은 다시 설정
      sessionStorage.removeItem("finalReservationInfo");
      sessionStorage.removeItem("selectedSeats");
      sessionStorage.removeItem("reservationInfo");

      if (moviecd) sessionStorage.setItem("moviecd", moviecd);
      if (movienm) sessionStorage.setItem("movienm", movienm);
      if (selectedMovieTime)
        sessionStorage.setItem("selectedMovieTime", selectedMovieTime);
      if (userToken) sessionStorage.setItem("token", userToken);
      if (userRole) sessionStorage.setItem("role", userRole);
    };
  }, []);

  // 좌석 선택 버튼 클릭 시 이동
  const handleGoToSeat = () => {
    navigate("/reservation/seat");
  };

  return (
    <div className="reservation-page">
      <Header isOtherPage={true} isScrolled={true} />
      <div className="reservation-content">
        <div className="reservation-container">
          <ProgressBar currentStep={0} />
          {movieDetails && (
            <div className="selected-movie-section">
              <h2 className="selected-movie-section-title">선택한 영화</h2>
              <div className="selected-movie-content">
                {movieDetails.posterurl && (
                  <img
                    src={movieDetails.posterurl}
                    alt={movieDetails.movienm}
                    className="selected-movie-poster"
                  />
                )}
                <div className="selected-movie-info">
                  <h3 className="selected-movie-title">
                    {movieDetails.movienm}
                  </h3>
                  <p className="selected-movie-genre">
                    상영시간: {movieDetails.runningtime}분
                  </p>
                  <div className="selected-movie-rating">
                    <span
                      className={`rpp-age-icon ${
                        movieDetails.isadult === "Y"
                          ? "rpp-age-19"
                          : "rpp-age-all"
                      }`}
                    >
                      {movieDetails.isadult === "Y" ? "19" : "ALL"}
                    </span>
                    <span className="rpp-rating-text">
                      {movieDetails.isadult === "Y"
                        ? "청소년 관람불가"
                        : "전체관람가"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DateSelectorMovie />
          <TheaterSelector />
          {isReadyToSeat && (
            <button
              className="rptm-reservation-seat-btn-fixed"
              onClick={handleGoToSeat}
            >
              좌석 선택
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReservationPlacePage;

