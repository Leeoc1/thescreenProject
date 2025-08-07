import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TheaterInfo.css";
import LoginRequiredModal from "../../LoginPage/components/LoginRequiredModal";

const TheaterInfo = ({
  cinemacd,
  cinemanm,
  tel,
  address,
  myState,
  theaterState,
}) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 예매하기 버튼 클릭시 예매페이지로 이동(영화 선택)
  const handleReservationClick = () => {
    // 로그인 상태 체크
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      // 로그인되지 않은 경우 모달 표시
      setShowLoginModal(true);
      return;
    }

    // 로그인된 경우 기존 로직 실행
    sessionStorage.setItem("cinemacd", cinemacd);
    sessionStorage.setItem("cinemanm", cinemanm);
    navigate(`/reservation/theater/${cinemacd}`);
  };

  // 길찾기 버튼, 클릭시 카카오맵으로 이동(현위치에 현위치, 도착지에 해당 영화관)
  const handleFindRoadClick = () => {
    window.open(
      `https://map.kakao.com/link/from/현위치,${myState.center.lat},${myState.center.lng}/to/${cinemanm},${theaterState.center.lat},${theaterState.center.lng}`,
      "_blank"
    );
  };

  return (
    <div>
      <div className="ti-info-wrap">
        <h1>{cinemanm}</h1>
        <p>{address}</p>
        <p>{tel}</p>
      </div>

      <button
        className="ti-reservation-button"
        onClick={handleReservationClick}
      >
        <strong>예매하기</strong>
      </button>
      <button className="ti-findroad-button" onClick={handleFindRoadClick}>
        <strong>길찾기</strong>
      </button>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default TheaterInfo;

