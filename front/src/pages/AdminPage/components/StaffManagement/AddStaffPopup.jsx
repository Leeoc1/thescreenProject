import React from "react";
import { addStaff, getStaffs } from "../../../../api/userApi";

const AddStaffPopup = ({
  setIsAddPopupOpen,
  formData,
  setFormData,
  setStaffs,
}) => {
  const DEPT = ["운영팀", "고객서비스", "매표팀", "상영관팀", "매점팀"];
  const POSITION = ["매니저", "대리", "사원"];
  const ROLE = ["지점 관리", "고객 응대", "매표", "상영관 관리", "매점 판매"];
  const SHIFTTYPE = ["주간", "야간"];
  const STATUS = ["근무중", "휴가", "퇴사", "퇴근"];

  // 팝업 닫기
  const handleClosePopup = () => {
    setIsAddPopupOpen(false);
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

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // form 제출 핸들러
  const handleSubmit = async (e) => {
    // 폼 기본 제출 방지 
    e.preventDefault();

    try {
      // 직원 정보 추가 
      await addStaff(formData);
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
    <div className="sup-popup-overlay">
      <div className="sup-popup-content">
        <div className="sup-popup-header">
          <h3>직원 추가</h3>
        </div>
        <form className="sup-popup-body" onSubmit={handleSubmit}>
          <div className="sup-staff-edit-form">
            <div className="sup-form-group">
              <label>직원 ID:</label>
              <input
                type="text"
                name="staffid"
                value={formData.staffid}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sup-form-group">
              <label>이름:</label>
              <input
                type="text"
                name="staffname"
                value={formData.staffname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sup-form-group">
              <label>부서:</label>
              <select name="dept" value={formData.dept} onChange={handleChange} required>
                <option value="">선택</option>
                {DEPT.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="sup-form-group">
              <label>지점명:</label>
              <input
                type="text"
                name="theater"
                value={formData.theater}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sup-form-group">
              <label>직급:</label>
              <select name="position" value={formData.position} onChange={handleChange} required>
                <option value="">선택</option>
                {POSITION.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <div className="sup-form-group">
              <label>담당:</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">선택</option>
                {ROLE.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="sup-form-group">
              <label>휴대폰:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sup-form-group">
              <label>이메일:</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sup-form-group">
              <label>채용 날짜:</label>
              <input
                type="text"
                name="hiredate"
                value={formData.hiredate}
                disabled
                required
              />
            </div>
            <div className="sup-form-group">
              <label>고용 형태:</label>
              <select name="shifttype" value={formData.shifttype} onChange={handleChange} required>
                <option value="">선택</option>
                {SHIFTTYPE.map((shifttype) => (
                  <option key={shifttype} value={shifttype}>
                    {shifttype}
                  </option>
                ))}
              </select>
            </div>
            <div className="sup-form-group">
              <label>근무 상태:</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="">선택</option>
                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sup-popup-footer">
            <button
              className="sup-popup-btn-cancel"
              type="button"
              onClick={handleClosePopup}
            >
              취소
            </button>
            <button className="sup-popup-btn-save" type="submit">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffPopup;

