// ========== 영화 정보 관련 유틸리티 함수 ==========

// 영화 관람 등급 조회
export const getRating = (isAdult) => {
  return isAdult === "Y" ? "청소년 관람불가" : "전체 관람가";
};

