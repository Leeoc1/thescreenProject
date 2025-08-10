// 토큰화된 userid를 처리하는 유틸리티 함수

// JWT 토큰 형식 간단 검증
const isValidJWTFormat = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3; // JWT는 header.payload.signature 형태
};

// 토큰화된 userid에서 실제 userid 추출
export const decodeUserid = async (tokenizedUserid) => {
  try {
    if (!tokenizedUserid) {
      return null;
    }

    // JWT 형식이 아니면 바로 반환 (이미 디코딩된 userid일 수 있음)
    if (!isValidJWTFormat(tokenizedUserid)) {
      return tokenizedUserid;
    }
    const response = await fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:8080"
      }/auth/decode-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenizedUserid }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.userid;
    } else {
      // 🚫 자동 로그아웃 코드 완전 제거 - 일반 회원가입 사용자 결제 시 로그아웃 방지
    }
    return null;
  } catch (error) {
    return null;
  }
};

// 현재 로그인된 사용자의 실제 userid 가져오기
export const getCurrentUserId = async () => {
  const storedValue = localStorage.getItem("userid");

  if (!storedValue) {
    return null;
  }

  // JWT 형식인지 확인하고 디코딩
  if (isValidJWTFormat(storedValue)) {
    return await decodeUserid(storedValue);
  } else {
    // JWT 형식이 아니면 이미 디코딩된 userid (기존 데이터 호환성)
    return storedValue;
  }
};

// 결제 과정용 userid 가져오기 (getCurrentUserId와 동일하게 변경)
export const getCurrentUserIdForPayment = async () => {
  return await getCurrentUserId();
};

// 보안 로그아웃 (기존 로그아웃과 동일)
export const secureLogout = () => {
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
  localStorage.removeItem("authData");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // 레거시 데이터 정리 (기존에 잘못 저장된 데이터)
  localStorage.removeItem("tokenizedUserid");

  // 세션 스토리지 전체 정리
  sessionStorage.clear();

  return true;
};
