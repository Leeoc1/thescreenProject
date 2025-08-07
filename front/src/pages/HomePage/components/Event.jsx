import { eventsData } from "../../../utils/data/EventPageData.js";
import "../styles/Event.css";
import { useNavigate } from "react-router-dom";

const Event = () => {
  const navigate = useNavigate();

  return (
    <section className="et-events-section">
      <div className="et-events-container">
        <div className="et-events-header">
          <h2 className="et-events-title">특별 이벤트</h2>
          <p className="et-events-subtitle">놓치면 안 될 특별한 혜택들</p>
        </div>

        <div className="et-events-grid">
          {eventsData.slice(0, 4).map((event, index) => (
            <div
              key={index}
              className="et-event-card"
              onClick={() => {
                navigate("/event");
                window.scrollTo(0, 0);
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src={event.image}
                alt={event.title}
                className="et-event-image"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=";
                }}
              />
              <div className="et-event-content">
                <h3 className="et-event-title">{event.title}</h3>
                <p className="et-event-description">{event.description}</p>
                <div className="et-event-footer">
                  <span className="et-event-badge" style={{ color: "white" }}>
                    {event.location}
                  </span>
                  <a href="#" className="et-event-link">
                    자세히 보기
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Event;

