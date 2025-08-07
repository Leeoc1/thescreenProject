import "../styles/MyPageMain.css";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import { useState, useEffect } from "react";

import {
  getUserInfo,
  getUserReservations,
  deleteUser,
  logoutUser,
} from "../../../api/userApi";
import MyPageReservationDetail from "./MyPageReservationDetail";
import MyPageHistory from "./MyPageHistory";
import MyPageReservation from "./MyPageReservation";
import MyPageLike from "./MyPageLike";
import MyPageInquiry from "./MyPageInquiry";
import MyAccount from "./MyAccount";
import { getUserWishlist } from "../../../api/movieApi";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/tokenUtils";

const MyPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  // 예매내역 상세 모달
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  // 히스토리 모달 (더보기)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // 찜한 영화 목록 상태
  const [wishlist, setWishlist] = useState([]);

  // 회원탈퇴 모달 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalText, setWithdrawalText] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 토큰에서 실제 userid 추출
        const userid = await getCurrentUserId();

        if (userid) {
          // 사용자 정보 조회
          const userResponse = await getUserInfo(userid);
          setUserInfo(userResponse);

          // 사용자 예약 정보 조회
          const reservationsResponse = await getUserReservations(userid);
          setUserReservations(reservationsResponse);

          // 찜한 영화 목록 조회
          const wishlistResponse = await getUserWishlist(userid);
          setWishlist(wishlistResponse);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 예매 내역 상세 팝업 열기
  const handleReservationDetails = (reservationcd) => {
    const reservation = userReservations.find(
      (r) => r.reservationcd === reservationcd
    );
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // 상세 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  // 회원탈퇴 모달 열기
  const handleWithdrawalClick = () => {
    setShowWithdrawalModal(true);
    setWithdrawalText("");
  };

  // 회원탈퇴 모달 닫기
  const handleWithdrawalCancel = () => {
    setShowWithdrawalModal(false);
    setWithdrawalText("");
  };

  // 회원탈퇴 처리
  const handleWithdrawalConfirm = async () => {
    if (withdrawalText !== "탈퇴합니다") {
      alert("'탈퇴합니다'를 정확히 입력해주세요.");
      return;
    }

    try {
      // 토큰에서 실제 userid 추출
      const userid = await getCurrentUserId();

      if (userid) {
        const response = await deleteUser(userid);

        // 자동 로그아웃 처리
        const logoutSuccess = logoutUser();
        if (logoutSuccess) {
        }

        // 회원탈퇴 모달 닫기
        setShowWithdrawalModal(false);
        setWithdrawalText("");

        alert("회원탈퇴가 완료되었습니다. 로그아웃됩니다.");

        // 홈페이지로 이동
        navigate("/");

        // 페이지 새로고침으로 완전한 상태 초기화
        window.location.reload();
      } else {
        
        alert("로그인 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      
      
      
      

      if (error.response?.status === 404) {
        alert(
          "사용자를 찾을 수 없습니다. 이미 탈퇴되었거나 존재하지 않는 계정입니다."
        );
      } else {
        alert(
          `회원탈퇴 중 오류가 발생했습니다: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  // 히스토리 모달 열기/닫기
  const handleOpenHistoryModal = () => setShowHistoryModal(true);
  const handleCloseHistoryModal = () => setShowHistoryModal(false);

  // 예약 목록 새로고침 함수
  const refreshReservations = async () => {
    try {
      const userid = await getCurrentUserId();
      if (userid) {
        const reservationsResponse = await getUserReservations(userid);
        setUserReservations(reservationsResponse);
      }
    } catch (error) {
      
    }
  };

  return (
    <div>
      <Header />
      <div className="mp-my-page">
        {/* User Profile Section */}
        <MyAccount loading={loading} userInfo={userInfo} currentPage={0} />

        {/* Main Content */}
        <div className="mp-main-content">
          {/* 영화 예매 내역 Section */}
          <section className="mp-section">
            <div className="mp-section-header">
              <h2 className="mp-section-title">예매내역</h2>
              <button
                className="mp-more-button"
                onClick={handleOpenHistoryModal}
              >
                히스토리 보기
              </button>
            </div>
            {/* 예매 상세 내역 모달 */}
            <MyPageReservationDetail
              showModal={showModal}
              selectedReservation={selectedReservation}
              handleCloseModal={handleCloseModal}
              setUserReservations={setUserReservations}
              refreshReservations={refreshReservations}
            />
            {/* 히스토리 모달 */}
            <MyPageHistory
              showHistoryModal={showHistoryModal}
              loading={loading}
              userReservations={userReservations}
              handleCloseHistoryModal={handleCloseHistoryModal}
              handleReservationDetails={handleReservationDetails}
            />
            {/* 예매 내역 테이블 */}
            <MyPageReservation
              loading={loading}
              userReservations={userReservations}
              handleReservationDetails={handleReservationDetails}
            />
          </section>

          {/* 찜한 영화 목록 섹션 */}
          <MyPageLike
            loading={loading}
            wishlist={wishlist}
            setWishlist={setWishlist}
          />

          {/* Inquiry History Section */}
          <MyPageInquiry />

          {/* Account Management Section */}
          <section className="mp-section">
            <h2 className="mp-section-title">계정관리</h2>

            <div className="mp-account-card">
              <div className="mp-account-links">
                <a href="#" className="mp-account-link">
                  서비스 이용약관
                </a>
                <a href="#" className="mp-account-link">
                  개인정보 수집 및 이용 동의
                </a>
                <a href="#" className="mp-account-link">
                  개인정보 처리방침
                </a>
                <button
                  className="mp-account-link mp-withdrawal"
                  onClick={handleWithdrawalClick}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  회원탈퇴
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 회원탈퇴 모달 */}
        {showWithdrawalModal && (
          <div className="mp-modal-overlay">
            <div className="mp-withdrawal-modal">
              <div className="mp-modal-header">
                <h3>회원탈퇴</h3>
                <button
                  className="mp-modal-close"
                  onClick={handleWithdrawalCancel}
                >
                  ×
                </button>
              </div>
              <div className="mp-modal-content">
                <p className="mp-withdrawal-warning">
                  정말로 회원탈퇴를 하시겠습니까?
                </p>
                <p className="mp-withdrawal-info">
                  회원탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                </p>
                <p className="mp-withdrawal-confirm-text">
                  탈퇴를 원하시면 아래에 <strong>'탈퇴합니다'</strong>를
                  입력해주세요.
                </p>
                <input
                  type="text"
                  className="mp-withdrawal-input"
                  value={withdrawalText}
                  onChange={(e) => setWithdrawalText(e.target.value)}
                  placeholder="탈퇴합니다"
                />
              </div>
              <div className="mp-modal-footer">
                <button
                  className="mp-btn mp-btn-cancel"
                  onClick={handleWithdrawalCancel}
                >
                  취소
                </button>
                <button
                  className="mp-btn mp-btn-withdrawal-confirm"
                  onClick={handleWithdrawalConfirm}
                  disabled={withdrawalText !== "탈퇴합니다"}
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyPage;

