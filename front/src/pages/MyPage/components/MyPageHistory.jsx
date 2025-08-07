import React from "react";
import "../styles/MyPageHistory.css";
import "../styles/MyCoupons.css"; // 모달 스타일
import "../styles/MyPageReservation.css"; // 테이블 스타일

const MyPageHistory = ({
  showHistoryModal,
  loading,
  userReservations,
  handleCloseHistoryModal,
}) => {
  if (!showHistoryModal) return null;

  const filteredReservations = userReservations.filter(
    (reservation) => reservation.reservationstatus === "예약완료"
  );
  return (
    <div className="mp-modal-overlay" onClick={handleCloseHistoryModal}>
      <div className="mp-modal-content">
        <button className="mp-modal-close" onClick={handleCloseHistoryModal}>
          ×
        </button>
        <h2>히스토리</h2>
        <div className="mp-movie-list">
          {loading ? (
            <div className="mp-loading">예약 정보를 불러오는 중...</div>
          ) : filteredReservations.length > 0 ? (
            filteredReservations.map((reservation, index) => (
              <div
                key={reservation.reservationcd || index}
                className="mp-movie-item"
              >
                <div className="mp-movie-info">
                  <div className="mp-movie-main-info">
                    <h3 className="mp-movie-title">
                      {reservation.movienm || "영화제목"}
                    </h3>
                    <div className="mp-movie-info-row">
                      <div className="mp-movie-left-info">
                        <p className="mp-movie-details-text">
                          {reservation.screenname || "스크린 1"} | 좌석:{" "}
                          {reservation.seatcd || "A1"}
                        </p>
                        <p className="mp-movie-datetime">
                          {reservation.starttime
                            ? `${reservation.starttime.split(" ")[0]} ${
                                reservation.starttime
                                  .split(" ")[1]
                                  ?.substring(0, 5) || ""
                              }`
                            : "2025-01-01 12:00"}{" "}
                          &nbsp;(
                          {reservation.runningtime
                            ? `${reservation.runningtime}분`
                            : "000분"}
                          )
                        </p>
                        <p className="mp-movie-cinema">
                          {reservation.cinemanm || "CGV"}
                        </p>
                        {reservation.reservationstatus === "예약완료" ? (
                          <p className="mp-movie-amount">
                            결제금액:{" "}
                            {reservation.amount
                              ? `${reservation.amount.toLocaleString()}원`
                              : "0원"}
                          </p>
                        ) : (
                          <p className="mp-movie-amount">
                            {reservation.reservationstatus}
                          </p>
                        )}
                      </div>
                      <div className="mp-movie-bottom-info">
                        <div className="mp-movie-actions">
                          {reservation.reservationstatus === "예약완료" && (
                            <button className="mp-btn mp-btn-review">
                              관람평 쓰기
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mp-no-reservations">
              <p>예약 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPageHistory;

