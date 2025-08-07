import React, { createContext, useContext, useState, useEffect } from "react";
import { getMoviesForAdmin } from "../../../api/movieApi";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // 알림 데이터 새로고침
  const refreshNotifications = async () => {
    try {
      const data = await getMoviesForAdmin();
      const readyMovies =
        data.currentMovies?.filter((movie) => movie.movieinfo === "N") || [];

      const newNotifications = [];

      // 상영 준비중인 영화가 있으면 알림 추가
      if (readyMovies.length > 0) {
        newNotifications.push({
          id: "ready-movies",
          type: "info",
          title: "상영 준비중인 영화",
          message: `상영 준비중인 영화가 ${readyMovies.length}개 있습니다.`,
          timestamp: new Date().toISOString(),
          movies: readyMovies,
        });
      }

      setNotifications(newNotifications);
      // 실제 알림이 있을 때만 빨간 점 표시
      setHasNewNotifications(newNotifications.length > 0);
    } catch (error) {
      
    }
  };

  // 컴포넌트 마운트 시 및 주기적으로 알림 확인
  useEffect(() => {
    refreshNotifications();

    // 5분마다 알림 확인
    const interval = setInterval(refreshNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    hasNewNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

