import { apiRequest, apiRequestWithErrorHandling } from "./apiUtils";

// ========== 영화 관련 API (movie 테이블) ==========

// 영화 상세 정보 조회
export const getMovieDetail = async (moviecd) => {
  return await apiRequest("/movies/detail", {
    method: "POST",
    body: { movieno: moviecd },
  });
};

// 찜 상태 및 카운트 조회
export const getWishlistStatus = async (userid, moviecd) => {
  return await apiRequest(
    `/api/wishlist/status?userid=${userid}&moviecd=${moviecd}`,
    { method: "GET" }
  );
};

// 찜 추가/해제 토글
export const toggleWishlist = async (userid, moviecd) => {
  return await apiRequest(
    `/api/wishlist/toggle?userid=${userid}&moviecd=${moviecd}`,
    { method: "POST" }
  );
};

// 내가 찜한 영화 목록 조회
export const getUserWishlist = async (userid) => {
  return await apiRequest(`/api/wishlist/list?userid=${userid}`, {
    method: "GET",
  });
};

// 관리자용 KOBIS 영화 데이터 가져오기 (movie 테이블에 저장)
export const fetchMoviesFromKobis = () =>
  apiRequestWithErrorHandling(
    "post",
    "/movies/fetch-movies",
    null,
    {},
    "Error fetching movies from KOBIS:",
    null
  );

// 현재상영작과 상영예정작 목록 조회 (movie 테이블)
export const getMoviesForAdmin = () =>
  apiRequestWithErrorHandling(
    "get",
    "/movies/admin",
    null,
    {},
    "Error fetching movies for admin:",
    { currentMovies: [], upcomingMovies: [] }
  );

// 영화 정보 수정 (movie 테이블)
export const updateMovie = (moviecd, movieData) =>
  apiRequestWithErrorHandling(
    "put",
    `/movies/${moviecd}`,
    movieData,
    {},
    "Error updating movie:",
    null
  );

// 영화 삭제 (movie 테이블)
export const deleteMovie = (moviecd) =>
  apiRequestWithErrorHandling(
    "delete",
    `/movies/${moviecd}`,
    null,
    {},
    "Error deleting movie:",
    null
  );

// 영화 상영 상태 변경 (movie 테이블)
export const updateScreeningStatus = (moviecd) =>
  apiRequestWithErrorHandling(
    "put",
    `/movies/${moviecd}/screening-status`,
    null,
    {},
    "Error updating screening status:",
    null
  );

// 영화 상영 종료 (논리적 삭제) (movie 테이블)
export const archiveMovie = (moviecd) =>
  apiRequestWithErrorHandling(
    "put",
    `/movies/${moviecd}/archive`,
    null,
    {},
    "Error archiving movie:",
    null
  );

// 현재 상영중 영화 목록 조회 (movie 테이블)
export const getCurrentMovies = () =>
  apiRequestWithErrorHandling(
    "get",
    "/movies/current",
    null,
    {},
    "Error fetching movies:",
    []
  );

// 상영예정 영화 목록 조회 (movie 테이블)
export const getUpcomingMovies = () =>
  apiRequestWithErrorHandling(
    "get",
    "/movies/upcoming",
    null,
    {},
    "Error fetching movies:",
    []
  );

// 박스오피스 TOP 10 영화 조회
export const getTopTenMovies = async () => {
  const res = await fetch("/movies/top/ten");
  if (!res.ok) throw new Error("TOP 10 영화 데이터를 불러오지 못했습니다.");
  return await res.json();
};
