import { useEffect, useState } from "react";
import "../styles/Notice.css";
import { useNavigate } from "react-router-dom";
import { fetchAllNotices, fetchAllFaqs } from "../../../api/userApi";

const Notice = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetchAllNotices().then(setNotices);
    fetchAllFaqs().then(setFaqs);
  }, []);

  // 간단한 헬퍼 함수들
  const goNotice = (tab) =>
    navigate(tab === "faq" ? "/notice/faq" : "/notice/notice");

  const getTop5Notices = (notices) => {
    if (!notices?.length) return [];
    return notices
      .filter((notice) => notice.noticetype !== "문의")
      .sort((a, b) => b.noticenum - a.noticenum)
      .slice(0, 5);
  };

  const getTop5Faqs = (faqs) => {
    if (!faqs?.length) return [];
    return faqs.sort((a, b) => b.faqnum - a.faqnum).slice(0, 5);
  };

  const handleNoticeClick = (noticenum) => {
    navigate(`/notice/${noticenum}`);
  };

  return (
    <section className="nt-notice-faq-section">
      <div className="nt-notice-faq-container">
        <div className="nt-notice-faq-grid">
          {/* 공지사항 */}
          <div className="nt-section-column">
            <div className="nt-section-header">
              <h2 className="nt-section-title">공지사항</h2>
              <p
                className="nt-section-subtitle"
                onClick={() => goNotice("notice")}
              >
                더보기 &gt;
              </p>
            </div>
            <div className="nt-section-content">
              {getTop5Notices(notices).map((notice, index) => (
                <div
                  key={notice.noticenum}
                  className={`nt-faq-item ${index === 0 ? "nt-featured" : ""}`}
                >
                  <button
                    className="nt-button"
                    onClick={() => handleNoticeClick(notice.noticenum)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="nt-question">{notice.noticesub}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* FAQ */}
          <div className="nt-section-column">
            <div className="nt-section-header">
              <h2 className="nt-section-title">자주 묻는 질문</h2>
              <p
                className="nt-section-subtitle"
                onClick={() => goNotice("faq")}
              >
                더보기 &gt;
              </p>
            </div>
            <div className="nt-section-content">
              {getTop5Faqs(faqs).map((faq, index) => (
                <div
                  key={index}
                  className="nt-faq-item"
                  onClick={() => goNotice("faq")}
                  style={{ cursor: "pointer" }}
                >
                  <button className="nt-button">
                    <span className="nt-question">{faq.faqsub}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Notice;

