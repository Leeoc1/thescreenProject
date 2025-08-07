import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  getGoogleUserInfo,
  getGooglePeopleData,
  saveGoogleUserToBackend,
  getGoogleClientId,
} from "../../../api/api";

const GoogleLoginButton = ({ onLoginAttempt }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 기본 사용자 정보 가져오기
        const userInfo = await getGoogleUserInfo(tokenResponse.access_token);

        // People API를 통해 추가 정보 가져오기
        const peopleData = await getGooglePeopleData(
          tokenResponse.access_token
        );

        // 모든 정보 결합
        const completeUserInfo = {
          ...userInfo,
          birthdays: peopleData.birthdays,
          phoneNumbers: peopleData.phoneNumbers,
        };

        // 백엔드로 사용자 정보 전송
        const savedUser = await saveGoogleUserToBackend(completeUserInfo);

        // 로그인 성공 처리
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userid", savedUser.userid);
        localStorage.setItem("username", savedUser.username);

        alert("구글 로그인 성공!");
        navigate("/");
      } catch (error) {
        
        alert("구글 로그인 처리 중 오류가 발생했습니다.");
      }
    },
    onError: (error) => {
      
      alert("구글 로그인에 실패했습니다.");
    },
    scope:
      "openid email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.phonenumbers.read",
  });

  const handleClick = () => {
    if (onLoginAttempt) {
      onLoginAttempt("구글");
    }

    // 구글 로그인 시작 시 loginType 설정
    localStorage.setItem("loginType", "google");
    sessionStorage.setItem("loginType", "google");

    googleLogin();
  };

  return (
    <button className="lgs-social-btn lgs-google" onClick={handleClick}>
      <span className="lgs-social-icon">G</span>
      구글로 로그인
    </button>
  );
};

const GoogleLogin = ({ onLoginAttempt }) => {
  const [googleClientId, setGoogleClientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const clientId = await getGoogleClientId();
        setGoogleClientId(clientId);
      } catch (error) {
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, []);

  if (isLoading || !googleClientId) {
    return (
      <button className="lgs-social-btn lgs-google" disabled>
        <span className="lgs-social-icon">G</span>
        로딩 중...
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleLoginButton onLoginAttempt={onLoginAttempt} />
    </GoogleOAuthProvider>
  );
};

export default GoogleLogin;

