import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import ProgressBar from "./ProgressBar";
import "../style/ReservationSeatPage.css";
import { getReservationSeat } from "../../../api/reservationApi";

const ReservationSeatPage = () => {
  const navigate = useNavigate();
  const PRICES = { adult: 10000, child: 6000, senior: 5000 };
  const selectedMovieTime = JSON.parse(
    sessionStorage.getItem("selectedMovieTime")
  );
  const {
    runningtime,
    movienm: movieName,
    cinemanm,
    allseat,
  } = selectedMovieTime;
  const starttime = selectedMovieTime.starttime.substring(0, 16);

  const [guestCount, setGuestCount] = useState({
    adult: 1,
    child: 0,
    senior: 0,
  });
  const totalGuests = guestCount.adult + guestCount.child + guestCount.senior;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);

  // 좌석 선택 페이지에서 뒤로가기 시 세션 정리
  useEffect(() => {
    const handlePopState = (event) => {
      if (window.confirm("좌석 선택을 취소하고 이전 단계로 돌아가시겠습니까? 선택한 좌석 정보가 사라집니다.")) {
        // 좌석 관련 정보만 정리
        sessionStorage.removeItem("selectedSeats");
        sessionStorage.removeItem("guestCount");
        sessionStorage.removeItem("totalGuests");
        sessionStorage.removeItem("finalReservationInfo");
        // 이전 페이지로 정상 이동 허용
        window.history.back();
      } else {
        // 취소했을 때는 현재 페이지 유지
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const [manySelectedSeats, setManySelectedSeats] = useState([]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [totalGuests]);

  useEffect(() => {
    const fetchReservedSeats = async () => {
      try {
        const manySelectedSeats = await getReservationSeat();
        const reservations = await getReservationSeat();
        const currentScheduleReservations = reservations.filter(
          (reservation) =>
            reservation.schedulecd === selectedMovieTime.schedulecd
        );
        const reservedSeatsArray = currentScheduleReservations.flatMap(
          (reservation) =>
            reservation.seatcd ? reservation.seatcd.split(",") : []
        );
        setReservedSeats(reservedSeatsArray);
        setManySelectedSeats(manySelectedSeats);
      } catch (error) {
        setReservedSeats([]);
      }
    };
    fetchReservedSeats();
  }, [selectedMovieTime.schedulecd]);

  // 좌석별 갯수 집계 및 출력
  const allSeats = manySelectedSeats
    .map((r) => r.seatcd)
    .filter(Boolean)
    .flatMap((seatcd) => seatcd.split(","));
  const seatCount = {};
  allSeats.forEach((seat) => {
    seatCount[seat] = (seatCount[seat] || 0) + 1;
  });

  const totalPrice =
    guestCount.adult * PRICES.adult +
    guestCount.child * PRICES.child +
    guestCount.senior * PRICES.senior;

  if (!sessionStorage.getItem("selectedMovieTime")) {
    navigate("/reservation/place");
    return null;
  }

  const totalRows = Math.ceil(allseat / 12);
  const seatRows = Array.from({ length: totalRows }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const handleGuestChange = (type, diff) => {
    setGuestCount((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + diff),
    }));
  };

  const handleGoToPayment = () => {
    sessionStorage.setItem(
      "finalReservationInfo",
      JSON.stringify({
        ...selectedMovieTime,
        guestCount,
        totalGuests,
        selectedSeats,
        totalPrice,
      })
    );
    navigate("/reservation/payment");
  };

  const handleSeatClick = (seatId) => {
    if (reservedSeats.includes(seatId)) {
      alert("이미 예약된 좌석입니다.");
      return;
    }
    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);
      if (isSelected) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= totalGuests) {
          alert(`최대 ${totalGuests}개의 좌석만 선택할 수 있습니다.`);
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  return (
    <div className="reservation-seat-page">
      <Header isOtherPage={true} isScrolled={true} />
      <div className="reservation-seat-content">
        <div className="reservation-seat-container">
          <ProgressBar currentStep={1} />
          <h1 className="page-title">인원 및 좌석 선택</h1>
          <div className="reservation-summary">
            <h2>예매 정보</h2>
            <div className="summary-info">
              <p>
                <strong>영화:</strong> {movieName || "영화 미선택"}
              </p>
              <p>
                <strong>날짜:</strong> {starttime || "날짜 미선택"}
              </p>
              <p>
                <strong>극장:</strong> {cinemanm}
              </p>
              <p>
                <strong>상영시간:</strong> {runningtime} 분
              </p>
            </div>
          </div>
          <div className="guest-selection">
            <h2>관람 인원</h2>
            <div className="guest-counters">
              <div className="guest-counter">
                <label>성인</label>
                <div className="counter-controls">
                  <button onClick={() => handleGuestChange("adult", -1)}>
                    -
                  </button>
                  <span>{guestCount.adult}</span>
                  <button onClick={() => handleGuestChange("adult", 1)}>
                    +
                  </button>
                </div>
                <span className="price-info">
                  ({PRICES.adult.toLocaleString()}원)
                </span>
              </div>
              <div className="guest-counter">
                <label>청소년</label>
                <div className="counter-controls">
                  <button onClick={() => handleGuestChange("child", -1)}>
                    -
                  </button>
                  <span>{guestCount.child}</span>
                  <button onClick={() => handleGuestChange("child", 1)}>
                    +
                  </button>
                </div>
                <span className="price-info">
                  ({PRICES.child.toLocaleString()}원)
                </span>
              </div>
              <div className="guest-counter">
                <label>우대</label>
                <div className="counter-controls">
                  <button onClick={() => handleGuestChange("senior", -1)}>
                    -
                  </button>
                  <span>{guestCount.senior}</span>
                  <button onClick={() => handleGuestChange("senior", 1)}>
                    +
                  </button>
                </div>
                <span className="price-info">
                  ({PRICES.senior.toLocaleString()}원)
                </span>
              </div>
            </div>
          </div>
          <div className="seat-selection">
            <h2>
              좌석 선택 ({selectedSeats.length}/{totalGuests})
            </h2>

            <div className="screen">SCREEN</div>
            <div className="seat-legend">
              <div className="legend-item"></div>
            </div>
            <div className="seat-map">
              {seatRows.map((row, rowIndex) => (
                <div key={row} className="seat-row">
                  <span className="row-label">{row}</span>
                  {Array.from(
                    {
                      length:
                        rowIndex === totalRows - 1 && allseat % 12 !== 0
                          ? allseat % 12
                          : 12,
                    },
                    (_, i) => {
                      const column = i + 1;
                      const seatId = `${row}${column
                        .toString()
                        .padStart(2, "0")}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isReserved = reservedSeats.includes(seatId);
                      return (
                        <button
                          key={column}
                          className={`seat ${isSelected ? "selected" : ""} ${
                            isReserved ? "reserved" : ""
                          }`}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isReserved}
                        >
                          {column}
                        </button>
                      );
                    }
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="selected-seats-info">
            <h3>선택된 좌석: {selectedSeats.join(", ") || "없음"}</h3>
            <p>
              선택된 좌석: {selectedSeats.length}개 / 총 인원: {totalGuests}명
            </p>
          </div>
          <div className="price-summary">
            <h3>가격 정보</h3>
            <div className="price-details">
              {guestCount.adult > 0 && (
                <p>
                  성인 {guestCount.adult}명 × {PRICES.adult.toLocaleString()}원
                  = {(guestCount.adult * PRICES.adult).toLocaleString()}원
                </p>
              )}
              {guestCount.child > 0 && (
                <p>
                  청소년 {guestCount.child}명 × {PRICES.child.toLocaleString()}
                  원 = {(guestCount.child * PRICES.child).toLocaleString()}원
                </p>
              )}
              {guestCount.senior > 0 && (
                <p>
                  우대 {guestCount.senior}명 × {PRICES.senior.toLocaleString()}
                  원 = {(guestCount.senior * PRICES.senior).toLocaleString()}원
                </p>
              )}
              <div className="total-price">
                <strong>총 결제 금액: {totalPrice.toLocaleString()}원</strong>
              </div>
            </div>
          </div>
          <div className="seat-page-buttons">
            <button className="back-btn" onClick={() => navigate(-1)}>
              이전
            </button>
            <button
              className="payment-btn"
              onClick={handleGoToPayment}
              disabled={
                totalGuests === 0 || selectedSeats.length !== totalGuests
              }
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReservationSeatPage;

