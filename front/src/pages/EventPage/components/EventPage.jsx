import React, { useState, useEffect } from "react";
import { eventsData } from "../../../utils/data/EventPageData";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import "../styles/EventPage.css";

const categories = ["진행중인 이벤트", "종료된 이벤트", "멤버쉽"];

const EventPage = () => {
  const [filter, setFilter] = useState("진행중인 이벤트");
  // 카테고리별로 이벤트 필터링
  const filteredEvents = eventsData.filter((event) => {
    if (filter === "진행중인 이벤트") {
      return !event.category || event.category === "진행중인 이벤트";
    }
    return event.category === filter;
  });

  useEffect(() => {
    document.body.classList.add("no-header-padding");
    return () => {
      document.body.classList.remove("no-header-padding");
    };
  }, []);

  return (
    <div className="evp-page">
      <Header />
      <div className="evp-content">
        <div className="evp-main">
          <div className="evp-container">
            <section className="evp-section">
              <div className="evfs-filter">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`evfs-filter-btn ${
                      filter === category ? "evfs-active" : ""
                    }`}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="evp-grid">
                {filteredEvents.map((event, idx) => (
                  <div className="evc-card" key={idx}>
                    <div className="evc-image">
                      <img src={event.image} alt="이벤트 이미지" />
                    </div>
                    <div className="evc-content">
                      <div className="evc-category">
                        {event.category || "진행중인 이벤트"}
                      </div>
                      <h3 className="evc-title">{event.title}</h3>
                      <p className="evc-description">{event.description}</p>
                    </div>
                    <div className="evc-period-custom">
                      <span
                        className={`evc-period-status ${
                          event.badge === "end"
                            ? "evc-status-end"
                            : event.badge === "membership"
                            ? "evc-status-membership"
                            : "evc-status-active"
                        }`}
                      >
                        {event.badge === "end"
                          ? "종료됨"
                          : event.badge === "membership"
                          ? "멤버십"
                          : "진행중"}
                      </span>
                      <span className="evc-period-date-custom">
                        {event.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventPage;

