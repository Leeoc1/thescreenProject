import React, { useEffect, useState, useRef } from "react";
import { kakaoTemplate } from "../../api/userApi";

const KaKapTemplate = ({ reservationId }) => {
  const [message, setMessage] = useState("");
  const hasExecuted = useRef(false);

  useEffect(() => {
    const sendMessage = async () => {
      // 이미 실행되었다면 중복 실행 방지
      if (hasExecuted.current) {
        return;
      }

      if (!reservationId) {
        return;
      }

      // 토큰 상태 확인
      const accessToken = localStorage.getItem("kakao_access_token");

      // 실행 표시
      hasExecuted.current = true;

      try {
        const response = await kakaoTemplate(reservationId);
        // 메시지 설정 제거
      } catch (error) {
        // 에러 처리는 하되 메시지 표시 안함
      }
    };

    sendMessage();
  }, [reservationId]);

  return null; // 아무것도 렌더링하지 않음
};

export default KaKapTemplate;
