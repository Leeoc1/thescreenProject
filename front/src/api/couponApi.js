import { apiRequest, apiRequestWithErrorHandling } from "./apiUtils";

// ========== 쿠폰 관련 API (coupon 테이블) ==========

/**
 * 사용자별 쿠폰 목록 조회
 */
export const getUserCoupons = async (userid) => {
  try {
    const response = await apiRequest(`/coupons/users/${userid}/coupons`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("쿠폰 목록 조회 오류:", error);
    throw error;
  }
};

/**
 * 사용자별 사용 가능한 쿠폰 목록 조회
 */
export const getAvailableCoupons = async (userid) => {
  try {
    const response = await apiRequest(
      `/coupons/users/${userid}/coupons/available`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("사용 가능한 쿠폰 조회 오류:", error);
    throw error;
  }
};

/**
 * 쿠폰 사용
 */
export const useCoupon = async (userid, couponnum) => {
  try {
    const response = await apiRequest(
      `/coupons/users/${userid}/coupons/${couponnum}/use`,
      {
        method: "PUT",
      }
    );
    return response;
  } catch (error) {
    console.error("쿠폰 사용 오류:", error);
    throw error;
  }
};

/**
 * 쿠폰 상세 조회
 */
export const getCouponDetail = async (userid, couponnum) => {
  try {
    const response = await apiRequest(
      `/coupons/users/${userid}/coupons/${couponnum}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("쿠폰 상세 조회 오류:", error);
    throw error;
  }
};

/**
 * 사용된 쿠폰 목록 조회
 */
export const getUsedCoupons = async (userid) => {
  try {
    const response = await apiRequest(`/coupons/users/${userid}/coupons/used`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("사용된 쿠폰 조회 오류:", error);
    throw error;
  }
};

/**
 * 쿠폰 발급 (관리자 기능)
 */
export const issueCoupon = async (couponData) => {
  try {
    const response = await apiRequest("/coupons/coupons/issue", {
      method: "POST",
      body: couponData,
    });
    return response;
  } catch (error) {
    console.error("쿠폰 발급 오류:", error);
    throw error;
  }
};
