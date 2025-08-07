import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRequiredModal.css";

const LoginRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    navigate("/login");
  };

  const handleCancelClick = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="lrm-backdrop" onClick={handleBackdropClick}>
      <div className="lrm-modal">
        <div className="lrm-header">
          <h2 className="lrm-title">🔒 로그인이 필요합니다</h2>
        </div>

        <div className="lrm-content">
          <p className="lrm-message">
           서비스를 이용하시려면 로그인이 필요합니다.
          </p>
          <p className="lrm-submessage">
            로그인 후 다양한 서비스를 이용해보세요!
          </p>
        </div>

        <div className="lrm-buttons">
          <button 
            className="lrm-btn lrm-btn-cancel" 
            onClick={handleCancelClick}
          >
            취소
          </button>
          <button 
            className="lrm-btn lrm-btn-login" 
            onClick={handleLoginClick}
          >
            로그인하기
          </button>
        </div>

        <button 
          className="lrm-close-btn" 
          onClick={handleCancelClick}
          aria-label="모달 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LoginRequiredModal;

