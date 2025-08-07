import axios from "axios";

// ========== SMS 인증 관련 API ==========

const API_BASE_URL = "http://localhost:8080";

// SMS 인증번호 발송
export const sendVerificationCode = async (phoneNumber) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sms/send`, {
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "SMS 전송 실패");
  }
};

// SMS 인증번호 확인
export const verifyCode = async (phoneNumber, certificateNum) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sms/verify`, {
      phoneNumber,
      certificateNum,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "인증 실패");
  }
};

