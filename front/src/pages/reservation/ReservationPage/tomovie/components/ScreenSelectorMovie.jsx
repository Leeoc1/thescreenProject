import React, { useEffect, useState } from "react";
import { getSchedules } from "../../../../../api/cinemaApi";
import { getReservationSeat } from "../../../../../api/reservationApi";

const ScreenSelectorMovie = () => {
  const [movieSchedule, setMovieSchedule] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [reservedSeatsCount, setReservedSeatsCount] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 현재 시간 정보 (컴포넌트 렌더링 시 한 번만 계산)
  const today = new Date();
  const todayDate = today.toLocaleDateString("sv-SE");

  // 세션 스토리지 변경 감지
  useEffect(() => {
    const handleSessionStorageChange = () => {
      const movienm = sessionStorage.getItem("movienm");
      const selectedFullDate = sessionStorage.getItem("selectedFullDate");
      const selectedTheater = sessionStorage.getItem("cinemanm");

      if (movienm && selectedFullDate && selectedTheater) {
        const fetchSchedule = async () => {
          setIsLoading(true);
          try {
            const selectedSchedule = await getSchedules();

            const filteredSchedules = selectedSchedule.filter((schedule) => {
              const movieMatch = schedule.movienm === movienm;
              const dateMatch = schedule.startdate === selectedFullDate;
              const theaterMatch = schedule.cinemanm === selectedTheater;
              const statusMatch = schedule.screenstatus === "사용중";

              return movieMatch && dateMatch && theaterMatch && statusMatch;
            });

            // 상영 시간순으로 정렬
            filteredSchedules.sort(
              (a, b) => new Date(a.starttime) - new Date(b.starttime)
            );
            setMovieSchedule(filteredSchedules);

            // 상영관이 변경되면 선택된 시간 초기화
            setSelectedStartTime(null);
          } catch (error) {
            console.error("상영정보 로딩 중 오류:", error);
            setMovieSchedule([]);
          } finally {
            setIsLoading(false);
          }
        };

        fetchSchedule();
      }
    };

    // 초기 로드 시에도 실행
    handleSessionStorageChange();

    // storage 이벤트 리스너 추가
    window.addEventListener("storage", handleSessionStorageChange);

    // 커스텀 이벤트 리스너 추가 (다른 컴포넌트에서 발생하는 이벤트)
    window.addEventListener("sessionStorageChange", handleSessionStorageChange);

    return () => {
      window.removeEventListener("storage", handleSessionStorageChange);
      window.removeEventListener(
        "sessionStorageChange",
        handleSessionStorageChange
      );
    };
  }, []);

  // 상영 시간 선택
  const handleTimeSelect = (schedule) => {
    setSelectedStartTime(schedule.starttime);
    const timeData = {
      starttime: schedule.starttime,
      reservationseat: schedule.reservationseat,
      allseat: schedule.allseat,
      movienm: sessionStorage.getItem("movienm"),
      screenname: schedule.screenname,
      schedulecd: schedule.schedulecd, // 예약 진행을 위해 schedulecd 추가
      runningtime: schedule.runningtime, // 상영시간
      cinemanm: sessionStorage.getItem("cinemanm"),
    };
    sessionStorage.setItem("selectedMovieTime", JSON.stringify(timeData));

    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent("selectedMovieTimeChanged"));
  };

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

  // screentype 목록을 추출하고 중복 제거
  const uniqueScreentypes = [
    ...new Set(movieSchedule.map((schedule) => schedule.screentype)),
  ];

  return (
    <div className="place-time-list-content">
      {!isLoading && movieSchedule.length === 0 && (
        <div>선택한 조건에 맞는 상영정보가 없습니다.</div>
      )}
      {!isLoading && uniqueScreentypes.length > 0 && (
        <>
          {uniqueScreentypes.map((screentype) => (
            <div key={screentype}>
              <div className="place-screen-type-title">{screentype}</div>
              <div className="place-screen-times-grid">
                {movieSchedule
                  .filter((schedule) => schedule.screentype === screentype)
                  .map((schedule) => {
                    const isToday = schedule.startdate === todayDate;
                    const isPastTime =
                      isToday && new Date(schedule.starttime) <= today;

                    return (
                      <div
                        key={schedule.schedulecd}
                        className={`place-screen-time-card ${
                          selectedStartTime === schedule.starttime
                            ? "place-active"
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
                        <div className="place-screen-time-time">
                          {schedule.starttime.split(" ")[1]?.substring(0, 5)}
                        </div>
                        <div className="place-screen-time-seats">
                          {schedule.allseat -
                            (reservedSeatsCount[schedule.schedulecd] || 0)}
                          /{schedule.allseat}
                        </div>
                        <div className="place-screen-time-screen">
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
  );
};

export default ScreenSelectorMovie;
