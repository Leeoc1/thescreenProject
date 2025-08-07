import { apiRequest } from "./apiUtils";

// ========== 쿠폰 관련 API (coupon, coupon_type 테이블) ==========

// 사용자 쿠폰 목록 조회
export const getUserCoupons = async (userid) => {
  try {
    const response = await apiRequest(`/api/users/${userid}/coupons`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// 쿠폰 사용
export const useCoupon = async (userid, couponnum) => {
  try {
    const response = await apiRequest(
      `/api/users/${userid}/coupons/${couponnum}/use`,
      {
        method: "PUT",
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// 쿠폰 발급 (관리자 기능)
export const issueCoupon = async (userid, couponcd, couponexpiredate) => {
  try {
    const response = await apiRequest("/api/coupons/issue", {
      method: "POST",
      body: JSON.stringify({
        userid,
        couponcd,
        couponexpiredate,
      }),
    });
    return response;
  } catch (error) {
    throw error;
  }
};
