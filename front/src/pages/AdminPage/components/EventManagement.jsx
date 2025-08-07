import React, { useState } from "react";
import { eventsData } from "../../../utils/data/EventPageData";
import "../styles/EventManagement.css";
import "../styles/AdminPage.css";

const EventManagement = () => {
  const [events, setEvents] = useState(eventsData);
  const [activeTab, setActiveTab] = useState("전체");

  // 이벤트 상태 결정 함수
  const getEventStatus = (event) => {
    const today = new Date();
    const [startDate, endDate] = event.period.split(" ~ ");

    if (event.badge === "end" || event.category === "종료된 이벤트") {
      return "종료";
    }

    if (event.badge === "membership" || event.category === "멤버쉽") {
      return "상시진행";
    }

    if (event.period === "상시 진행") {
      return "상시진행";
    }

    try {
      const start = new Date(startDate.replace(/\./g, "-"));
      const end = new Date(endDate.replace(/\./g, "-"));

      if (today < start) {
        return "준비중";
      } else if (today >= start && today <= end) {
        return "진행중";
      } else {
        return "종료";
      }
    } catch (error) {
      return "알수없음";
    }
  };

  // 상태별 클래스 결정
  const getStatusClass = (status) => {
    switch (status) {
      case "진행중":
      case "상시진행":
        return "adp-active";
      case "준비중":
        return "adp-pending";
      case "종료":
        return "adp-terminated";
      default:
        return "adp-pending";
    }
  };

  // 이벤트 필터링
  const filteredEvents =
    activeTab === "전체"
      ? events
      : events.filter((event) => {
          const status = getEventStatus(event);
          if (activeTab === "진행중")
            return status === "진행중" || status === "상시진행";
          if (activeTab === "종료") return status === "종료";
          if (activeTab === "멤버쉽") return event.category === "멤버쉽";
          return true;
        });

  // 이벤트 중단/재시작 처리
  const handleToggleEvent = (eventIndex) => {
    const updatedEvents = [...events];
    const event = updatedEvents[eventIndex];

    if (event.badge === "end") {
      // 종료된 이벤트를 재시작
      delete event.badge;
      delete event.category;
      alert("이벤트가 재시작되었습니다.");
    } else {
      // 진행중인 이벤트를 중단
      event.badge = "end";
      event.category = "종료된 이벤트";
      alert("이벤트가 중단되었습니다.");
    }

    setEvents(updatedEvents);
  };

  // 이벤트 수정 (임시)
  const handleEditEvent = (eventIndex) => {
    alert(`이벤트 수정 기능 (이벤트 인덱스: ${eventIndex})`);
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>이벤트 관리</h2>
        <button className="adp-btn-primary">이벤트 추가</button>
      </div>

      <div className="evm-event-tabs">
        <div className="evm-tab-nav">
          <button
            className={`evm-tab-btn${
              activeTab === "전체" ? " evm-active" : ""
            }`}
            onClick={() => setActiveTab("전체")}
          >
            전체 이벤트
          </button>
          <button
            className={`evm-tab-btn${
              activeTab === "진행중" ? " evm-active" : ""
            }`}
            onClick={() => setActiveTab("진행중")}
          >
            진행중 이벤트
          </button>
          <button
            className={`evm-tab-btn${
              activeTab === "종료" ? " evm-active" : ""
            }`}
            onClick={() => setActiveTab("종료")}
          >
            종료된 이벤트
          </button>
          <button
            className={`evm-tab-btn${
              activeTab === "멤버쉽" ? " evm-active" : ""
            }`}
            onClick={() => setActiveTab("멤버쉽")}
          >
            멤버쉽 이벤트
          </button>
        </div>

        <div className="evm-table-container">
          <table className="evm-table">
            <thead>
              <tr>
                <th>이벤트명</th>
                <th>설명</th>
                <th>진행 기간</th>
                <th>진행 장소</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    이벤트 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => {
                  const originalIndex = events.findIndex((e) => e === event);
                  const status = getEventStatus(event);

                  return (
                    <tr key={originalIndex}>
                      <td>
                        <div className="evm-event-title">{event.title}</div>
                      </td>
                      <td>
                        <div className="evm-event-description">
                          {event.description.length > 50
                            ? `${event.description.substring(0, 50)}...`
                            : event.description}
                        </div>
                      </td>
                      <td>{event.period}</td>
                      <td>{event.location}</td>
                      <td>
                        <span
                          className={`adp-status ${getStatusClass(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="evm-action-buttons">
                          <button
                            className="adp-btn-edit"
                            onClick={() => handleEditEvent(originalIndex)}
                          >
                            수정
                          </button>
                          <button
                            className={
                              status === "종료"
                                ? "adp-btn-start"
                                : "adp-btn-stop"
                            }
                            onClick={() => handleToggleEvent(originalIndex)}
                          >
                            {status === "종료" ? "재시작" : "중단"}
                          </button>
                        </div>
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

export default EventManagement;

