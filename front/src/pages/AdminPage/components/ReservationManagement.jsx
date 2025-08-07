import React, { useEffect, useState } from "react";
import { getReservation } from "../../../api/reservationApi";
import "../styles/ReservationManagement.css";
import "../styles/AdminPage.css";
import ExcelDownloadButton from "./ExcelDownloadButton";
// 엑셀 컬럼 매핑
const excelColumns = {
  예매번호: "reservationcd",
  고객명: "userid",
  영화명: "movienm",
  극장명: "cinemanm",
  상영관: "screenname",
  상영시간: "starttime",
  좌석: "seatcd",
  결제수단: "paymentmethod",
  결제금액: "amount",
  상태: "reservationstatus",
};

const ReservationManagement = () => {
  const [reservationList, setReservationList] = useState([]);
  const [activeTab, setActiveTab] = useState("전체");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getReservation();
        setReservationList(data);
      } catch (error) {
        setReservationList([]);
      }
    };

    fetchReservations();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "예약완료":
        return "adp-active";
      case "취소요청":
      case "예약취소":
        return "adp-pending";
      case "환불완료":
        return "adp-terminated";
      default:
        return "adp-pending";
    }
  };

  const formatReservationCode = (code) => {
    if (!code) return code;
    // 숫자만 추출하고 4자리마다 하이픈 추가
    const cleanCode = code.toString().replace(/\D/g, "");
    return cleanCode.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const formatCinemaInfo = (cinemanm, screenname) => {
    if (!cinemanm) return "";

    // 극장명에서 체인명과 지점명 분리
    // 예: "시네맥스 강남점" -> ["시네맥스", "강남점"]
    const parts = cinemanm.trim().split(" ");

    if (parts.length >= 2) {
      const chainName = parts[0]; // 시네맥스
      const branchName = parts.slice(1).join(" "); // 강남점
      const screenInfo = screenname ? ` ${screenname}` : "";

      return {
        firstLine: chainName,
        secondLine: branchName + screenInfo,
      };
    } else {
      // 분리할 수 없는 경우 원본 사용
      const screenInfo = screenname ? ` ${screenname}` : "";
      return {
        firstLine: cinemanm,
        secondLine: screenInfo.trim(),
      };
    }
  };

  const formatStartTime = (starttime) => {
    if (!starttime) return "";

    try {
      const date = new Date(starttime);

      // 날짜 포맷 (YYYY-MM-DD)
      const dateStr = date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, "-")
        .replace(/ /g, "")
        .slice(0, -1);

      // 시간 포맷 (HH:MM)
      const timeStr = date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return {
        dateStr,
        timeStr,
      };
    } catch (error) {
      // 날짜 파싱 실패 시 원본 반환
      return {
        dateStr: starttime,
        timeStr: "",
      };
    }
  };

  // 취소/환불 내역 랜덤 진행상황 생성
  const getRandomProgress = () => {
    return Math.random() < 0.5 ? "결제취소" : "환불완료";
  };

  // 예약 취소 처리 함수
  const handleCancelReservation = async (reservationcd) => {
    const isConfirmed = window.confirm("예약을 취소하시겠습니까?");

    if (isConfirmed) {
      try {
        // API 호출로 예약 상태를 '예약취소'로 변경
        const response = await fetch(
          "http://localhost:8080/reservation/cancel",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reservationcd: reservationcd,
              reservationstatus: "예약취소",
            }),
          }
        );

        if (response.ok) {
          // 성공 시 예매 목록 새로고침
          const updatedData = await getReservation();
          setReservationList(updatedData);
          alert("예약이 취소되었습니다.");
        } else {
          alert("예약 취소 중 오류가 발생했습니다.");
        }
      } catch (error) {
        alert("예약 취소 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>예매 관리</h2>
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <ExcelDownloadButton
            data={reservationList.map((r) => ({
              ...r,
              starttime: (() => {
                if (!r.starttime) return "";
                try {
                  const date = new Date(r.starttime);
                  const dateStr = date
                    .toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                    .replace(/\./g, "-")
                    .replace(/ /g, "")
                    .slice(0, -1);
                  const timeStr = date.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  return `${dateStr} ${timeStr}`;
                } catch {
                  return r.starttime;
                }
              })(),
            }))}
            columns={excelColumns}
            fileName="예매목록"
            sheetName="예매목록"
            buttonText="엑셀 다운로드"
          />
        </div>
      </div>

      <div className="rsm-reservation-tabs">
        <div className="rsm-tab-nav">
          <button
            className={`rsm-tab-btn${
              activeTab === "전체" ? " rsm-active" : ""
            }`}
            onClick={() => setActiveTab("전체")}
          >
            전체 예매 목록
          </button>
          <button
            className={`rsm-tab-btn${
              activeTab === "취소환불" ? " rsm-active" : ""
            }`}
            onClick={() => setActiveTab("취소환불")}
          >
            취소/환불 내역
          </button>
        </div>

        <div className="rsm-table-container">
          <table className="rsm-table">
            <thead>
              <tr>
                <th>예매번호</th>
                <th>고객명</th>
                <th>영화명</th>
                <th>극장/상영관</th>
                <th>상영시간</th>
                <th>좌석</th>
                <th>결제수단</th>
                <th>결제금액</th>
                <th>상태</th>
                <th>{activeTab === "취소환불" ? "진행상황" : "작업"}</th>
              </tr>
            </thead>
            <tbody>
              {reservationList.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    예매 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                (activeTab === "전체"
                  ? reservationList
                  : reservationList.filter(
                      (r) => r.reservationstatus === "예약취소"
                    )
                ).map((reservation) => {
                  const { firstLine, secondLine } = formatCinemaInfo(
                    reservation.cinemanm,
                    reservation.screenname
                  );
                  const { dateStr, timeStr } = formatStartTime(
                    reservation.starttime
                  );
                  // 진행상황 텍스트를 변수에 저장
                  const progressText =
                    activeTab === "취소환불" ? getRandomProgress() : null;
                  return (
                    <tr key={reservation.reservationcd}>
                      <td>
                        {formatReservationCode(reservation.reservationcd)}
                      </td>
                      <td>{reservation.userid || "알 수 없음"}</td>
                      <td>{reservation.movienm}</td>
                      <td>
                        {firstLine}
                        <br />
                        {secondLine}
                      </td>
                      <td>
                        {dateStr}
                        <br />
                        {timeStr}
                      </td>
                      <td>{reservation.seatcd}</td>
                      <td>{reservation.paymentmethod}</td>
                      <td>{reservation.amount?.toLocaleString()}원</td>
                      <td>
                        <span
                          className={`adp-status ${getStatusClass(
                            reservation.reservationstatus
                          )}`}
                        >
                          {reservation.reservationstatus}
                        </span>
                      </td>
                      <td>
                        {activeTab === "전체" ? (
                          reservation.reservationstatus === "예약완료" && (
                            <button
                              className="adp-btn-cancel"
                              onClick={() =>
                                handleCancelReservation(
                                  reservation.reservationcd
                                )
                              }
                            >
                              취소처리
                            </button>
                          )
                        ) : (
                          <span
                            className={
                              progressText === "결제취소"
                                ? "adp-progress-cancel"
                                : "adp-progress-refund"
                            }
                          >
                            {progressText}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;

