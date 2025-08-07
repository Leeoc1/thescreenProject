import React, { useEffect, useState } from "react";
import { getReservationSeat } from "../../../../../api/reservationApi";
import { getSchedules } from "../../../../../api/cinemaApi";

const ScreenSelector = () => {
  const [selectedMovieName, setSelectedMovieName] = useState(
    sessionStorage.getItem("selectedMovieName") || null
  );
  const [movieSchedule, setMovieSchedule] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    sessionStorage.getItem("selectedFullDate") || "날짜를 선택하세요"
  );
  const [reservedSeatsCount, setReservedSeatsCount] = useState({});

  // 현재 시간 정보 (컴포넌트 렌더링 시 한 번만 계산)
  const today = new Date();
  const todayDate = today.toLocaleDateString("sv-SE");

  // 상영 정보 가져오기
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const selectedSchedule = await getSchedules();

        const filteredSchedules = selectedSchedule.filter((schedule) => {
          return (
            schedule.movienm === selectedMovieName &&
            schedule.startdate === selectedDate &&
            schedule.screenstatus === "운영중" &&
            schedule.cinemanm === sessionStorage.getItem("cinemanm")
          );
        });

        // 상영 시간순으로 정렬
        filteredSchedules.sort(
          (a, b) => new Date(a.starttime) - new Date(b.starttime)
        );
        setMovieSchedule(filteredSchedules);
      } catch (error) {
        
        setMovieSchedule([]);
      }
    };

    if (selectedMovieName && selectedDate !== "날짜를 선택하세요") {
      fetchSchedule();
    } else {
      setMovieSchedule([]);
    }
  }, [selectedMovieName, selectedDate]);

  // 세션 스토리지 변경 감지
  useEffect(() => {
    const handleSessionStorageChange = (event) => {
      const newMovieName =
        event.detail.selectedMovieName ||
        sessionStorage.getItem("selectedMovieName");
      const newDate =
        event.detail.selectedFullDate ||
        sessionStorage.getItem("selectedFullDate");
      if (newMovieName !== selectedMovieName || newDate !== selectedDate) {
        setSelectedMovieName(newMovieName);
        setSelectedDate(newDate || "날짜를 선택하세요");
        setSelectedStartTime(null); // 새로운 영화 또는 날짜 선택 시 시간 초기화
      }
    };

    window.addEventListener("sessionStorageChange", handleSessionStorageChange);
    return () =>
      window.removeEventListener(
        "sessionStorageChange",
        handleSessionStorageChange
      );
  }, [selectedMovieName, selectedDate]);

  // 상영 시간 선택
  const handleTimeSelect = (schedule) => {
    setSelectedStartTime(schedule.starttime);
    const timeData = {
      starttime: schedule.starttime,
      reservationseat: schedule.reservationseat,
      allseat: schedule.allseat,
      movienm: sessionStorage.getItem("selectedMovieName"),
      screenname: schedule.screenname,
      schedulecd: schedule.schedulecd, // 예약 진행을 위해 schedulecd 추가
      runningtime: schedule.runningtime, // 상영시간
      cinemanm: sessionStorage.getItem("cinemanm"),
    };
    sessionStorage.setItem("selectedMovieTime", JSON.stringify(timeData));

    // 세션 스토리지 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent("sessionStorageChange", {
        detail: {
          selectedFullDate: sessionStorage.getItem("selectedFullDate"),
          selectedMovieName: sessionStorage.getItem("selectedMovieName"),
          selectedMovieTime: JSON.stringify(timeData),
        },
      })
    );
  };

  // screentype 목록을 추출하고 중복 제거
  const uniqueScreentypes = [
    ...new Set(movieSchedule.map((schedule) => schedule.screentype)),
  ];

  // 이미 예약된 좌석들 가져오기
  useEffect(() => {
    const fetchReservedSeats = async () => {
      const reservations = await getReservationSeat();
      const reservedCounts = {};

      reservations.forEach((reservation) => {
        const schedulecd = reservation.schedulecd;
        const seatCount = reservation.seatcd
          ? reservation.seatcd.split(",").length
          : 0;

        if (reservedCounts[schedulecd]) {
          reservedCounts[schedulecd] += seatCount;
        } else {
          reservedCounts[schedulecd] = seatCount;
        }
      });

      setReservedSeatsCount(reservedCounts);
    };

    fetchReservedSeats();
  }, [movieSchedule]);

  return (
    <div className="rptm-time-list-area">
      <div className="rptm-time-list-content">
        {!selectedMovieName && <div>영화를 먼저 선택하세요.</div>}
        {selectedMovieName && movieSchedule.length === 0 && (
          <div>선택한 날짜에 상영 정보가 없습니다.</div>
        )}
        {uniqueScreentypes.length > 0 && (
          <>
            {uniqueScreentypes.map((screentype) => (
              <div key={screentype}>
                <div className="rptm-screen-type-title">{screentype}</div>
                <div className="rptm-screen-times-grid">
                  {movieSchedule
                    .filter((schedule) => schedule.screentype === screentype)
                    .map((schedule) => {
                      const isToday = schedule.startdate === todayDate;
                      const isPastTime =
                        isToday && new Date(schedule.starttime) <= today;

                      return (
                        <div
                          key={schedule.schedulecd}
                          className={`rptm-screen-time-card ${
                            selectedStartTime === schedule.starttime
                              ? "rptm-active"
                              : ""
                          } ${isPastTime ? "rptm-disabled" : ""}`}
                          onClick={
                            isPastTime ? null : () => handleTimeSelect(schedule)
                          }
                          style={
                            isPastTime
                              ? { opacity: 0.5, cursor: "not-allowed" }
                              : {}
                          }
                        >
                          <div className="rptm-screen-time-time">
                            {schedule.starttime.split(" ")[1]?.substring(0, 5)}
                          </div>
                          <div className="rptm-screen-time-seats">
                            {schedule.allseat -
                              (reservedSeatsCount[schedule.schedulecd] || 0)}
                            /{schedule.allseat}
                          </div>
                          <div className="rptm-screen-time-screen">
                            {schedule.screenname}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ScreenSelector;

