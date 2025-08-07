import React, { useState, useEffect } from "react";
import { WEEKDAYS, getDateArray } from "../../../../../utils/DateUtils";

const DateSelectorMovie = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간대 문제 방지
  const [offset, setOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + offset);
  const dateArr = getDateArray(baseDate, 8, today);

  // 선택된 날짜에 대한 라벨 계산
  const diffDays = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
  const label =
    diffDays === 0
      ? "(오늘)"
      : diffDays === 1
      ? "(내일)"
      : diffDays === 2
      ? "(모레)"
      : `(${WEEKDAYS[selectedDate.getDay()]})`;
  const headerText = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
    2,
    "0"
  )}${label}`;

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // 세션 스토리지 업데이트 및 이벤트 발생 공통 함수
  const updateSessionStorageAndNotify = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    sessionStorage.setItem("selectedFullDate", formattedDate);
    sessionStorage.removeItem("selectedMovieName");
    sessionStorage.removeItem("selectedMovieTime");
    sessionStorage.removeItem("cinemanm"); // 상영관명 제거

    window.dispatchEvent(
      new CustomEvent("sessionStorageChange", {
        detail: { 
          selectedFullDate: formattedDate,
          selectedMovieName: null, // 영화 이름도 초기화
          cinemanm: null // 상영관명도 초기화
        },
      })
    );

    // selectedMovieTime이 초기화되었음을 알리는 커스텀 이벤트
    window.dispatchEvent(new CustomEvent("selectedMovieTimeCleared"));
  };

  const handleSetSelectedDate = (item) => {
    const newDate = new Date(
      item.date.getFullYear(),
      item.date.getMonth(),
      item.date.getDate()
    );
    setSelectedDate(newDate);
  };

  useEffect(() => {
    updateSessionStorageAndNotify(selectedDate);
  }, [selectedDate]);

  // 각 날짜 항목의 라벨 계산
  const getDateLabel = (date) => {
    const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    return diff === 0
      ? "오늘"
      : diff === 1
      ? "내일"
      : diff === 2
      ? "모레"
      : WEEKDAYS[date.getDay()];
  };

  return (
    <div className="date-selector-section">
      <div className="date-header">{headerText}</div>
      <div className="date-selector">
        <div className="date-list">
          <button
            className="arrow"
            onClick={() => offset > 0 && setOffset(offset - 1)}
            disabled={offset === 0}
          >
            {"<"}
          </button>
          <div className="dates">
            {dateArr.map((item, idx) => (
              <div
                key={idx}
                className={`date-item${
                  isSameDay(item.date, selectedDate) ? " selected" : ""
                }${item.isSaturday ? " saturday" : ""}${
                  item.isSunday ? " sunday" : ""
                }${item.isDisabled ? " disabled" : ""}`}
                onClick={() => !item.isDisabled && handleSetSelectedDate(item)}
              >
                <div className="date-num">{item.date.getDate()}</div>
                <div className="date-label">{getDateLabel(item.date)}</div>
              </div>
            ))}
          </div>
          <button className="arrow" onClick={() => setOffset(offset + 1)}>
            {">"}
          </button>
        </div>
      </div>


    </div>
  );
};

export default DateSelectorMovie;

