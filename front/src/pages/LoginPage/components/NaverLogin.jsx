import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { naverLogin, naverLoginCallback } from "../../../api/userApi";

const NaverLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 콜백 처리 중복 방지를 위한 ref
  const callbackProcessed = useRef(false);

  // 네이버 로그인 콜백 처리
  useEffect(() => {
    // 이미 처리된 경우 중복 실행 방지
    if (callbackProcessed.current) {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    const loginType = localStorage.getItem("loginType");

    // 네이버 로그인이 아닌 경우 early return으로 처리 차단
    if (loginType !== "naver") {
      return;
    }

    // 네이버 콜백에 필요한 파라미터가 없는 경우도 차단
    if (!code && !error) {
      return;
    }

    // 에러 처리 개선
    if (error === "access_denied") {
      alert("네이버 로그인 동의가 취소되었습니다.");
      localStorage.removeItem("loginType");
      navigate("/login");
      return;
    }

    // 네이버 로그인인지 확인하고, 네이버 콜백만 처리
    if (code && state) {
      // 중복 처리 방지 플래그 설정
      callbackProcessed.current = true;

      (async () => {
        try {
          const result = await naverLoginCallback(code, state);

          if (result.success) {
            if (!result.userid) {
              
              alert("로그인 처리 중 오류가 발생했습니다. (토큰 없음)");
              localStorage.removeItem("loginType");
              navigate("/login");
              return;
            }

            // 반드시 JWT 토큰을 저장
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userid", result.userid); // JWT 토큰만 저장
            localStorage.setItem("userInfo", JSON.stringify(result.userInfo));

            // loginType은 성공 후에 제거
            localStorage.removeItem("loginType");

            // 즉시 홈으로 이동 (replace: true로 login 페이지 히스토리 제거)
            navigate("/", { replace: true });
          } else {
            
            alert("네이버 로그인 실패: " + result.error);
            localStorage.removeItem("loginType");
            navigate("/login");
          }
        } catch (error) {
          
          alert("네이버 로그인 처리 중 오류가 발생했습니다.");
          localStorage.removeItem("loginType");
          navigate("/login");
        } finally {
          // 처리 완료 후 플래그 초기화 (실패 시에도)
          setTimeout(() => {
            callbackProcessed.current = false;
          }, 1000);
        }
      })();
    }
  }, [location.search, navigate]);

  // 네이버 로그인 버튼 클릭 핸들러
  const handleNaverLogin = async () => {
    try {
      localStorage.setItem("loginType", "naver");

      const response = await naverLogin();

      if (response && response.loginUrl) {
        window.location.href = response.loginUrl;
      } else {
        
        alert("네이버 로그인 URL을 받아올 수 없습니다.");
      }
    } catch (error) {
      
      
      alert("네이버 로그인을 시작할 수 없습니다. 서버 연결을 확인해주세요.");
      localStorage.removeItem("loginType");
    }
  };

  return (
    <button className="lgs-social-btn lgs-naver" onClick={handleNaverLogin}>
      <span className="lgs-social-icon">N</span>
      네이버로 로그인
    </button>
  );
};

export default NaverLogin;

