import { apiRequestWithErrorHandling } from "./apiUtils";

// ========== 극장 관련 API (cinema, screen 테이블) ==========

// 극장 목록 조회 (cinema 테이블)
export const getCinemas = () =>
  apiRequestWithErrorHandling(
    "get",
    "/cinemas",
    null,
    {},
    "Error fetching cinema:",
    []
  );

// 상영관 목록 조회 (screen 테이블)
export const getScreens = (cinemaid) =>
  apiRequestWithErrorHandling(
    "get",
    `/cinemas/${cinemaid}/screens`,
    null,
    {},
    "Error fetching screens:",
    []
  );

// ========== 지역 관련 API (region 테이블) ==========

// 지역 목록 조회 (region 테이블)
export const getRegions = () =>
  apiRequestWithErrorHandling(
    "get",
    "/regions",
    null,
    {},
    "Error fetching regions:",
    []
  );

// 지역별 극장 조회 (region, cinema 테이블 조인)
export const getCinemasByRegion = (regioncd) =>
  apiRequestWithErrorHandling(
    "get",
    `/regions/${regioncd}/cinemas`,
    null,
    {},
    "Error fetching regions:",
    []
  );

// ========== 상영 스케줄 관련 API (schedule 테이블) ==========

// 스케줄 조회 - 매개변수 없이 호출하면 전체 스케줄, 매개변수가 있으면 필터링된 스케줄
export const getSchedules = () =>
  apiRequestWithErrorHandling(
    "get",
    "/schedule-view",
    null,
    {},
    "Error fetching schedules:",
    []
  );

// 스케줄 생성 (관리자 기능)
export const generateSchedules = async (moviecd, screencds) => {
  if (!moviecd || !screencds || screencds.length === 0) {
    throw new Error("영화와 상영관을 선택해주세요.");
  }

  const formData = new FormData();
  formData.append("moviecd", moviecd);
  screencds.forEach((screencd) => formData.append("screencds", screencd));

  const res = await fetch("/schedules/generate", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "스케줄 생성에 실패했습니다.");
  }

  return data;
};

// ========== 마이시네마 관련 API (mycinema 테이블) ==========

// 마이시네마 목록 조회 (mycinema 테이블)
export const getMyCinemas = (userid) =>
  apiRequestWithErrorHandling(
    "get",
    `/users/${userid}/mycinemas`,
    null,
    {},
    "Error fetching mycinema:",
    []
  );

// getMyCinemas의 별칭 (하위 호환성)
export const getmycinema = getMyCinemas;

// 마이시네마 추가
export const addMyCinema = (userid, cinemaid) =>
  apiRequestWithErrorHandling(
    "post",
    `/users/${userid}/mycinemas`,
    { cinemaid },
    {},
    "Error adding mycinema:",
    null
  );

// addMyCinema의 별칭 (하위 호환성)
export const updateMyCinema = addMyCinema;

// 마이시네마 삭제
export const removeMyCinema = (userid, cinemaid) =>
  apiRequestWithErrorHandling(
    "delete",
    `/users/${userid}/mycinemas/${cinemaid}`,
    null,
    {},
    "Error removing mycinema:",
    null
  );

// removeMyCinema의 별칭 (하위 호환성)
export const deleteMyCinema = removeMyCinema;

// ========== 관리자용 스크린 관리 API ==========

// 모든 스크린 조회 (관리자용)
export const getScreenView = () =>
  apiRequestWithErrorHandling(
    "get",
    "/screens/view",
    null,
    {},
    "Error fetching screen view:",
    []
  );

// 스크린 상태 업데이트 (관리자용)
export const updateScreenStatus = (screencd, screenstatus) =>
  apiRequestWithErrorHandling(
    "put",
    "/screens/statusupdate",
    { screencd, screenstatus },
    {},
    "Error updating screen status:",
    null
  );

// ========== 영화 등록 관련 API (관리자용) ==========

// 영화 스케줄 등록 (generateSchedules의 별칭)
export const registerMovie = async (moviecd, screencds) => {
  return await generateSchedules(moviecd, screencds);
};
