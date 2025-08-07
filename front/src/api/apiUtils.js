import axios from "axios";

// API 설정 및 기본 설정
export const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 공통 API 호출 래퍼 함수
export const apiRequest = async (url, config = {}) => {
  try {
    const method = config.method?.toLowerCase() || "get";
    const { method: _, body, ...restConfig } = config; // method 제거
    let response;

    if (method === "delete" || method === "get") {
      // DELETE와 GET은 config만 전달 (method 속성 제외)
      response = await api[method](url, restConfig);
    } else {
      // POST, PUT 등은 data와 config 모두 전달
      response = await api[method](url, body, restConfig);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Promise 체이닝 방식 API 호출 래퍼
export const apiRequestPromise = (method, url, data = null, config = {}) => {
  return api[method](url, data, config).then((response) => response.data);
};

// 공통 에러 처리 함수
export const handleApiError = (error, defaultReturn = []) => {
  return defaultReturn;
};

// 에러 처리가 포함된 Promise 체이닝 래퍼
export const apiRequestWithErrorHandling = (
  method,
  url,
  data = null,
  config = {},
  errorMessage = "API 요청 실패",
  defaultReturn = []
) => {
  let requestPromise;
  if (method === "delete" || method === "get") {
    // DELETE와 GET은 data 대신 config만 전달
    requestPromise = api[method](url, config);
  } else {
    // POST, PUT 등은 data와 config 모두 전달
    requestPromise = api[method](url, data, config);
  }

  return requestPromise
    .then((response) => response.data)
    .catch((error) => {
      if (defaultReturn !== null) {
        return defaultReturn;
      }
      throw error;
    });
};
