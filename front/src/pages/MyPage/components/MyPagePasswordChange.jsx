import React from "react";
import "../styles/MyPagePasswordChange.css";
import {
  validatePasswordLength,
  validatePasswordStrength,
} from "../../RegisterPage/components/RegisterValidation";
import { useState } from "react";
import { checkPassword, updatePassword } from "../../../api/userApi";

const MyPagePasswordChange = ({
  userInfo,
  passwordForm,
  setPasswordForm,
  setIsPasswordModalOpen,
}) => {
  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!passwordForm.currentPassword.trim()) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert(
        "현재 비밀번호와 새 비밀번호가 동일합니다. 다른 비밀번호를 입력해주세요."
      );
      return;
    }

    if (passwordForm.newPassword) {
      const lengthValid = validatePasswordLength(passwordForm.newPassword);
      const strengthValid = validatePasswordStrength(passwordForm.newPassword);

      if (!lengthValid || !strengthValid) {
        alert("비밀번호는 8~20자 영문, 숫자, 특수문자가 포함되어야 합니다.");
        return;
      }
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 현재 비밀번호 확인
      const checkResponse = await checkPassword(
        userInfo.userid,
        passwordForm.currentPassword
      );

      if (checkResponse.success !== true) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      } else {
        const response = await updatePassword(
          userInfo.userid,
          passwordForm.newPassword
        );

        if (response.success) {
          alert("비밀번호가 성공적으로 변경되었습니다.");
          handlePasswordModalClose(); // 팝업 닫기
        }
      }
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mp-password-modal-overlay">
      <div className="mp-password-modal">
        <div className="mp-password-modal-header">
          <h3 className="mp-password-modal-title">비밀번호 변경</h3>
          <button
            className="mp-password-modal-close"
            onClick={handlePasswordModalClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="mp-password-modal-body">
            <div className="mp-password-form-group">
              <label className="mp-password-label required">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  handlePasswordFormChange("currentPassword", e.target.value)
                }
                className="mp-password-input"
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="mp-password-form-group">
              <label className="mp-password-label required">새 비밀번호</label>
              <span className="mp-form-note">
                비밀번호는 8~20자 영문, 숫자, 특수문자만 가능합니다.
              </span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  handlePasswordFormChange("newPassword", e.target.value)
                }
                className="mp-password-input"
                placeholder="새 비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="mp-password-form-group">
              <label className="mp-password-label required">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  handlePasswordFormChange("confirmPassword", e.target.value)
                }
                className="mp-password-input"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
            </div>
          </div>

          <div className="mp-password-modal-footer">
            <button
              type="button"
              className="mp-password-btn mp-password-btn-cancel"
              onClick={handlePasswordModalClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="mp-password-btn mp-password-btn-submit"
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
            >
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPagePasswordChange;

