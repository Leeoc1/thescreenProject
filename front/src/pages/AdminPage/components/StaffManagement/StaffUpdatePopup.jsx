import React from "react";
import { updateStaff, getStaffs } from "../../../../api/userApi";

const StaffUpdatePopup = ({
  selectedStaff,
  setIsPopupOpen,
  setSelectedStaff,
  formData,
  setFormData,
  setStaffs,
}) => {
  const DEPT = ["운영팀", "고객서비스", "매표팀", "상영관팀", "매점팀"];
  const POSITION = ["매니저", "대리", "사원"];
  const ROLE = ["지점 관리", "고객 응대", "매표", "상영관 관리", "매점 판매"];
  const STATUS = ["근무중", "휴가", "퇴사", "퇴근"];

  // 팝업 닫기
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedStaff(null);
    setFormData({
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
  };

  // 필드 변경 시 폼 데이터 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 저장 누를 시 직원 정보 업데이트
  const handleUpdate = async () => {
    try {
      // 직원 정보 업데이트
      await updateStaff(formData);
      handleClosePopup();

      // 다시 직원 목록 조회
      const staffs = await getStaffs();
      setStaffs(staffs);
    } catch (error) {
      if (error.response) {
        alert(error.response.data);
      }
    }
  };

  return (
    <div className="sup-popup-overlay" onClick={handleClosePopup}>
      <div className="sup-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="sup-popup-header">
          <h3>직원 정보 수정</h3>
        </div>
        <div className="sup-popup-body">
          {selectedStaff && (
            <div className="sup-staff-edit-form">
              <div className="sup-form-group">
                <label>직원 ID:</label>
                <input
                  type="text"
                  name="staffid"
                  defaultValue={selectedStaff.staffid}
                  readOnly
                />
              </div>
              <div className="sup-form-group">
                <label>이름:</label>
                <input
                  type="text"
                  name="staffname"
                  defaultValue={selectedStaff.staffname}
                  readOnly
                />
              </div>
              <div className="sup-form-group">
                <label>부서:</label>
                <select
                  name="dept"
                  defaultValue={selectedStaff.dept}
                  onChange={handleInputChange}
                >
                  {DEPT.map((dept) => (
                    <option value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="sup-form-group">
                <label>지점명:</label>
                <input
                  type="text"
                  name="theater"
                  defaultValue={selectedStaff.theater}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sup-form-group">
                <label>직급:</label>
                <select
                  name="position"
                  defaultValue={selectedStaff.position}
                  onChange={handleInputChange}
                >
                  {POSITION.map((position) => (
                    <option value={position}>{position}</option>
                  ))}
                </select>
              </div>
              <div className="sup-form-group">
                <label>담당:</label>
                <select
                  name="role"
                  defaultValue={selectedStaff.role}
                  onChange={handleInputChange}
                >
                  {ROLE.map((role) => (
                    <option value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="sup-form-group">
                <label>휴대폰:</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={selectedStaff.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sup-form-group">
                <label>이메일:</label>
                <input
                  type="text"
                  name="email"
                  defaultValue={selectedStaff.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sup-form-group">
                <label>채용 날짜:</label>
                <input
                  type="text"
                  name="hiredate"
                  defaultValue={selectedStaff.hiredate}
                  readOnly
                />
              </div>
              <div className="sup-form-group">
                <label>고용 형태:</label>
                <input
                  type="text"
                  name="shifttype"
                  defaultValue={selectedStaff.shifttype}
                  readOnly
                />
              </div>
              <div className="sup-form-group">
                <label>근무 상태:</label>
                <select
                  name="status"
                  defaultValue={selectedStaff.status}
                  onChange={handleInputChange}
                >
                  {STATUS.map((status) => (
                    <option value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="sup-popup-footer">
          <button className="sup-popup-btn-cancel" onClick={handleClosePopup}>
            취소
          </button>
          <button className="sup-popup-btn-save" onClick={handleUpdate}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffUpdatePopup;

