import { apiRequest, apiRequestWithErrorHandling } from "./apiUtils";

// ========== 극장 관련 API (Cinema, screen 테이블) ==========

// 극장 목록 조회 (Cinema 테이블)
export const getCinemas = () =>
  apiRequestWithErrorHandling(
    "get",
    "/cinemas",
    null,
    {},
    "Error fetching cinema:",
    []
  );

// 상영관 조회 (screen 테이블)
export const getScreens = () =>
  apiRequestWithErrorHandling(
    "get",
    "/screens",
    null,
    {},
    "Error fetching screens:",
    []
  );

// 상영관 뷰 조회 (screen_view)
export const getScreenView = async () => {
  return await apiRequest("/screens/view", { method: "GET" });
};

// 상영관 상태 업데이트 (screen 테이블)
export const updateScreenStatus = async (screenData) => {
  return await apiRequest("/screens/statusupdate", {
    method: "PUT",
    body: {
      screencd: screenData.screencd,
      screenstatus: screenData.screenstatus,
    },
  });
};

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

// ========== 스케줄 관련 API (schedule, schedule_view) ==========

// 스케줄 뷰 조회 (schedule_view)
export const getSchedules = (cinemaCd, date) =>
  apiRequestWithErrorHandling(
    "get",
    "/schedules",
    null,
    { params: { cinemaCd, date } },
    "Error fetching schedules:",
    []
  );

export const registerMovie = async (moviecd, screencds) => {
  if (!moviecd || !screencds || screencds.length === 0) {
    throw new Error("영화와 상영관을 선택하세요.");
  }

  const formData = new FormData();
  formData.append("moviecd", moviecd);
  screencds.forEach((screencd) => formData.append("screencds", screencd));

  const res = await fetch("/api/schedules/generate", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "스케줄 생성에 실패했습니다.");
  }

  return data;
};

export const scheduleData = async () => {
  try {
    console.log("API 호출 시작: /api/schedules/generate-dummy");
    const result = await apiRequestWithErrorHandling(
      "post",
      "/api/schedules/generate-dummy",
      null,
      {},
      "Error generating dummy schedule:",
      []
    );
    console.log("API 호출 성공:", result);
    return result;
  } catch (error) {
    console.error("scheduleData API 호출 실패:", error);
    throw error;
  }
};

export const getmycinema = async (userid) => {
  return await apiRequestWithErrorHandling(
    "get",
    "/mycinema",
    null,
    {
      params: { userid },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
    "Error fetching mycinema:",
    []
  );
};

export const updateMyCinema = async (userid, cinemacd) => {
  return await apiRequestWithErrorHandling(
    "post",
    "/mycinema",
    { userid, cinemacd },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    "Error updating mycinema:",
    null
  );
};

export const deleteMyCinema = async (userid, cinemacd) => {
  return await apiRequestWithErrorHandling(
    "delete",
    "/mycinema",
    null,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { userid, cinemacd },
    },
    "Error deleting mycinema:",
    null
  );
};
