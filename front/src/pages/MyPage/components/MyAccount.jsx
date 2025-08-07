import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyAccount.css";
import MyCoupons from "./MyCoupons";

const MyAccount = ({ loading, userInfo, currentPage }) => {
  const navigate = useNavigate();
  const [showCouponModal, setShowCouponModal] = useState(false);

  // 개인정보수정 페이지로 넘기기
  const handleGoToMyInfo = () => {
    navigate("/mypage/myinfo", { state: { userInfo } });
  };

  // 마이페이지로 돌아가기
  const handleGoToMyPage = () => {
    navigate("/mypage");
  };

  // 쿠폰함 모달 열기
  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
  };

  // 쿠폰함 모달 닫기
  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
  };

  return (
    <section className="mp-profile-section">
      <div className="mp-profile-container">
        <div className="mp-profile-card">
          <div className="mp-profile-avatar">
            <svg
              className="mp-avatar-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            ></svg>
          </div>
          <div className="mp-profile-info">
            <h1 className="mp-profile-greeting">안녕하세요!</h1>
            <p className="mp-profile-name">
              {loading
                ? "로딩 중..."
                : userInfo
                ? `"${userInfo.username}"님`
                : '"사용자"님'}
            </p>
            {currentPage === 0 ? (
              <p className="mp-profile-link" onClick={handleGoToMyInfo}>
                개인정보설정 &gt;
              </p>
            ) : (
              <p className="mp-profile-link" onClick={handleGoToMyPage}>
                마이페이지 &gt;
              </p>
            )}

            <p className="mp-profile-link" onClick={handleOpenCouponModal}>
              쿠폰함 &gt;
            </p>
          </div>
        </div>
      </div>

      {/* 쿠폰함 모달 */}
      <MyCoupons
        showCouponModal={showCouponModal}
        handleCloseCouponModal={handleCloseCouponModal}
        userInfo={userInfo}
      />
    </section>
  );
};

export default MyAccount;

