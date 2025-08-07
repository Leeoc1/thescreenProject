import React from "react";
import "../styles/MyPageReservation.css";
import { useState, useEffect } from "react";

const MyPageReservation = ({
  loading,
  userReservations,
  handleReservationDetails,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(userReservations.length / itemsPerPage);

  // 현재 페이지에 표시할 예약 목록
  const currentReservations = userReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 페이지 변경 시 첫 번째 페이지로 리셋 (예약 목록이 변경될 때)
  useEffect(() => {
    setCurrentPage(1);
  }, [userReservations]);

  // 페이지 번호 클릭 핸들러
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 이전/다음 페이지 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 페이지네이션 번호 생성
  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`mp-page-btn ${currentPage === i ? "mp-page-active" : ""}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div>
      <div className="mp-reservation-table-container">
        <table className="mp-reservation-table">
          <thead>
            <tr>
              <th>영화제목</th>
              <th>상영시간</th>
              <th>결제일시</th>
              <th>결제금액</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">
                  <div className="mp-loading">예약 정보를 불러오는 중...</div>
                </td>
              </tr>
            ) : currentReservations.length > 0 ? (
              currentReservations.map((reservation, index) => (
                <tr
                  key={reservation.reservationcd || index}
                  className="mp-reservation-row"
                  onClick={() =>
                    handleReservationDetails(reservation.reservationcd)
                  }
                >
                  <td className="mp-reservation-title">
                    {reservation.movienm || "영화제목"}
                  </td>
                  <td className="mp-reservation-date">
                    {reservation.starttime
                      ? `${
                          reservation.starttime.split(" ")[0]
                        } ${reservation.starttime
                          .split(" ")[1]
                          ?.substring(0, 5)}`
                      : "2025-01-01"}
                    &nbsp;(
                    {reservation.runningtime
                      ? `${reservation.runningtime}분`
                      : "0분"}
                    )
                  </td>
                  <td className="mp-reservation-date">
                    {reservation.reservationtime
                      ? `${
                          reservation.reservationtime.split("T")[0]
                        } ${reservation.reservationtime
                          .split("T")[1]
                          ?.substring(0, 5)}`
                      : "2025-01-01"}
                  </td>
                  <td className="mp-reservation-status">
                    {reservation.reservationstatus === "예약완료"
                      ? reservation.amount
                        ? `${reservation.amount.toLocaleString()}원`
                        : "0원"
                      : reservation.reservationstatus}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="mp-no-reservations">
                  <p>예약 내역이 없습니다.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mp-pagination">
          <button
            className="mp-page-btn mp-page-nav"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {renderPageNumbers()}

          <button
            className="mp-page-btn mp-page-nav"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPageReservation;

