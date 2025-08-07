import React, { useState, useEffect } from "react";
import Header from "../../shared/Header";
import Footer from "../../shared/Footer";
import ImageSlide from "./components/ImageSlide";
import MovieChart from "./components/MovieChart";
import Event from "./components/Event";
import "./styles/HomePage.css";
import Notice from "./components/Notice";
import ChatBot from "./components/ChatBot";
import Toast from "../../utils/Toast";

const HomePage = () => {
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    // 회원가입 완료 메시지 확인
    const message = sessionStorage.getItem("welcomeMessage");
    if (message) {
      setWelcomeMessage(message);
      setShowWelcomeToast(true);
      // 메시지 표시 후 세션 스토리지에서 제거
      sessionStorage.removeItem("welcomeMessage");
    }
  }, []);

  const handleCloseToast = () => {
    setShowWelcomeToast(false);
  };

  return (
    <div>
      <Header />
      <ImageSlide />
      <MovieChart />
      <Event />
      <Notice />
      <ChatBot />
      <Footer />

      {showWelcomeToast && (
        <Toast
          message={welcomeMessage}
          type="success"
          duration={5000}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
};

export default HomePage;

