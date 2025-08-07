import React, { useState, useEffect } from "react";
import "../styles/UserManagement.css";
import "../styles/AdminPage.css";
import "../styles/Stable.css";
import { getAllUsers } from "../../../api/userApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 상태에 따라 CSS 클래스와 텍스트를 다르게 반환
  const getStatusClass = (status) => {
    if (status === "탈퇴") return "adp-vacation";
    return "adp-active";
  };
  const getStatusText = (status, userid) => {
    if (userid === "admin") return "관리자";
    if (status === "탈퇴") return "탈퇴";
    return "활성";
  };

  if (loading) {
    return (
      <div className="adp-content">
        <div className="adp-header">
          <h2>회원 관리</h2>
        </div>
        <div style={{ textAlign: "center", padding: "50px" }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adp-content">
        <div className="adp-header">
          <h2>회원 관리</h2>
        </div>
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          오류: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>회원 관리</h2>
        <button className="adp-btn-primary">회원 추가</button>
      </div>

      <span>총 회원 수 : {users.length}</span>
      <div className="usm-table-container">
        <table className="usm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>전화번호</th>
              <th>생년월일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userid}>
                <td>{user.userid}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.birth}</td>
                <td>
                  <span className={`adp-status ${getStatusClass(user.status)}`}>
                    {getStatusText(user.status, user.userid)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

