// API 기능별 분리 - 통합 인덱스 파일
// 이전 방식과의 호환성을 위해 모든 함수를 다시 export

// 영화 관련 API
export {
  getMovieDetail,
  fetchMoviesFromKobis,
  getMoviesForAdmin,
  updateMovie,
  deleteMovie,
  updateScreeningStatus,
  archiveMovie,
  getCurrentMovies,
  getUpcomingMovies,
} from "./movieApi";

// 극장/상영관/스케줄 관련 API  
export {
  getCinemas,
  getScreens,
  getScreenView,
  updateScreenStatus,
  getRegions,
  getSchedules,
} from "./cinemaApi";

// 예약/결제 관련 API
export {
  saveReservation,
  getReservation,
  getReservationSeat,
  savePayment,
  getTotalVolume,
  getCinemaVolume,
} from "./reservationApi";

// 사용자/직원/공지사항/소셜로그인 관련 API
export {
  getAllUsers,
  isAvailableUserId,
  registerUser,
  getStaffs,
  updateStaff,
  addStaff,
  fetchAllNotices,
  fetchAllFaqs,
  getKakaoApiKey,
  getGoogleClientId,
  getGoogleUserInfo,
  getGooglePeopleData,
  saveGoogleUserToBackend,
  kakaoLogin,
  kakaoCallback,
  naverLogin,
  naverLoginCallback,
  createReview,
  fetchAllReviews,
} from "./userApi";

// 기본 API 인스턴스 export (호환성)
export { api as default } from "./apiUtils";

