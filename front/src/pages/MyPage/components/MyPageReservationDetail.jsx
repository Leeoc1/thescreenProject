import React from "react";
import "../styles/MyPageReservationDetail.css";
import { cancelReservation } from "../../../api/reservationApi";

const MyPageReservationDetail = ({
  showModal,
  selectedReservation,
  handleCloseModal,
  refreshReservations,
}) => {
  // 상영 종료 시간 계산 함수
  const getMovieEndTime = (starttime, runningtime) => {
    if (!starttime || !runningtime) return null;

    const startDate = new Date(starttime);
    const endDate = new Date(startDate.getTime() + runningtime * 60 * 1000);
    return endDate;
  };

  // 예매취소 가능 여부 확인
  const canCancelReservation = () => {
    if (selectedReservation.reservationstatus !== "예약완료") return false;

    const movieEndTime = getMovieEndTime(
      selectedReservation.starttime,
      selectedReservation.runningtime
    );

    if (!movieEndTime) return true; // 시간 정보가 없으면 취소 가능

    const now = new Date();
    return movieEndTime > now; // 상영 종료 시간이 현재 시간보다 이후면 취소 가능
  };

  // 예약 취소 처리 함수
  const handleCancelReservation = async (reservationcd) => {
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      await cancelReservation(reservationcd, "환불처리");
      alert("예약이 성공적으로 취소되었습니다.");

      handleCloseModal();

      // 예매 내역 새로고침
      if (refreshReservations) {
        await refreshReservations();
      }
      
    } catch (error) {
      
      alert(
        error.response?.data?.error ||
          "예약 취소 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };
  return (
    <div>
      {showModal && selectedReservation && (
        <div className="mp-modal-overlay" onClick={handleCloseModal}>
          <div
            className="mp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mp-modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2 className="mp-modal-title">예매 상세 내역</h2>
            <div className="mp-modal-details-container">
              <div className="mp-modal-left-section">
                <div className="mp-modal-row">
                  <b>예매번호:</b> {selectedReservation.reservationcd}
                </div>
                <div className="mp-modal-row">
                  <b>영화명:</b> {selectedReservation.movienm}
                </div>
                <div className="mp-modal-row">
                  <b>상영관:</b> {selectedReservation.screenname}
                </div>
                <div className="mp-modal-row">
                  <b>좌석:</b> {selectedReservation.seatcd}
                </div>
                <div className="mp-modal-row">
                  <b>상영일시:</b>{" "}
                  {selectedReservation.starttime
                    ? `${
                        selectedReservation.starttime.split(" ")[0]
                      } ${selectedReservation.starttime
                        .split(" ")[1]
                        ?.substring(0, 5)}`
                    : ""}
                </div>
                <div className="mp-modal-row">
                  <b>상영시간:</b> {selectedReservation.runningtime}분
                </div>
                <div className="mp-modal-row">
                  <b>극장:</b> {selectedReservation.cinemanm}
                </div>
              </div>

              <div className="mp-modal-right-section">
                <div className="mp-modal-row">
                  <b>결제금액:</b>{" "}
                  {selectedReservation.amount
                    ? `${selectedReservation.amount.toLocaleString()}원`
                    : "0원"}
                </div>
                <div className="mp-modal-row">
                  <b>결제방법:</b> {selectedReservation.paymentmethod}
                </div>
                <div className="mp-modal-row">
                  <b>결제일시:</b>{" "}
                  {selectedReservation.reservationtime
                    ? `${
                        selectedReservation.reservationtime.split("T")[0]
                      } ${selectedReservation.reservationtime
                        .split("T")[1]
                        ?.substring(0, 5)}`
                    : ""}
                </div>
                <div className="mp-modal-row">
                  <b>상태:</b> {selectedReservation.reservationstatus}
                </div>
              </div>
            </div>

            {canCancelReservation() && (
              <button
                className="mp-btn-cancel"
                onClick={() =>
                  handleCancelReservation(selectedReservation.reservationcd)
                }
              >
                예매취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPageReservationDetail;

