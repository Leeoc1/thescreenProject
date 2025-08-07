import React, { useState, useEffect } from "react";
import { WEEKDAYS, getDateArray } from "../../../../../utils/DateUtils";

const DateSelector = () => {
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

    window.dispatchEvent(
      new CustomEvent("sessionStorageChange", {
        detail: {
          selectedFullDate: formattedDate,
          selectedMovieName: null, // 영화 이름도 초기화
        },
      })
    );
  };

  const handleSetSelectedDate = (item) => {
    const newDate = new Date(
      item.date.getFullYear(),
      item.date.getMonth(),
      item.date.getDate()
    );
    setSelectedDate(newDate); // useEffect가 sessionStorage를 업데이트
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
    <div className="rptm-date-selector-section">
      <div className="rptm-date-header">{headerText}</div>
      <div className="rptm-date-selector">
        <div className="rptm-date-list">
          <button
            className="rptm-arrow"
            onClick={() => offset > 0 && setOffset(offset - 1)}
            disabled={offset === 0}
          >
            {"<"}
          </button>
          <div className="rptm-dates">
            {dateArr.map((item, idx) => (
              <div
                key={idx}
                className={`rptm-date-item${
                  isSameDay(item.date, selectedDate) ? " rptm-selected" : ""
                }${item.isSaturday ? " rptm-saturday" : ""}${
                  item.isSunday ? " rptm-sunday" : ""
                }${item.isDisabled ? " rptm-disabled" : ""}`}
                onClick={() => !item.isDisabled && handleSetSelectedDate(item)}
              >
                <div className="rptm-date-num">{item.date.getDate()}</div>
                <div className="rptm-date-label">{getDateLabel(item.date)}</div>
              </div>
            ))}
          </div>
          <button className="rptm-arrow" onClick={() => setOffset(offset + 1)}>
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;

