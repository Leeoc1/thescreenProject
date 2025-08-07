import { api, apiRequest, apiRequestWithErrorHandling } from "./apiUtils";

// ========== JWT 토큰 관리 ==========

// JWT 토큰에서 실제 userid 디코딩
export const decodeUserid = async (token) => {
  try {
    const response = await apiRequest("/api/auth/decode-token", {
      method: "POST",
      body: { token },
    });
    return response.userid;
  } catch (error) {
    return null;
  }
};

// ========== 사용자 관리 API (users 테이블) ==========

// 전체 사용자 목록 조회 (users 테이블)
export const getAllUsers = () =>
  apiRequestWithErrorHandling(
    "get",
    "/users/list",
    null,
    {},
    "Error fetching users:",
    []
  );

// 사용자 ID 중복 확인 (users 테이블)
export const isAvailableUserId = async (userid) => {
  return await apiRequest("/users/idcheck", {
    method: "POST",
    body: { userid: userid },
  });
};

// 사용자 회원가입 (users 테이블)
export const registerUser = async (userData) => {
  return await apiRequest("/users/register", {
    method: "POST",
    body: userData,
  });
};

// 사용자 정보 조회 (users 테이블)
export const getUserInfo = async (userid) => {
  return await apiRequest(`/users/info/${userid}`, { method: "GET" });
};

// 사용자별 예약 정보 조회 (users 테이블)
export const getUserReservations = async (userid) => {
  return await apiRequest(`/users/${userid}/reservations`, { method: "GET" });
};

// 개인정보수정 시 비밀번호 확인 (users 테이블)
export const checkPassword = async (userid, userpw) => {
  return await apiRequest("/users/pwcheck", {
    method: "POST",
    body: {
      userid: userid,
      userpw: userpw,
    },
  });
};

// 비밀번호 변경 (users 테이블)
export const updatePassword = async (userid, userpw) => {
  return await apiRequest(`/users/${userid}/update/password`, {
    method: "PUT",
    body: {
      userid: userid,
      userpw: userpw,
    },
  });
};

// 개인정보 수정 (users 테이블)
export const updateUserInfo = async (userid, userData) => {
  return await apiRequest(`/users/${userid}/update/userinfo`, {
    method: "PUT",
    body: userData,
  });
};

// 회원탈퇴 (users 테이블)
export const deleteUser = async (userid) => {
  try {
    const result = await apiRequest(`/users/${userid}`, { method: "DELETE" });

    return result;
  } catch (error) {
    throw error;
  }
};

// 로그아웃 처리 (클라이언트 사이드)
export const logoutUser = () => {
  try {
    // 기본 로그인 정보 제거
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userid"); // JWT 토큰화된 userid 제거
    localStorage.removeItem("username"); // 보안상 제거

    // 카카오 로그인 관련 데이터 제거
    localStorage.removeItem("loginType");
    localStorage.removeItem("kakao_access_token");
    sessionStorage.removeItem("loginType");

    // 네이버 로그인 관련 데이터 제거
    localStorage.removeItem("userInfo");

    // 토스페이먼츠 관련 데이터 제거
    localStorage.removeItem("@tosspayments/merchant-browser-id");
    localStorage.removeItem(
      "@tosspayments/payment-widget-previous-payment-method-id"
    );

    // 추가 보안을 위해 다른 사용자 관련 데이터도 제거
    localStorage.removeItem("userToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authData");

    // 레거시 데이터 정리 (기존에 잘못 저장된 데이터)
    localStorage.removeItem("tokenizedUserid");

    // 세션 스토리지 전체 정리
    sessionStorage.clear();

    return true;
  } catch (error) {
    return false;
  }
};

// ========== 직원 관리 API (staff 테이블) ==========

// 직원 목록 조회 (staff 테이블)
export const getStaffs = () =>
  apiRequestWithErrorHandling(
    "get",
    "/staff",
    null,
    {},
    "Error fetching staffs:",
    []
  );

// 직원 정보 수정 (staff 테이블)
export const updateStaff = async (staffData) => {
  return await apiRequest("/staff/update", { method: "PUT", body: staffData });
};

// 직원 정보 추가 (staff 테이블)
export const addStaff = async (staffData) => {
  return await apiRequest("/staff/add", { method: "POST", body: staffData });
};

// ========== 공지사항 및 FAQ API (notice, faq 테이블) ==========

// 공지사항 전체 조회 (notice 테이블)
export const fetchAllNotices = () =>
  apiRequestWithErrorHandling(
    "get",
    "/api/notice/notice",
    null,
    {},
    "Error fetching notices:",
    []
  );

// FAQ 전체 조회 (faq 테이블)
export const fetchAllFaqs = () =>
  apiRequestWithErrorHandling(
    "get",
    "/api/faq/faq",
    null,
    {},
    "Error fetching faqs:",
    []
  );

// ========== 외부 API 키 조회 ==========

// 카카오 API 키 조회 (서버 설정값)
export const getKakaoApiKey = async () => {
  const response = await apiRequest("/api/kakao", { method: "GET" });
  return response.key;
};

// ========== 외부 소셜 로그인 API ==========

// Google OAuth 클라이언트 ID 조회 (서버 설정값)
export const getGoogleClientId = async () => {
  try {
    const response = await apiRequest("/google/client-id", { method: "GET" });
    return response.clientId;
  } catch (error) {
    throw error;
  }
};

// Google 사용자 정보 조회 (외부 Google API)
export const getGoogleUserInfo = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  return response.json();
};

// Google People API 데이터 조회 (외부 Google API)
export const getGooglePeopleData = async (accessToken) => {
  const response = await fetch(
    "https://people.googleapis.com/v1/people/me?personFields=birthdays,phoneNumbers,names,emailAddresses",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch people data");
  }

  return response.json();
};

// Google 사용자 정보를 백엔드에 저장 (users 테이블)
export const saveGoogleUserToBackend = async (userInfo) => {
  const response = await fetch("http://localhost:8080/google/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  });

  if (!response.ok) {
    throw new Error("Failed to save user to backend");
  }

  return response.json();
};

// 카카오 로그인 (외부 카카오 API)
export const kakaoLogin = async (params) => {
  const response = await api.post("/login/kakao", null, { params });
  return response.data;
};

// 카카오 로그인 콜백 처리 (외부 카카오 API)
export const kakaoCallback = async (code) => {
  const response = await api.get("/login/oauth2/code/kakao", {
    params: { code },
  });
  return response.data;
};

// 네이버 로그인 URL 가져오기 (외부 네이버 API)
export const naverLogin = async () => {
  try {
    const response = await apiRequest("/naver/login", { method: "POST" });
    return response;
  } catch (error) {
    throw error;
  }
};

// 네이버 로그인 콜백 처리 (외부 네이버 API, users 테이블에 저장)
export const naverLoginCallback = async (code, state) => {
  try {
    const response = await apiRequest(
      `/naver/login/callback?code=${code}&state=${state}`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// 리뷰 작성
export const createReview = (reviewData) => {
  return api
    .post("/api/review/review", reviewData)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

// 리뷰 목록 조회
export const fetchAllReviews = () => {
  return apiRequestWithErrorHandling(
    "get",
    "/api/review/review",
    null,
    {},
    "리뷰 목록 조회 실패:",
    []
  );
};

export const kakaoTemplate = (reservationId) => {
  const accessToken = localStorage.getItem("kakao_access_token");
  return apiRequestWithErrorHandling(
    "post",
    "login/api/send-reservation-message",
    { reservationId, accessToken },
    {},
    "카카오 템플릿 조회 실패:",
    []
  );
};
