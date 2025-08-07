import { api } from "./apiUtils";

// ========== 관리자 인증 관련 API ==========

// 암호화된 userid 디코딩
export const decodeUserid = async (tokenizedUserid) => {
  try {
    const response = await api.post("/api/auth/decode-userid", {
      tokenizedUserid: tokenizedUserid,
    });

    return response.data.userid;
  } catch (error) {
    throw error;
  }
};

// 관리자 토큰 발급
export const getAdminToken = async (userid) => {
  try {
    const response = await api.get(`/admin/token?userid=${userid}`);

    return response.data.token;
  } catch (error) {
    throw error;
  }
};
