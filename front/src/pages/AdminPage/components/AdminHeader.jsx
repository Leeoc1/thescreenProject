import React, { useState, useRef, useEffect } from "react";
import { getUserInfo } from "../../../api/userApi";
import bellIcon from "../../../images/bell.png";
import "../styles/AdminHeader.css";
import "../styles/AdminPage.css";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../utils/NotificationContext";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { notifications, hasNewNotifications } = useNotification();
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const dropdownRef = useRef(null);
  const [adminName, setAdminName] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분 = 1800초
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  // 토큰 삭제 및 로그아웃 함수
  const clearAdminSession = (reason = "Manual logout") => {
    // 관리자 토큰 제거
    localStorage.removeItem("adminToken");
    // 기본 로그인 정보 제거
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    // 세션 스토리지 전체 정리
    sessionStorage.clear();

    // 홈페이지로 이동
    navigate("/");
  };

  // 30분 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 타이머가 끝나면 자동 로그아웃
          clearAdminSession("세션 타임아웃 (30분 경과)");
          return 0;
        }

        // 5분 남았을 때 연장 팝업 표시 (한 번만)
        if (prev === 300 && !showExtensionModal) {
          setShowExtensionModal(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, showExtensionModal]);

  // 세션 연장 함수
  const extendSession = () => {
    setTimeLeft(30 * 60); // 30분으로 리셋
    setShowExtensionModal(false);
  };

  // 연장 거부 시 즉시 로그아웃
  const declineExtension = () => {
    clearAdminSession("연장 거부로 인한 로그아웃");
  };

  // 시간을 MM:SS 형식으로 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 관리자 이름을 DB에서 가져오기
  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const adminInfo = await getUserInfo("master001");
        setAdminName(adminInfo.username || "관리자");
      } catch (e) {
        setAdminName("관리자");
      }
    };
    fetchAdminName();
  }, []);

  // 페이지 벗어날 때 토큰 삭제
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      localStorage.removeItem("adminToken");
      sessionStorage.clear();
    };

    const handlePopState = () => {
      // 뒤로가기/앞으로가기 버튼 클릭 시
      if (!window.location.pathname.startsWith("/admin")) {
        clearAdminSession("관리자 페이지에서 벗어남 (네비게이션)");
      }
    };

    // 페이지 새로고침, 브라우저 닫기 등
    window.addEventListener("beforeunload", handleBeforeUnload);
    // 뒤로가기/앞으로가기
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 컴포넌트 언마운트 시 토큰 삭제
  useEffect(() => {
    return () => {
      localStorage.removeItem("adminToken");
      sessionStorage.clear();
    };
  }, []);

  const goHome = () => {
    navigate("/");
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className="adp-top-bar">
        <div className="adp-logo" onClick={goHome}>
          <h1>더 스크린 관리자</h1>
        </div>
        <div className="adp-user-info">
          <div className="adp-notification-container" ref={dropdownRef}>
            <div
              className="adp-bell-wrapper"
              onClick={toggleNotificationDropdown}
            >
              <img src={bellIcon} alt="알림" className="adp-bell-icon" />
              {hasNewNotifications && (
                <div className="adp-notification-dot"></div>
              )}
            </div>

            {showNotificationDropdown && (
              <div className="adp-notification-dropdown">
                <div className="adp-notification-header">
                  <h4>알림</h4>
                </div>
                <div className="adp-notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="adp-notification-item"
                      >
                        <div className="adp-notification-content">
                          <div className="adp-notification-title">
                            {notification.title}
                          </div>
                          <div className="adp-notification-message">
                            {notification.message}
                          </div>
                          <div className="adp-notification-timestamp">
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="adp-notification-empty">
                      새로운 알림이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <span>관리자: {adminName}</span>
          <div className="adp-timer-container">
            <div
              className={`adp-timer-clickable ${
                timeLeft <= 300 ? "adp-timer-warning" : ""
              }`}
              onClick={() => setShowExtensionModal(true)}
              title="클릭하여 세션 연장"
            >
              <svg
                className="adp-timer-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <polyline
                  points="12,6 12,12 16,14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="adp-timer-text">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <button
            className="adp-btn-logout"
            onClick={() => clearAdminSession("수동 로그아웃 버튼 클릭")}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 세션 연장 확인 모달 */}
      {showExtensionModal && (
        <div className="adp-modal-overlay">
          <div className="adp-modal-content">
            <h3>세션 연장 확인</h3>
            {timeLeft <= 300 ? (
              <>
                <p>
                  ⚠️ 세션이 {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초 후
                  만료됩니다.
                </p>
                <p>세션을 30분 연장하시겠습니까?</p>
              </>
            ) : (
              <>
                <p>
                  현재 세션이 {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
                  남았습니다.
                </p>
                <p>세션을 30분으로 연장하시겠습니까?</p>
              </>
            )}
            <div className="adp-modal-buttons">
              <button className="adp-btn-extend" onClick={extendSession}>
                연장하기
              </button>
              <button
                className="adp-btn-decline"
                onClick={() => setShowExtensionModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;

