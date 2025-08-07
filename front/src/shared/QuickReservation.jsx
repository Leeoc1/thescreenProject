import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSchedules } from "../api/cinemaApi";
import "./QuickReservation.css";

const QuickReservation = ({ onClose }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "관람 지역을 입력하거나 예매 정보를 입력해 주세요.\n\n예시:\n- 오산점\n- 오산점에서 전지적 독자시점 2명 예매해줘\n- 오산점에서 전지적 독자시점 어른 1명 청소년 1명 예매해줘\n- 강남에서 아바타 가장 빠른 시간으로 예매",
      isBot: true,
    },
  ]);
  const messagesEndRef = useRef(null);

  // 컴포넌트 마운트 시 배경 스크롤 막기
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  // 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    // QuickReservation 내부 스크롤만 조정하고 전체 페이지 스크롤은 건드리지 않음
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  // AI 기반 연령별 인원수 분석을 위한 백업 함수 (간단한 키워드 검색만)
  const parseAgeFromInput = (userInput, totalPerson) => {
    // 간단한 키워드 기반 검색으로 최소한의 분류만 수행
    const input = userInput.toLowerCase();

    // 어른/성인 키워드 확인
    const hasAdult = /어른|성인/.test(input);
    // 청소년 키워드 확인
    const hasYouth = /청소년|학생/.test(input);
    // 우대 키워드 확인
    const hasSenior = /우대|경로|시니어/.test(input);

    // 여러 연령대가 언급된 경우 - AI에서 처리되지 않은 복잡한 케이스이므로 모두 어른으로 처리
    const mentionedTypes = [hasAdult, hasYouth, hasSenior].filter(
      Boolean
    ).length;
    if (mentionedTypes > 1) {
      return { adultCount: totalPerson, youthCount: 0, seniorCount: 0 };
    }

    // 단일 연령대만 언급된 경우
    if (hasYouth && !hasAdult && !hasSenior) {
      return { adultCount: 0, youthCount: totalPerson, seniorCount: 0 };
    } else if (hasSenior && !hasAdult && !hasYouth) {
      return { adultCount: 0, youthCount: 0, seniorCount: totalPerson };
    } else {
      // 어른이 언급되었거나 아무것도 명시되지 않은 경우 어른으로 처리
      return { adultCount: totalPerson, youthCount: 0, seniorCount: 0 };
    }
  };

  // 가격 계산 함수 - AI 우선, 백업 로직은 최소화
  const calculatePrice = (totalPerson, priceBreakdown, userInput = "") => {
    // 기본 가격 설정
    const ADULT_PRICE = 10000; // 어른: 10,000원
    const YOUTH_PRICE = 6000; // 청소년: 6,000원
    const SENIOR_PRICE = 5000; // 우대: 5,000원

    let adultCount = 0;
    let youthCount = 0;
    let seniorCount = 0;

    if (priceBreakdown) {
      // 백엔드 AI가 처리한 결과 사용 (우선순위 1)

      adultCount = priceBreakdown.adult?.count || 0;
      youthCount = priceBreakdown.youth?.count || 0;
      seniorCount = priceBreakdown.senior?.count || 0;
    } else {
      // 백엔드 AI 처리 실패시 간단한 백업 로직 사용 (우선순위 2)

      const parsed = parseAgeFromInput(userInput, totalPerson);
      adultCount = parsed.adultCount;
      youthCount = parsed.youthCount;
      seniorCount = parsed.seniorCount;
    }

    const totalPrice =
      adultCount * ADULT_PRICE +
      youthCount * YOUTH_PRICE +
      seniorCount * SENIOR_PRICE;
    return {
      adultCount,
      youthCount,
      seniorCount,
      totalPrice,
      adultPrice: ADULT_PRICE,
      youthPrice: YOUTH_PRICE,
      seniorPrice: SENIOR_PRICE,
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      // 지역 검색 API 호출
      const response = await fetch(
        `/chatbot/ask?question=${encodeURIComponent(input)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();

      let botMessage;
      // AI가 파싱한 빠른 예매 요청 처리
      // directBooking 타입이 아니더라도 영화명과 극장명이 있으면 빠른 예매 플로우로 진입
      if (
        (data.type === "directBookingConfirmed" && data.data) ||
        (data.data && data.data.movienm && data.data.cinemanm)
      ) {
        // 세션 스토리지에 예매 정보 저장
        if (data.data.movienm)
          sessionStorage.setItem("movienm", data.data.movienm);
        if (data.data.cinemanm)
          sessionStorage.setItem("cinemanm", data.data.cinemanm);
        if (data.data.cinemacd)
          sessionStorage.setItem("cinemacd", data.data.cinemacd);
        if (data.data.schedulecd)
          sessionStorage.setItem("schedulecd", data.data.schedulecd);
        if (data.data.person)
          sessionStorage.setItem("personCount", data.data.person);

        // directPayment가 true이면 랜덤 좌석과 함께 바로 결제 페이지로
        if (data.data.directPayment && data.data.randomSeats) {
          // 랜덤 좌석 정보 저장
          sessionStorage.setItem(
            "selectedSeats",
            JSON.stringify(data.data.randomSeats)
          );
          sessionStorage.setItem("seatCount", data.data.randomSeats.length);

          // 영화 시간 정보 저장 (결제 페이지에서 필요)
          const selectedMovieTime = {
            starttime: data.data.starttime,
            movienm: data.data.movienm,
            screenname: data.data.screenname || "1관",
            schedulecd: data.data.schedulecd,
            runningtime: data.data.runningtime || 120,
            cinemanm: data.data.cinemanm,
            seats: data.data.randomSeats,
            reservationseat: data.data.randomSeats.length,
            allseat: 100,
          };
          sessionStorage.setItem(
            "selectedMovieTime",
            JSON.stringify(selectedMovieTime)
          );

          // 오늘 날짜 저장
          const today = new Date().toISOString().split("T")[0];
          sessionStorage.setItem("selectedDate", today);
          sessionStorage.setItem("selectedFullDate", today);

          // 추가 필수 정보들 저장 (보호 라우트에서 확인하는 정보들)
          sessionStorage.setItem("selectedMovieName", data.data.movienm);
          sessionStorage.setItem("selectedCinemaName", data.data.cinemanm); // finalReservationInfo 생성 (결제 페이지 보호 라우트에서 필요)
          // 백엔드 응답 데이터 로깅

          // 백엔드에서 totalPrice가 있으면 바로 사용
          let finalTotalPrice = data.data.totalPrice;
          let finalPriceInfo = {
            adultCount: 0,
            youthCount: 0,
            seniorCount: 0,
            totalPrice: finalTotalPrice || 0,
          };

          // 백엔드에서 ageBreakdown이 있으면 사용
          if (data.data.ageBreakdown) {
            finalPriceInfo.adultCount = data.data.ageBreakdown.adult || 0;
            finalPriceInfo.youthCount = data.data.ageBreakdown.youth || 0;
            finalPriceInfo.seniorCount = data.data.ageBreakdown.senior || 0;
          } else {
            // 백엔드에서 ageBreakdown이 없으면 프론트엔드에서 사용자 입력 분석
            const priceInfo = calculatePrice(
              data.data.person,
              data.data.priceBreakdown,
              input // 사용자 입력 전달
            );
            finalPriceInfo = priceInfo;
            finalTotalPrice = data.data.totalPrice || priceInfo.totalPrice;
          }

          const finalReservationInfo = {
            selectedSeats: data.data.randomSeats,
            guestCount: data.data.person,
            totalGuests: data.data.person,
            adultCount: finalPriceInfo.adultCount,
            childCount: finalPriceInfo.youthCount + finalPriceInfo.seniorCount, // 청소년 + 우대
            selectedMovieTime: selectedMovieTime,
            selectedDate: today,
            selectedFullDate: today,
            movienm: data.data.movienm,
            cinemanm: data.data.cinemanm,
            schedulecd: data.data.schedulecd,
            starttime: data.data.starttime,
            screenname: data.data.screenname || "1관",
            runningtime: data.data.runningtime || 120,
            totalPrice: finalTotalPrice,
            priceBreakdown: finalPriceInfo, // 가격 세부 정보 추가
          };

          sessionStorage.setItem(
            "finalReservationInfo",
            JSON.stringify(finalReservationInfo)
          );

          // 세션 스토리지 변경 이벤트 발생 (기존 시스템과 호환)
          window.dispatchEvent(
            new CustomEvent("sessionStorageChange", {
              detail: {
                selectedFullDate: today,
                selectedMovieName: data.data.movienm,
                selectedMovieTime: JSON.stringify(selectedMovieTime),
                selectedSeats: JSON.stringify(data.data.randomSeats),
                seatCount: data.data.randomSeats.length,
                finalReservationInfo: JSON.stringify(finalReservationInfo),
              },
            })
          );

          // 세션 스토리지 검증
          setTimeout(() => {
            // 세션 상태 확인 로직 (콘솔 로그 제거됨)
          }, 100);

          botMessage = {
            text:
              data.data.message ||
              `${data.data.cinemanm}에서 ${data.data.movienm} 영화 ${
                data.data.person
              }명 예매가 완료되었습니다!\n좌석: ${data.data.randomSeats.join(
                ", "
              )}\n결제 페이지로 이동할 수 있습니다.`,
            isBot: true,
            directPayment: true,
          };
        } else {
          // 일반적인 예매 확인 (좌석 선택 페이지로)
          botMessage = {
            text: `${data.data.cinemanm}에서 ${data.data.movienm} 영화 예매를 진행하겠습니다!\n예매 페이지로 이동할 수 있습니다.`,
            isBot: true,
            finalConfirmation: true,
          };
        }

        setMessages((prev) => [...prev, botMessage]);
        return;
      }
      if (data.type === "cinema") {
        const {
          cinemaname,
          cinemaaddress,
          cinemastatus,
          cinematel,
          cinemacd,
          movies,
        } = data.data;

        let text = `${cinemaname}\n주소: ${cinemaaddress}\n상태: ${cinemastatus}\n전화번호: ${cinematel}`;

        if (movies && movies.length > 0) {
          text += `\n\n상영 중인 영화:\n${movies
            .map((movie, index) => `${index + 1}. ${movie}`)
            .join("\n")}\n\n어떤 영화를 보시겠어요?`;
        } else {
          text += `\n\n현재 상영 중인 영화가 없습니다.`;
        }

        botMessage = {
          text: text,
          isBot: true,
          cinemacd: cinemacd,
          cinemaname: cinemaname,
          movies: movies || [], // 영화 목록 추가
        };
      } else if (data.type === "suggestion" && data.data.cinemas?.length > 0) {
        // 지역에 여러 극장이 있는 경우
        const cinemaList = data.data.cinemas
          .map((cinema, index) => `${index + 1}. ${cinema.name}`)
          .join("\n");
        botMessage = {
          text: `${input} 지역의 극장은 다음과 같습니다:\n\n${cinemaList}\n\n어떤 상영관에서 보시겠어요?`,
          isBot: true,
          cinemas: data.data.cinemas,
        };
      } else {
        // 해당 지역에 극장이 없는 경우
        botMessage = {
          text: `죄송합니다. "${input}" 지역의 극장은 없습니다.\n다른 지역명을 입력해 주세요.`,
          isBot: true,
        };
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "죄송합니다, 서버와의 연결에 문제가 발생했습니다.",
          isBot: true,
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleCinemaSelect = async (msg) => {
    // 극장 정보를 세션 스토리지에 저장
    sessionStorage.setItem("cinemacd", msg.cinemacd);
    sessionStorage.setItem("cinemanm", msg.cinemaname);

    // 이미 영화 목록이 있으면 바로 사용, 없으면 API 호출
    if (msg.movies && msg.movies.length > 0) {
      const movieList = msg.movies
        .map((movie, index) => `${index + 1}. ${movie}`)
        .join("\n");

      const movieMessage = {
        text: `${msg.cinemaname}에서 상영 중인 영화:\n\n${movieList}\n\n어떤 영화를 보시겠어요?`,
        isBot: true,
        movies: msg.movies,
      };

      setMessages((prev) => [...prev, movieMessage]);
    } else {
      // 영화 목록이 없으면 API 호출
      try {
        const movieResponse = await fetch(
          `/chatbot/ask?question=${encodeURIComponent(msg.cinemaname)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        const movieData = await movieResponse.json();

        // cinema 타입으로 영화 목록이 포함된 경우
        if (movieData.type === "cinema" && movieData.data.movies?.length > 0) {
          const movieList = movieData.data.movies
            .map((movie, index) => `${index + 1}. ${movie}`)
            .join("\n");

          const movieMessage = {
            text: `${msg.cinemaname}에서 상영 중인 영화:\n\n${movieList}\n\n어떤 영화를 보시겠어요?`,
            isBot: true,
            movies: movieData.data.movies,
          };

          setMessages((prev) => [...prev, movieMessage]);
        } else if (
          movieData.type === "cinemamovies" &&
          movieData.data.cinemamovies?.length > 0
        ) {
          const movieList = movieData.data.cinemamovies
            .map((movie, index) => `${index + 1}. ${movie}`)
            .join("\n");

          const movieMessage = {
            text: `${msg.cinemaname}에서 상영 중인 영화:\n\n${movieList}\n\n어떤 영화를 보시겠어요?`,
            isBot: true,
            movies: movieData.data.cinemamovies,
          };

          setMessages((prev) => [...prev, movieMessage]);
        } else {
          const noMovieMessage = {
            text: `${msg.cinemaname}에서 현재 상영 중인 영화가 없습니다.`,
            isBot: true,
          };

          setMessages((prev) => [...prev, noMovieMessage]);
        }
      } catch (error) {
        const errorMessage = {
          text: "영화 목록을 가져오는 중 오류가 발생했습니다.",
          isBot: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleMovieSelect = (movie) => {
    // 선택한 극장명을 세션 스토리지에서 가져오기
    const selectedCinema = sessionStorage.getItem("cinemanm") || "해당 극장";

    // 확인 메시지 추가
    const confirmMessage = {
      text: `${selectedCinema}의 ${movie} 영화 맞습니까?`,
      isBot: true,
      selectedMovie: movie,
      selectedCinema: selectedCinema,
    };

    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleMovieConfirm = (selectedMovie, selectedCinema) => {
    // 영화 정보를 세션 스토리지에 저장
    sessionStorage.setItem("movienm", selectedMovie);

    // 예매 확정 메시지
    const confirmationMessage = {
      text: `${selectedCinema}에서 ${selectedMovie} 영화 예매를 진행하겠습니다!\n예매 페이지로 이동할 수 있습니다.`,
      isBot: true,
      finalConfirmation: true,
    };

    setMessages((prev) => [...prev, confirmationMessage]);
  };

  const handleMovieReject = () => {
    // 다시 선택 메시지
    const retryMessage = {
      text: "다른 영화를 선택해 주세요. 위의 영화 목록에서 원하는 영화를 클릭해 주세요.",
      isBot: true,
    };

    setMessages((prev) => [...prev, retryMessage]);
  };

  const handleDirectPayment = () => {
    // 세션 스토리지 재확인
    const finalReservationInfo = sessionStorage.getItem("finalReservationInfo");
    const selectedMovieTime = sessionStorage.getItem("selectedMovieTime");
    const selectedSeats = sessionStorage.getItem("selectedSeats");

    if (!finalReservationInfo) {
      alert("예매 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }

    // 결제 페이지로 바로 이동
    navigate("/reservation/payment");
  };

  const handleReservationStart = async () => {
    try {
      const cinemacd = sessionStorage.getItem("cinemacd");
      const movienm = sessionStorage.getItem("movienm");
      const cinemanm = sessionStorage.getItem("cinemanm");

      if (!cinemacd || !movienm || !cinemanm) {
        alert("예매 정보가 부족합니다. 다시 선택해 주세요.");
        return;
      }

      // 오늘 날짜 구하기
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      // 해당 극장의 오늘 스케줄 가져오기
      const schedules = await getSchedules(cinemacd, dateStr);

      if (!schedules || schedules.length === 0) {
        alert("오늘 상영 스케줄이 없습니다. 다른 날짜를 선택해 주세요.");
        return;
      }

      // 극장, 영화, 현재 시간 이후 조건으로 필터링
      const now = new Date();
      const availableSchedules = schedules.filter(
        (schedule) =>
          schedule.movienm === movienm &&
          schedule.cinemanm === cinemanm &&
          new Date(schedule.starttime) > now
      );

      if (availableSchedules.length === 0) {
        alert(
          `${cinemanm}에서 ${movienm} 영화의 현재 시간 이후 상영 스케줄이 없습니다.`
        );
        return;
      }

      // 가장 빠른 스케줄 선택
      const earliestSchedule = availableSchedules.reduce((min, cur) => {
        return new Date(cur.starttime) < new Date(min.starttime) ? cur : min;
      }, availableSchedules[0]);

      // ReservationSeatPage에서 필요한 형식으로 데이터 준비
      const selectedMovieTime = {
        starttime: earliestSchedule.starttime,
        reservationseat: earliestSchedule.reservationseat || 0,
        allseat: earliestSchedule.allseat || 100,
        movienm: movienm,
        screenname: earliestSchedule.screenname || "1관",
        schedulecd: earliestSchedule.schedulecd,
        runningtime: earliestSchedule.runningtime || 120,
        cinemanm: cinemanm,
      };

      // 선택된 날짜 정보도 저장 (ReservationProtectedRoute에서 필요)
      const selectedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
      const selectedFullDate = selectedDate; // 전체 날짜 정보

      // 세션스토리지에 저장 (기존 시스템과 동일한 방식)
      sessionStorage.setItem(
        "selectedMovieTime",
        JSON.stringify(selectedMovieTime)
      );
      sessionStorage.setItem("selectedFullDate", selectedFullDate);
      sessionStorage.setItem("selectedDate", selectedDate);
      sessionStorage.setItem("selectedMovieName", movienm);

      // 세션 스토리지 변경 이벤트 발생 (기존 시스템과 호환)
      window.dispatchEvent(
        new CustomEvent("sessionStorageChange", {
          detail: {
            selectedFullDate: selectedFullDate,
            selectedMovieName: movienm,
            selectedMovieTime: JSON.stringify(selectedMovieTime),
          },
        })
      );

      // ReservationSeat 페이지로 이동
      navigate("/reservation/seat");
    } catch (error) {
      alert("예매 준비 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  const handleCinemaFromList = async (cinema) => {
    // 극장 정보를 세션 스토리지에 저장
    sessionStorage.setItem("cinemacd", cinema.cinemacd);
    sessionStorage.setItem("cinemanm", cinema.name);

    // 해당 극장의 상영 영화 목록 가져오기
    try {
      const movieResponse = await fetch(
        `/chatbot/ask?question=${encodeURIComponent(cinema.name)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const movieData = await movieResponse.json();

      // cinema 타입으로 영화 목록이 포함된 경우
      if (movieData.type === "cinema" && movieData.data.movies?.length > 0) {
        const movieList = movieData.data.movies
          .map((movie, idx) => `${idx + 1}. ${movie}`)
          .join("\n");

        const movieMessage = {
          text: `${cinema.name}에서 상영 중인 영화:\n\n${movieList}\n\n어떤 영화를 보시겠어요?`,
          isBot: true,
          movies: movieData.data.movies,
        };

        setMessages((prev) => [...prev, movieMessage]);
      } else if (
        movieData.type === "cinemamovies" &&
        movieData.data.cinemamovies?.length > 0
      ) {
        const movieList = movieData.data.cinemamovies
          .map((movie, idx) => `${idx + 1}. ${movie}`)
          .join("\n");

        const movieMessage = {
          text: `${cinema.name}에서 상영 중인 영화:\n\n${movieList}\n\n어떤 영화를 보시겠어요?`,
          isBot: true,
          movies: movieData.data.cinemamovies,
        };

        setMessages((prev) => [...prev, movieMessage]);
      } else {
        const noMovieMessage = {
          text: `${cinema.name}에서 현재 상영 중인 영화가 없습니다.`,
          isBot: true,
        };

        setMessages((prev) => [...prev, noMovieMessage]);
      }
    } catch (error) {
      const errorMessage = {
        text: "영화 목록을 가져오는 중 오류가 발생했습니다.",
        isBot: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="qkr-overlay" onClick={onClose}>
      <div
        className="qkr-quickreservation-container qkr-open"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qkr-quickreservation-header">빠른 예매 챗봇</div>
        <div className="qkr-quickreservation-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`qkr-message ${
                msg.isBot ? "qkr-bot-message" : "qkr-user-message"
              }`}
            >
              {msg.text.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {msg.cinemacd && (
                <button
                  onClick={() => handleCinemaSelect(msg)}
                  className="qkr-cinema-select-button"
                >
                  이 극장 선택하기
                </button>
              )}
              {msg.movies && (
                <div className="qkr-movie-buttons-container">
                  {msg.movies.map((movie, index) => (
                    <button
                      key={index}
                      onClick={() => handleMovieSelect(movie)}
                      className="qkr-movie-button"
                    >
                      {movie}
                    </button>
                  ))}
                </div>
              )}
              {msg.selectedMovie && msg.selectedCinema && (
                <div className="qkr-confirmation-buttons-container">
                  <button
                    onClick={() =>
                      handleMovieConfirm(msg.selectedMovie, msg.selectedCinema)
                    }
                    className="qkr-confirm-button"
                  >
                    예
                  </button>
                  <button
                    onClick={handleMovieReject}
                    className="qkr-reject-button"
                  >
                    아니오
                  </button>
                </div>
              )}
              {msg.finalConfirmation && (
                <div className="qkr-reservation-button-container">
                  <button
                    onClick={handleReservationStart}
                    className="qkr-reservation-button"
                  >
                    예매하러 가기
                  </button>
                </div>
              )}
              {msg.directPayment && (
                <div className="qkr-direct-payment-button-container">
                  <button
                    onClick={handleDirectPayment}
                    className="qkr-direct-payment-button"
                  >
                    결제하러 가기
                  </button>
                </div>
              )}
              {msg.cinemas && (
                <div className="qkr-cinema-list-container">
                  {msg.cinemas.map((cinema, index) => (
                    <button
                      key={index}
                      onClick={() => handleCinemaFromList(cinema)}
                      className="qkr-cinema-list-button"
                    >
                      {cinema.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="qkr-quickreservation-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="qkr-quickreservation-input-field"
          />
          <button
            onClick={sendMessage}
            className="qkr-quickreservation-send-button"
          >
            <img
              src="https://img.icons8.com/?size=100&id=43929&format=png&color=000000"
              alt="Send"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickReservation;
