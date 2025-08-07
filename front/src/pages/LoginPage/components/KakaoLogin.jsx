import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { kakaoLogin, kakaoCallback, decodeUserid } from "../../../api/userApi";

const KakaoLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKakaoLogin = async () => {
    try {
      // 카카오 로그인 시작 시 loginType을 sessionStorage와 localStorage 둘 다에 설정
      localStorage.setItem("loginType", "kakao");
      sessionStorage.setItem("loginType", "kakao");

      // talk_message 권한을 포함한 스코프 요청
      const response = await kakaoLogin({
        prompt: "login",
        scope: "profile_nickname,talk_message",
      });

      if (response && response.redirectUrl) {
        window.location.href = response.redirectUrl; // 백엔드에서 받은 URL로 리다이렉트
      } else {
        throw new Error("리다이렉트 URL을 받지 못했습니다.");
      }
    } catch (error) {
      alert(`카카오 로그인에 실패했습니다: ${error.message}`);
      localStorage.removeItem("loginType");
      sessionStorage.removeItem("loginType");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const loginType =
      localStorage.getItem("loginType") || sessionStorage.getItem("loginType");

    // 카카오 로그인이 아닌 경우 early return으로 처리 차단
    if (loginType !== "kakao") {
      return;
    }

    // 카카오 로그인인지 확인 - code가 있거나 kakao_login 파라미터가 있으면 카카오 로그인으로 처리
    if (
      code &&
      loginType === "kakao" &&
      window.location.pathname === "/login"
    ) {
      // loginType이 없더라도 /login 경로의 code 파라미터면 카카오로 처리
      if (!loginType) {
        localStorage.setItem("loginType", "kakao");
        sessionStorage.setItem("loginType", "kakao");
      }

      kakaoCallback(code)
        .then(async (response) => {
          // 로컬스토리지에 로그인 상태 저장 (Login.jsx와 동일한 로직)
          localStorage.setItem("isLoggedIn", "true");

          // 응답에서 userid 추출 (백엔드 응답 구조에 따라 조정 필요)
          const tokenizedUserid =
            response.userid ||
            response.id ||
            response.email ||
            response.username;

          if (tokenizedUserid) {
            // JWT 토큰을 디코딩하여 실제 userid 추출 (검증용)
            const realUserid = await decodeUserid(tokenizedUserid);
            if (realUserid) {
              localStorage.setItem("userid", tokenizedUserid); // JWT 토큰화된 userid 저장 (실제 userid 아님)
            } else {
              
              localStorage.setItem("userid", tokenizedUserid); // 백업으로 토큰화된 userid 저장
            }
          }

          // URL에서 code 파라미터 제거 후 홈으로 이동
          navigate("/", { replace: true });
        })
        .catch((error) => {
          // Login.jsx와 유사한 에러 처리
          if (error.response) {
            if (error.response.status === 401) {
              alert("카카오 인증에 실패했습니다.");
            } else if (error.response.status === 404) {
              alert("사용자 정보를 찾을 수 없습니다.");
            } else {
              alert(
                `알 수 없는 오류가 발생했습니다. (상태 코드: ${error.response.status})`
              );
            }
          } else {
            alert("로그인에 실패했습니다. 다시 시도해 주세요.");
          }

          navigate("/login", { replace: true });
        })
        .finally(() => {
          localStorage.removeItem("loginType");
          sessionStorage.removeItem("loginType");
        });
    }
    // kakao_login=success 파라미터 처리는 App.js의 KakaoLoginHandler에서 담당
  }, [navigate, location]);

  return (
    <button className="lgs-social-btn lgs-kakao" onClick={handleKakaoLogin}>
      <span className="lgs-social-icon">K</span>
      카카오로 로그인
    </button>
  );
};

export default KakaoLogin;

