import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/apiUtils";

const ChatBot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "👋 안녕하세요! **The Screen** 챗봇입니다!\n\n🎬 영화 정보, 극장 검색, 예매 안내 등 무엇이든 도와드릴게요!\n\n💡 **이렇게 물어보세요:**\n• '박스오피스' - 현재 인기 영화 순위\n• '공지사항' - 최신 공지사항\n• '강남구 극장' - 지역별 극장 찾기\n• 'FAQ' - 자주 묻는 질문\n• 영화 제목 (예: '좀비딸') - 영화 상세정보\n\n궁금한 것이 있으시면 언제든 말씀해 주세요! 😊",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    // 챗봇을 열 때 빠른예매 닫기 이벤트 발생
    if (!isChatbotOpen) {
      window.dispatchEvent(new CustomEvent("closeQuickReservation"));
    }
    setIsChatbotOpen(!isChatbotOpen);
  };

  // 응답 타입별 메시지 생성 함수들
  const createFaqMessage = (content) => ({
    text: `💡 **자주 묻는 질문**\n\n${content}\n\n더 궁금한 점이 있으시면 언제든 물어보세요!`,
    isBot: true,
  });

  const createFaqListMessage = (data) => {
    if (!data || !data.faqs || data.faqs.length === 0) {
      return {
        text: "💬 FAQ 목록을 찾을 수 없습니다.",
        isBot: true,
      };
    }

    let text =
      "💡 **자주 묻는 질문 목록**\n\n📝 원하는 질문을 선택해주세요:\n\n";
    data.faqs.forEach((faq, index) => {
      text += `${index + 1}. ${faq.title}\n`;
    });
    text +=
      "\n💡 질문 제목을 입력하거나 번호를 말씀해주시면 자세한 답변을 드릴게요!";

    return {
      text,
      isBot: true,
      faqData: data.faqs,
    };
  };

  const createMovieMessage = (data) => {
    const { name, genre, movieinfo, releasedate, runningtime, moviecd } = data;

    return {
      text: `🎬 **${name}**\n\n🎭 장르: ${genre}\n📅 개봉일: ${releasedate}\n⏰ 상영시간: ${runningtime}분\n\n📝 줄거리:\n${movieinfo}\n\n지금 바로 예매하시겠어요?`,
      isBot: true,
      moviecd,
    };
  };

  const createTop10Message = (movies) => {
    const movieList = movies
      .map((movie, index) => `${index + 1}위. ${movie.name}`)
      .join("\n");
    return {
      text: `🏆 **현재 박스오피스 TOP 10**\n\n${movieList}\n\n🎥 관심 있는 영화가 있으시면 영화 제목을 입력해보세요!`,
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

    let text = `🎭 **${cinemaname}**\n\n📍 주소: ${cinemaaddress}\n📞 전화번호: ${cinematel}\n🏢 운영상태: ${cinemastatus}`;

    if (movies && movies.length > 0) {
      text += `\n\n🎬 **현재 상영작** (총 ${movies.length}편):`;
      movies.slice(0, 5).forEach((movie, index) => {
        text += `\n${index + 1}. ${movie}`;
      });
      if (movies.length > 5) {
        text += `\n... 외 ${movies.length - 5}편 더`;
      }
      text += `\n\n🎫 예매를 원하시면 아래 버튼을 클릭하세요!`;
    } else {
      text += "\n\n⚠️ 현재 상영 중인 영화가 없습니다.";
    }

    return {
      text,
      isBot: true,
      cinemacd: cinemacd,
      movies: movies || [], // 영화 목록 추가
    };
  };

  const createSuggestionMessage = (data) => {
    let text =
      "🤔 찾으신 내용과 정확히 일치하는 정보를 찾지 못했어요.\n\n💡 **이런 것들은 어떠세요?**";

    if (data.faqs?.length)
      text += "\n\n❓ **자주 묻는 질문**\n" + data.faqs.join("\n");
    if (data.notices?.length)
      text += "\n\n📢 **공지사항**\n" + data.notices.join("\n");
    if (data.movies?.length)
      text +=
        "\n\n🎬 **추천 영화**\n" + data.movies.map((m) => m.name).join("\n");
    if (data.cinemas?.length)
      text +=
        "\n\n🎭 **근처 극장**\n" + data.cinemas.map((c) => c.name).join("\n");

    text +=
      "\n\n다른 키워드로 다시 검색해보시거나, 구체적인 질문을 해주세요! 😊";

    return {
      text,
      isBot: true,
      movies: data.movies || [],
    };
  };

  const createNoticeListMessage = (data) => {
    if (!data || !data.notices || data.notices.length === 0) {
      return {
        text: "📢 공지사항 목록을 찾을 수 없습니다.",
        isBot: true,
      };
    }

    let text = "📢 **공지사항 목록**\n\n📝 원하는 공지사항을 선택해주세요:\n\n";
    data.notices.forEach((notice, index) => {
      text += `${index + 1}. ${notice.title}\n`;
    });
    text +=
      "\n💡 공지사항 제목이나 번호를 말씀해주시면 자세한 내용을 보여드릴게요!";

    return {
      text,
      isBot: true,
      noticeData: data.notices,
    };
  };

  const createCinemaListMessage = (data) => {
    if (!data || !data.cinemas || data.cinemas.length === 0) {
      return {
        text: "🎭 극장 목록을 찾을 수 없습니다.",
        isBot: true,
      };
    }

    let text = "🎭 **극장 목록**\n\n🏢 원하는 극장을 선택해주세요:\n\n";
    data.cinemas.slice(0, 10).forEach((cinema, index) => {
      text += `${index + 1}. ${cinema.name}\n   📍 ${cinema.address}\n   📞 ${
        cinema.tel
      }\n\n`;
    });
    if (data.cinemas.length > 10) {
      text += `... 외 ${data.cinemas.length - 10}개 극장 더\n\n`;
    }
    text +=
      "💡 극장 이름이나 번호를 말씀해주시면 자세한 정보와 상영작을 보여드릴게요!";

    return {
      text,
      isBot: true,
      cinemaData: data.cinemas,
    };
  };

  const createCinemaMoviesMessage = (data) => {
    const { cinemamovies, totalCount, message, hasMore } = data;

    let text = "";
    if (message) {
      text = `🎭 ${message}\n\n`;
    }

    text +=
      "🎬 **상영 중인 영화**:\n" +
      cinemamovies.map((movie, index) => `${index + 1}. ${movie}`).join("\n");

    if (hasMore) {
      text +=
        "\n\n💡 더 많은 영화가 상영 중이에요! 원하는 영화 제목으로 검색해보세요.";
    }

    text += "\n\n🎫 예매를 원하시면 영화 제목을 클릭하세요!";

    return {
      text,
      isBot: true,
      movies: cinemamovies,
    };
  };

  const getBotMessage = (data) => {
    const messageCreators = {
      faq: () => createFaqMessage(data.data.content),
      faq_list: () => createFaqListMessage(data.data),
      notice: () => createFaqMessage(data.data.content),
      notice_list: () => createNoticeListMessage(data.data),
      movie: () => createMovieMessage(data.data),
      top10: () => createTop10Message(data.data.movies),
      cinema: () => createCinemaMessage(data.data),
      cinema_list: () => createCinemaListMessage(data.data),
      cinemamovies: () => createCinemaMoviesMessage(data.data),
      suggestion: () => createSuggestionMessage(data.data),
      ai: () => createFaqMessage(data.data.content), // AI 응답 처리 추가
    };

    return (
      messageCreators[data.type]?.() || {
        text: "🤖 처리 중 문제가 발생했어요!\n\n다시 질문해주시거나, 다른 키워드로 검색해보세요.\n\n🆘 도움이 필요하시면 '도움말' 또는 'FAQ'를 입력해주세요!",
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
      const response = await api.get(`/chatbot/ask`, {
        params: { question: input },
      });
      const data = response.data;

      const botMessage = getBotMessage(data);

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "😅 앗, 잠시 문제가 발생했어요!\n\n🔄 네트워크 연결을 확인하고 다시 시도해주세요.\n💡 문제가 계속되면 새로고침 후 다시 이용해보세요.\n\n죄송합니다! 🙏",
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

    window.addEventListener("closeChatBot", handleCloseChatBot);

    return () => {
      window.removeEventListener("closeChatBot", handleCloseChatBot);
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
            placeholder="질문을 입력하세요... (예: 박스오피스, 공지사항, 강남구 극장)"
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
