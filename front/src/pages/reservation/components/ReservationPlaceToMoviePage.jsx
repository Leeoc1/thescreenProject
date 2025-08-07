import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/Header";
import "../style/ReservationPlaceToMovie.css";
import DateSelector from "../ReservationPage/tocinema/components/DateSelector";
import MovieSelector from "../ReservationPage/tocinema/components/MovieSelector";
import ScreenSelector from "../ReservationPage/tocinema/components/ScreenSelector";
import ProgressBar from "./ProgressBar";

const ReservationPlaceToMoviePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 임의 데이터
  const selectedRegion = location.state?.selectedRegion || "서울";
  const selectedBranch = location.state?.selectedBranch || "가양";

  // 영화 시간 초기화
  useEffect(() => {
    sessionStorage.removeItem("selectedMovieTime");
  }, []);

  // 날짜 상태
  const today = new Date();
  const [selectedDateObj] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );

  // 선택 상태를 실시간으로 추적
  const [isReadyToSeat, setIsReadyToSeat] = useState(false);

  // 선택 상태 확인 함수
  const checkSelectionStatus = () => {
    const selectedDate = sessionStorage.getItem("selectedFullDate");
    const selectedMovie = sessionStorage.getItem("selectedMovieName");
    const selectedTime = sessionStorage.getItem("selectedMovieTime");

    const isReady = selectedDate && selectedMovie && selectedTime;
    setIsReadyToSeat(isReady);
  };

  // 세션 스토리지 변경 감지
  useEffect(() => {
    const handleSessionStorageChange = () => {
      checkSelectionStatus();
    };

    // 커스텀 이벤트 리스너
    window.addEventListener("sessionStorageChange", handleSessionStorageChange);
  }, []);

  // 좌석 선택 버튼 클릭 시 이동
  const handleGoToSeat = () => {
    navigate("/reservation/seat", {
      state: {
        selectedDate: selectedDateObj,
        selectedRegion: selectedRegion,
        selectedBranch: selectedBranch,
        selectedMovie: location.state?.selectedMovie || null,
      },
    });
  };

  // 페이지 언마운ㅌ
  useEffect(() => {
    return () => {
      const cinemacd = sessionStorage.getItem("cinemacd");
      const cinemanm = sessionStorage.getItem("cinemanm");
      const selectedMovieTime = sessionStorage.getItem("selectedMovieTime");
      const userToken = sessionStorage.getItem("token");
      const userRole = sessionStorage.getItem("role");

      // 예매 관련 정보만 정리하고 필요한 정보들은 다시 설정
      sessionStorage.removeItem("finalReservationInfo");
      sessionStorage.removeItem("selectedSeats");
      sessionStorage.removeItem("reservationInfo");

      if (cinemacd) sessionStorage.setItem("cinemacd", cinemacd);
      if (cinemanm) sessionStorage.setItem("cinemanm", cinemanm);
      if (selectedMovieTime)
        sessionStorage.setItem("selectedMovieTime", selectedMovieTime);
      if (userToken) sessionStorage.setItem("token", userToken);
      if (userRole) sessionStorage.setItem("role", userRole);
    };
  }, []);

  return (
    <div className="rptm-reservation-page">
      <Header isOtherPage={true} isScrolled={true} />
      <div className="rptm-reservation-content">
        <div className="rptm-reservation-container">
          {/* 진행바 */}
          <ProgressBar />

          {/* 현재 선택한 극장 이름 */}
          <div>
            <h1>{sessionStorage.getItem("cinemanm")}</h1>
          </div>

          {/* 날짜 선택 */}
          <DateSelector />

          {/* 영화 및 상영관 선택 */}
          <div className="rptm-movie-section">
            <div className="rptm-movie-title rptm-section-title">영화선택</div>
            <div className="rptm-time-title rptm-section-title">상영시간</div>
            <div className="rptm-movie-selector">
              <MovieSelector />
              <ScreenSelector />
            </div>
          </div>
        </div>
      </div>

      {/* 좌석 선택 버튼 */}
      {isReadyToSeat && (
        <button className="reservation-seat-btn-fixed" onClick={handleGoToSeat}>
          좌석 선택
        </button>
      )}
    </div>
  );
};

export default ReservationPlaceToMoviePage;

