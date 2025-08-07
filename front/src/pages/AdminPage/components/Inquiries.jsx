import React from "react";
import "../styles/Inquiries.css";
import "../styles/AdminPage.css";

const Inquiries = () => {
  const getStatusClass = (status) => {
    switch (status) {
      case "미답변":
        return "adp-pending";
      case "처리중":
        return "adp-processing";
      case "답변완료":
        return "adp-active";
      default:
        return "adp-pending";
    }
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>고객 지원</h2>
        <div className="inq-filter-section">
          <select>
            <option>전체</option>
            <option>미답변</option>
            <option>답변완료</option>
            <option>처리중</option>
          </select>
        </div>
      </div>

      <div className="inq-table-container">
        <table className="inq-table">
          <thead>
            <tr>
              <th>문의번호</th>
              <th>고객명</th>
              <th>문의유형</th>
              <th>제목</th>
              <th>등록일</th>
              <th>상태</th>
              <th>담당자</th>
              <th>작업</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

export default Inquiries;

