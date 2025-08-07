import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import { getReservation } from "../../../api/reservationApi";
import { getCurrentMovies } from "../../../api/movieApi";
import "../style/ReservationSuccessPage.css";
import KaKapTemplate from "../KaKapTemplate";
import { cleanupOnReservationComplete } from "../../../utils/sessionCleanup";

const ReservationSuccessPage = () => {
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState(null);

  // 뒤로가기 방지 및 보안 처리
  useEffect(() => {
    // 히스토리 항목을 현재 페이지로 대체하여 뒤로가기 방지
    window.history.pushState(null, "", window.location.href);

    // 뒤로가기 시도 시 완전 차단 (예매 완료 후 보안)
    const handlePopState = (event) => {
      // 뒤로가기 시도 시 아무 동작도 하지 않고 현재 페이지 유지

      window.history.pushState(null, "", window.location.href);
    };

    // 키보드 단축키 뒤로가기 방지 (Alt+왼쪽화살표, Backspace 등)
    const handleKeyDown = (event) => {
      // Alt + 왼쪽 화살표 (뒤로가기)
      if (event.altKey && event.keyCode === 37) {
        event.preventDefault();
        return false;
      }
      // Backspace로 뒤로가기 (input이나 textarea가 아닌 경우)
      if (
        event.keyCode === 8 &&
        !["INPUT", "TEXTAREA"].includes(event.target.tagName) &&
        !event.target.isContentEditable
      ) {
        event.preventDefault();
        return false;
      }
    };

    // 브라우저 뒤로가기 감지
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  // 예매 완료 후 모든 예매 관련 세션 정보 완전 정리
  useEffect(() => {
    // 사용자가 예매 내용을 확인할 수 있도록 5초 후 정리
    const timeoutId = setTimeout(() => {
      cleanupOnReservationComplete();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  // 헬퍼 함수들
  const getMovieFromSelectedMovie = () => {
    try {
      const savedSelectedMovie = sessionStorage.getItem("selectedMovie");
      if (savedSelectedMovie) {
        const movieData = JSON.parse(savedSelectedMovie);
        return movieData.posterurl ? movieData : null;
      }
    } catch (error) {
      // selectedMovie 파싱 실패
    }
    return null;
  };

  const getMovieFromReservationInfo = () => {
    try {
      const savedReservationInfo = sessionStorage.getItem(
        "finalReservationInfo"
      );
      if (savedReservationInfo) {
        const reservationInfo = JSON.parse(savedReservationInfo);
        return {
          posterurl: reservationInfo.posterurl,
          movienm: reservationInfo.movienm,
          moviecd: reservationInfo.moviecd,
          genre: reservationInfo.genre,
          runningtime: reservationInfo.runningtime,
          isadult: reservationInfo.isadult,
        };
      }
    } catch (error) {
      // finalReservationInfo 파싱 실패
    }
    return null;
  };

  const findMovieByName = async (movieName) => {
    try {
      const currentMovies = await getCurrentMovies();
      return currentMovies.find((movie) => movie.movienm === movieName);
    } catch (error) {
      // 영화 검색 실패
      return null;
    }
  };

  // 영화 정보 로드
  useEffect(() => {
    const loadMovieData = async () => {
      // 1단계: selectedMovie에서 확인
      let movieData = getMovieFromSelectedMovie();
      if (movieData) {
        setMovieData(movieData);
        return;
      }

      // 2단계: finalReservationInfo에서 확인
      movieData = getMovieFromReservationInfo();
      if (!movieData) {
        setMovieData(null);
        return;
      }

      // 포스터가 있으면 바로 사용
      if (movieData.posterurl) {
        setMovieData(movieData);
        return;
      }

      // 3단계: 영화명으로 검색
      if (movieData.movienm) {
        const foundMovie = await findMovieByName(movieData.movienm);
        if (foundMovie?.posterurl) {
          setMovieData({
            ...movieData,
            posterurl: foundMovie.posterurl,
            moviecd: foundMovie.moviecd,
            genre: foundMovie.genre,
            runningtime: foundMovie.runningtime,
            isadult: foundMovie.isadult,
          });
          return;
        }
      }

      // 최종: 포스터 없이 설정
      setMovieData(movieData);
    };

    loadMovieData();
  }, []);

  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        setLoading(true);
        const data = await getReservation();

        if (data && data.length > 0) {
          const reservationInfo = data[data.length - 1];
          setReservationData(reservationInfo);
        } else {
          // API에서 데이터를 가져올 수 없으면 sessionStorage에서 확인
          const savedReservationInfo = sessionStorage.getItem(
            "finalReservationInfo"
          );
          if (savedReservationInfo) {
            const reservationInfo = JSON.parse(savedReservationInfo);
            // 임시 데이터 구조 생성
            const tempData = {
              reservationcd: "임시예약번호",
              seatcd: reservationInfo.selectedSeats || "",
              reservationtime: new Date().toISOString(),
              starttime: reservationInfo.starttime || new Date().toISOString(),
              movienm: reservationInfo.movienm || "영화 정보 없음",
              runningtime: reservationInfo.runningtime || 0,
              screenname: reservationInfo.screenname || "상영관 정보 없음",
              cinemanm: reservationInfo.cinemanm || "극장 정보 없음",
            };
            setReservationData(tempData);
          }
        }
      } catch (error) {
        // 예약 정보 조회 실패
        const savedReservationInfo = sessionStorage.getItem(
          "finalReservationInfo"
        );
        if (savedReservationInfo) {
          const reservationInfo = JSON.parse(savedReservationInfo);
          const tempData = {
            reservationcd: "임시예약번호",
            seatcd: reservationInfo.selectedSeats || "",
            reservationtime: new Date().toISOString(),
            starttime: reservationInfo.starttime || new Date().toISOString(),
            movienm: reservationInfo.movienm || "영화 정보 없음",
            runningtime: reservationInfo.runningtime || 0,
            screenname: reservationInfo.screenname || "상영관 정보 없음",
            cinemanm: reservationInfo.cinemanm || "극장 정보 없음",
          };
          setReservationData(tempData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, []);

  if (loading) {
    return (
      <div className="reservation-payment-page">
        <Header isOtherPage={true} isScrolled={true} />
        <div className="payment-container">
          <div className="payment-box">
            <h2>예약 정보를 불러오는 중...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="reservation-payment-page">
        <Header isOtherPage={true} isScrolled={true} />
        <div className="payment-container">
          <div className="payment-box">
            <h2>예약 정보를 찾을 수 없습니다.</h2>
            <p>
              예약이 정상적으로 완료되지 않았거나, 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const reservationNum = String(reservationData.reservationcd).padStart(
    12,
    "0"
  );
  const reservationNumber = reservationNum.match(/.{1,4}/g).join("-");

  // 좌석 개수 계산
  const seatCount = (() => {
    if (!reservationData.seatcd) return 0;

    // seatcd가 배열인 경우
    if (Array.isArray(reservationData.seatcd)) {
      return reservationData.seatcd.length;
    }

    // seatcd가 문자열인 경우
    if (typeof reservationData.seatcd === "string") {
      return reservationData.seatcd.split(",").length;
    }

    // 기타 경우
    return 0;
  })();
  //종료 시간 계산
  const endTime = new Date(reservationData.starttime);
  endTime.setMinutes(endTime.getMinutes() + reservationData.runningtime);
  const endTimeString = endTime.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 시간 포맷팅 함수
  const formatDateTime = (dateTimeString) => {
    return dateTimeString
      ? new Date(dateTimeString).toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "정보 없음";
  };

  // 결제 시각과 상영 시작 시간 포맷팅
  const reservationTime = formatDateTime(reservationData.reservationtime);
  const startTime = formatDateTime(reservationData.starttime);

  // 상영시간 한 줄로 포맷팅
  const start = new Date(reservationData.starttime);
  const end = new Date(
    start.getTime() + (reservationData.runningtime || 0) * 60000
  );
  const formatTime = (date) =>
    date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/(\d{4})\. (\d{1,2})\. (\d{1,2})\./, "$1년 $2월 $3일");
  const formatHourMinute = (date) =>
    date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const showTime = `${formatTime(start)} ~ ${formatHourMinute(end)}`;

  return (
    <div className="reservation-payment-page">
      <Header isOtherPage={true} isScrolled={true} />
      {/* 진행바 삭제됨 */}
      <div className="success-header">
        <div className="success-page-title">예매 완료</div>
      </div>
      <div className="payment-container">
        <div className="payment-box">
          <h2 className="payment-done-title">예매가 완료 되었습니다.</h2>

          <div className="payment-info-section">
            <div className="payment-movie-poster">
              {movieData?.posterurl ? (
                <img
                  src={movieData.posterurl}
                  alt={movieData.movienm || "영화 포스터"}
                />
              ) : (
                <div className="no-poster-placeholder">
                  <span>포스터 없음</span>
                </div>
              )}
            </div>
            <div className="payment-info-list">
              <div>
                <span className="payment-label">예매번호</span>{" "}
                <span className="payment-value payment-number">
                  {reservationNumber || "정보 없음"}
                </span>
              </div>
              <div>
                <span className="payment-label">영화명</span>{" "}
                <span className="payment-value">
                  {reservationData.movienm || "정보 없음"}
                </span>
              </div>
              <div>
                <span className="payment-label">상영관</span>{" "}
                <span className="payment-value">
                  {reservationData.cinemanm || "정보 없음"} /{" "}
                  {reservationData.screenname}
                </span>
              </div>
              <div>
                <span className="payment-label">상영 시간</span>{" "}
                <span className="payment-value">{showTime}</span>
              </div>
              <div>
                <span className="payment-label">인원</span>{" "}
                <span className="payment-value">{seatCount}명</span>
              </div>
              <div>
                <span className="payment-label">좌석</span>{" "}
                <span className="payment-value">
                  {(() => {
                    if (!reservationData.seatcd) return "정보 없음";

                    // seatcd가 배열인 경우
                    if (Array.isArray(reservationData.seatcd)) {
                      return reservationData.seatcd.join(", ");
                    }

                    // seatcd가 문자열인 경우
                    if (typeof reservationData.seatcd === "string") {
                      return reservationData.seatcd;
                    }

                    // 기타 경우
                    return "정보 없음";
                  })()}
                </span>
              </div>
              <div>
                <span className="payment-label">결제수단</span>{" "}
                <span className="payment-value">
                  {reservationData.paymentmethod || "정보 없음"}
                </span>
              </div>
              <div>
                <span className="payment-label">결제금액</span>{" "}
                <span className="payment-value">
                  {reservationData.amount
                    ? `${reservationData.amount.toLocaleString()}원`
                    : "정보 없음"}
                </span>
              </div>
            </div>
          </div>
          <div className="payment-btn-area">
            <button
              className="payment-confirm-btn"
              onClick={() => navigate("/mypage")}
            >
              예매확인/취소
            </button>
          </div>
          <div className="payment-notice">
            <b>예매 유의사항</b>
            <br />
            더 자세한 사항은 상영일 익일 적립됩니다. (왕복관람권, 비회원 예매
            제외)
            <br />
            영화 상영 후 소멸된 포인트와 예매 취소는 환불이 불가할 수 있습니다.
            <br />
            비회원 예매의 경우 안내된 이메일로 발송되지 않을 수 있습니다.
          </div>
        </div>
        <div className="payment-bottom-info">
          <b>알고 계시나요?</b> 현재 진행중인 스페셜 이벤트!{" "}
          <button
            className="payment-more-btn"
            onClick={() => navigate("/event")}
          >
            + MORE
          </button>
        </div>
      </div>
      <KaKapTemplate reservationId={reservationData.reservationcd} />
      <Footer />
    </div>
  );
};

export default ReservationSuccessPage;

