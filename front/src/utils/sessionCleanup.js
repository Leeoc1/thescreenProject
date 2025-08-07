/**
 * 세션스토리지 정리 유틸리티
 * 예매 프로세스의 각 단계에서 적절한 세션 정리를 수행
 */

// 예매 관련 모든 키 목록
export const RESERVATION_KEYS = {
  // 예매 선택 정보
  FINAL_RESERVATION_INFO: "finalReservationInfo",
  SELECTED_SEATS: "selectedSeats",
  SELECTED_MOVIE_TIME: "selectedMovieTime",
  SELECTED_MOVIE: "selectedMovie",
  SELECTED_FULL_DATE: "selectedFullDate",
  RESERVATION_INFO: "reservationInfo",

  // 영화/극장 선택 정보
  MOVIE_NAME: "movienm",
  CINEMA_NAME: "cinemanm",
  SELECTED_MOVIE_NAME: "selectedMovieName",
  SELECTED_THEATER: "selectedTheater",

  // 결제 관련 정보
  GUEST_COUNT: "guestCount",
  TOTAL_GUESTS: "totalGuests",
  FINAL_PRICE: "finalPrice",
  TOTAL_PRICE: "totalPrice",
  SELECTED_COUPON: "selectedCoupon",

  // 결제 처리 정보
  PAYMENT_REQUEST_DATA: "paymentRequestData",
  PAYMENT_RESPONSE_DATA: "paymentResponseData",
  PAYMENT_CD: "paymentcd",
  CONFIRM_REQUESTED: "confirmRequested",

  // 기타 임시 정보
  CURRENT_STEP: "currentStep",
  RESERVATION_STEP: "reservationStep",
};

// 로그인 관련 키 (정리하면 안 되는 키들)
export const LOGIN_KEYS = {
  USER_ID: "userid",
  IS_LOGGED_IN: "isLoggedIn",
  TOKEN: "token",
  ROLE: "role",
};

/**
 * 예매 취소 시 세션 정리 (결제 전)
 */
export const cleanupOnReservationCancel = () => {
  const keysToRemove = [
    RESERVATION_KEYS.FINAL_RESERVATION_INFO,
    RESERVATION_KEYS.SELECTED_SEATS,
    RESERVATION_KEYS.SELECTED_MOVIE_TIME,
    RESERVATION_KEYS.SELECTED_MOVIE,
    RESERVATION_KEYS.RESERVATION_INFO,
    RESERVATION_KEYS.SELECTED_FULL_DATE,
    RESERVATION_KEYS.MOVIE_NAME,
    RESERVATION_KEYS.CINEMA_NAME,
    RESERVATION_KEYS.GUEST_COUNT,
    RESERVATION_KEYS.TOTAL_GUESTS,
    RESERVATION_KEYS.FINAL_PRICE,
    RESERVATION_KEYS.SELECTED_COUPON,
  ];

  removeSessionKeys(keysToRemove);
};

/**
 * 결제 실패 시 세션 정리
 */
export const cleanupOnPaymentFailure = () => {
  const keysToRemove = [...Object.values(RESERVATION_KEYS)];

  removeSessionKeys(keysToRemove);
};

/**
 * 결제 성공 시 민감한 결제 정보만 정리
 */
export const cleanupSensitivePaymentData = () => {
  const keysToRemove = [
    RESERVATION_KEYS.PAYMENT_REQUEST_DATA,
    RESERVATION_KEYS.PAYMENT_RESPONSE_DATA,
    RESERVATION_KEYS.CONFIRM_REQUESTED,
    RESERVATION_KEYS.PAYMENT_CD,
  ];

  removeSessionKeys(keysToRemove);
};

/**
 * 예매 완료 시 모든 예매 관련 정보 정리
 */
export const cleanupOnReservationComplete = () => {
  const keysToRemove = [...Object.values(RESERVATION_KEYS)];

  removeSessionKeys(keysToRemove);
};

/**
 * 로그아웃 시 모든 정보 정리 (로그인 정보 포함)
 */
export const cleanupOnLogout = () => {
  // 모든 sessionStorage 클리어
  sessionStorage.clear();
};

/**
 * 헬퍼 함수: 키 배열을 받아서 세션에서 제거
 */
const removeSessionKeys = (keys) => {
  keys.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * 헬퍼 함수: 현재 세션스토리지 상태 로깅
 */
export const logSessionState = (context = "") => {
  // 로깅 함수는 비워둠 (디버깅 시에만 사용)
};
