import React, { useEffect, useState } from "react";
import "../../styles/StaffManagement.css";
import "../../styles/AdminPage.css";
import "../../styles/Stable.css";
import { getStaffs } from "../../../../api/userApi";
import StaffUpdatePopup from "./StaffUpdatePopup";
import AddStaffPopup from "./AddStaffPopup";
import ExcelDownloadButton from "../ExcelDownloadButton";

const StaffManagement = () => {
  const [staffs, setStaffs] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    staffid: "",
    staffname: "",
    dept: "",
    theater: "",
    position: "",
    role: "",
    phone: "",
    email: "",
    hiredate: "",
    shifttype: "",
    status: "",
  });

  useEffect(() => {
    getStaffs()
      .then((response) => {
        setStaffs(response);
      })
      .catch((error) => {
        setStaffs([]);
      });
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "근무중":
        return "adp-active";
      case "휴가":
        return "adp-vacation";
      case "퇴사":
        return "adp-terminated";
      case "퇴근":
        return "adp-off";
      default:
        return "adp-pending";
    }
  };

  // 엑셀 컬럼 매핑
  const excelColumns = {
    "직원 ID": "staffid",
    이름: "staffname",
    부서: "dept",
    지점명: "theater",
    직급: "position",
    담당: "role",
    휴대폰: "phone",
    이메일: "email",
    "채용 날짜": "hiredate",
    "고용 형태": "shifttype",
    "근무 상태": "status",
  };

  // 수정 버튼 누를 시 작동
  // 선택된 직원, formData는 현재 선택된 직원의 정보로 초기화, 팝업 열기
  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      staffid: staff.staffid,
      staffname: staff.staffname,
      dept: staff.dept,
      theater: staff.theater,
      position: staff.position,
      role: staff.role,
      phone: staff.phone,
      email: staff.email,
      hiredate: staff.hiredate,
      shifttype: staff.shifttype,
      status: staff.status,
    });
    setIsPopupOpen(true);
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>직원 관리</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <ExcelDownloadButton
            data={staffs}
            columns={excelColumns}
            fileName="직원목록"
            sheetName="직원목록"
          />
          <button
            className="adp-btn-primary"
            onClick={() => setIsAddPopupOpen(true)}
          >
            직원 추가
          </button>
        </div>
      </div>

      {isAddPopupOpen && (
        <AddStaffPopup
          setIsAddPopupOpen={setIsAddPopupOpen}
          formData={formData}
          setFormData={setFormData}
          setStaffs={setStaffs}
        />
      )}

      <span>총 직원 수 : {staffs.length}</span>
      <div className="stm-table-container">
        <table className="stm-table">
          <thead>
            <tr>
              <th>직원 ID</th>
              <th>이름</th>
              <th>부서</th>
              <th>지점명</th>
              <th>직급</th>
              <th>담당</th>
              <th>휴대폰</th>
              <th>이메일</th>
              <th>채용 날짜</th>
              <th>고용 형태</th>
              <th>근무 상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((item) => (
              <tr>
                <td>{item.staffid}</td>
                <td>{item.staffname}</td>
                <td>{item.dept}</td>
                <td>{item.theater}</td>
                <td>{item.position}</td>
                <td>{item.role}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.hiredate}</td>
                <td>{item.shifttype}</td>
                <td>
                  <span className={`adp-status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="adp-btn-edit"
                    onClick={() => handleEditClick(item)}
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 팝업 오버레이 */}
      {isPopupOpen && (
        <StaffUpdatePopup
          selectedStaff={selectedStaff}
          setIsPopupOpen={setIsPopupOpen}
          setSelectedStaff={setSelectedStaff}
          formData={formData}
          setFormData={setFormData}
          setStaffs={setStaffs}
        />
      )}
    </div>
  );
};

export default StaffManagement;

