// 요일명과 색상 정보
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 날짜 배열 생성 함수 (오늘 기준, 앞뒤로 이동 가능)
export function getDateArray(startDate, length = 8, today = new Date()) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    // 과거 날짜 비활성화
    const isPast =
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    arr.push({
      date,
      day: WEEKDAYS[date.getDay()],
      isSaturday: date.getDay() === 6,
      isSunday: date.getDay() === 0,
      isDisabled: isPast,
    });
  }
  return arr;
}

// 날짜 비교 함수 (연,월,일만 비교)
export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// 날짜 라벨 생성 함수
export function getDateLabel(date, today = new Date()) {
  const diff = Math.floor(
    (date - new Date(today.getFullYear(), today.getMonth(), today.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === 2) return "모레";
  return WEEKDAYS[date.getDay()];
}

// 헤더 텍스트 생성 함수
export function getHeaderText(selectedDate, today = new Date()) {
  const diffDays = Math.floor(
    (selectedDate - new Date(today.getFullYear(), today.getMonth(), today.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  let label = "";
  if (diffDays === 0) label = "(오늘)";
  else if (diffDays === 1) label = "(내일)";
  else if (diffDays === 2) label = "(모레)";
  else label = `(${WEEKDAYS[selectedDate.getDay()]})`;

  return `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}${label}`;
}

// 날짜를 YYYY-MM-DD 형식으로 포맷팅
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
} 

