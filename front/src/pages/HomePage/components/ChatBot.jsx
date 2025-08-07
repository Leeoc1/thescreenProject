import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ChatBot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "안녕하세요! The Movie에 오신 것을 환영합니다! 궁금한 점이 있으시면 말씀해 주세요. (예: '데드풀', '탑10', '강남 CGV')",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    // 챗봇을 열 때 빠른예매 닫기 이벤트 발생
    if (!isChatbotOpen) {
      window.dispatchEvent(new CustomEvent('closeQuickReservation'));
    }
    setIsChatbotOpen(!isChatbotOpen);
  };

  // 응답 타입별 메시지 생성 함수들
  const createFaqMessage = (content) => ({ text: content, isBot: true });

  const createMovieMessage = (data) => {
    const { name, genre, movieinfo, releasedate, runningtime, moviecd } = data;
    
    return {
      text: `영화: ${name}\n장르: ${genre}\n줄거리: ${movieinfo}\n개봉일: ${releasedate}\n러닝타임: ${runningtime}분`,
      isBot: true,
      moviecd,
    };
  };

  const createTop10Message = (movies) => {
    const movieList = movies
      .map(
        (movie, index) => `${index + 1}. ${movie.name} (순위: ${movie.rank})`
      )
      .join("\n");
    return {
      text: `현재 인기 영화 탑10:\n${movieList}`,
      isBot: true,
      movies,
    };
  };

  const createCinemaMessage = (data) => {
    const {
      cinemaname,
      cinemaaddress,
      cinemastatus,
      cinematel,
      cinemacd,
      movies,
    } = data;
    
    

    let text = `극장: ${cinemaname}\n주소: ${cinemaaddress}\n상태: ${cinemastatus}\n전화번호: ${cinematel}`;

    if (movies && movies.length > 0) {
      
      text += `\n\n상영 중인 영화 (${movies.length}개):`;
      movies.slice(0, 5).forEach((movie, index) => {
        text += `\n${index + 1}. ${movie}`;
      });
      if (movies.length > 5) {
        text += `\n... 외 ${movies.length - 5}개 더`;
      }
    } else {
      
      text += "\n\n현재 상영 중인 영화가 없습니다.";
    }

    return {
      text,
      isBot: true,
      cinemacd: cinemacd,
      movies: movies || [], // 영화 목록 추가
    };
  };

  const createSuggestionMessage = (data) => {
    let text = "죄송하지만 해당 질문에 대한 답변을 찾을 수 없습니다.";

    if (data.faqs?.length) text += "\n[FAQ 제안]\n" + data.faqs.join("\n");
    if (data.notices?.length)
      text += "\n[공지사항 제안]\n" + data.notices.join("\n");
    if (data.movies?.length)
      text += "\n[영화 제안]\n" + data.movies.map((m) => m.name).join("\n");
    if (data.cinemas?.length)
      text += "\n[극장 제안]\n" + data.cinemas.map((c) => c.name).join("\n");

    return {
      text,
      isBot: true,
      movies: data.movies || [],
    };
  };

  const createCinemaMoviesMessage = (data) => {
    const { cinemamovies, totalCount, message, hasMore } = data;

    let text = "";
    if (message) {
      text = message + "\n\n";
    }

    text +=
      "상영 중인 영화:\n" +
      cinemamovies.map((movie, index) => `${index + 1}. ${movie}`).join("\n");

    if (hasMore) {
      text +=
        "\n\n※ 더 많은 영화가 있습니다. 구체적인 영화명으로 검색해보세요.";
    }

    return {
      text,
      isBot: true,
      movies: cinemamovies,
    };
  };

  const getBotMessage = (data) => {
    const messageCreators = {
      faq: () => createFaqMessage(data.data.content),
      notice: () => createFaqMessage(data.data.content),
      movie: () => createMovieMessage(data.data),
      top10: () => createTop10Message(data.data.movies),
      cinema: () => createCinemaMessage(data.data),
      cinemamovies: () => createCinemaMoviesMessage(data.data),
      suggestion: () => createSuggestionMessage(data.data),
      ai: () => createFaqMessage(data.data.content), // AI 응답 처리 추가
    };

    return (
      messageCreators[data.type]?.() || {
        text: "죄송합니다, 서버와의 연결에 문제가 발생했습니다.",
        isBot: true,
      }
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        `/chatbot/ask?question=${encodeURIComponent(input)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      
      const botMessage = getBotMessage(data);
      
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

  // 메시지 렌더링 함수
  const renderMessage = (msg, index) => {
    // 디버깅을 위한 로그
    if (msg.moviecd) {
      
    }

    return (
      <div
        key={index}
        className={`message ${msg.isBot ? "bot-message" : "user-message"}`}
      >
        {msg.text.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        {msg.moviecd && (
          <Link
            to={`/reservation/movie/${msg.moviecd}`}
            className="bot-message-reservation"
            onClick={() => {
              // 영화 정보를 세션스토리지에 저장
              
              sessionStorage.setItem("moviecd", msg.moviecd);

              // 영화 이름 추출 (메시지에서)
              const movieNameMatch = msg.text.match(/영화: (.+)/);
              if (movieNameMatch) {
                const movieName = movieNameMatch[1];
                sessionStorage.setItem("movienm", movieName);
                
              }
            }}
          >
            예매하기
          </Link>
        )}
        {(msg.cinemacd || (msg.isBot && msg.text.includes("극장:"))) && (
          <Link
            to={
              msg.cinemacd ? `/reservation/theater/${msg.cinemacd}` : `/theater`
            }
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2 inline-block ml-2"
            onClick={() => {
              // 극장 정보를 세션스토리지에 저장
              if (msg.cinemacd) {
                
                sessionStorage.setItem("cinemacd", msg.cinemacd);

                // 극장 이름 추출 (메시지에서)
                const cinemaNameMatch = msg.text.match(/극장: (.+)/);
                if (cinemaNameMatch) {
                  const cinemaName = cinemaNameMatch[1];
                  sessionStorage.setItem("cinemanm", cinemaName);
                  
                }
              }
            }}
          >
            극장 선택
          </Link>
        )}
      </div>
    );
  };

  useEffect(() => {
    // ChatBot 내부 스크롤만 조정하고 전체 페이지 스크롤은 건드리지 않음
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

  // 빠른예매가 열릴 때 챗봇 닫기 이벤트 리스너
  useEffect(() => {
    const handleCloseChatBot = () => {
      setIsChatbotOpen(false);
    };

    window.addEventListener('closeChatBot', handleCloseChatBot);

    return () => {
      window.removeEventListener('closeChatBot', handleCloseChatBot);
    };
  }, []);

  return (
    <div>
      <div className="chatbot-button" onClick={toggleChatbot}>
        <img
          src="https://img.icons8.com/ios-filled/50/ffffff/chat.png"
          alt="Chat Icon"
          className="chatbot-button-icon"
        />
      </div>
      <div className={`chatbot-container ${isChatbotOpen ? "open" : ""}`}>
        <div className="chatbot-header">The Screen 챗봇</div>
        <div className="chatbot-messages">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="질문을 입력하세요... (예: 데드풀, 탑10, 강남 CGV)"
            className="chatbot-input-field"
          />
          <button onClick={sendMessage} className="chatbot-send-button">
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

export default ChatBot;

