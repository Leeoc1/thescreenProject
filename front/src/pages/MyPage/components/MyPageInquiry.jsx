import React from "react";
import "../styles/MyPageInquiry.css";
import "../styles/MyPageMain.css"; // section 스타일

const MyPageInquiry = () => {
  return (
    <section className="mp-section">
      <div className="mp-section-header">
        <h2 className="mp-section-title">문의내역</h2>
        <button className="mp-more-button">더보기</button>
      </div>

      <div className="mp-inquiry-table-container">
        <table className="mp-inquiry-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>문의일자</th>
              <th>답변여부</th>
            </tr>
          </thead>
          <tbody>
            <tr className="mp-inquiry-row">
              <td className="mp-inquiry-title">문의제목</td>
              <td className="mp-inquiry-date">2025-01-01</td>
              <td className="mp-inquiry-status">
                <span className="mp-status-badge">Y</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MyPageInquiry;

