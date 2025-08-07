import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import MyAccount from "./MyAccount";
import { checkPassword, updateUserInfo } from "../../../api/userApi";
import "../styles/MyInfo.css";
import "../styles/MyPageMain.css"; // mp-my-page 스타일
import MyPagePasswordChange from "./MyPagePasswordChange";
import MyPageTelChange from "./MyPageTelChange";

const MyInfo = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 개인정보 수정 관련 state
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // 비밀번호 변경 모달 관련 state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // state로 전달받은 userInfo가 있으면 사용
  useEffect(() => {
    if (location.state?.userInfo) {
      setUserInfo(location.state.userInfo);
      setEditForm({
        username: location.state.userInfo.username || "",
        email: location.state.userInfo.email || "",
        phone: location.state.userInfo.phone || "",
      });
      setLoading(false);
    }
  }, [location.state]);

  // 비밀번호 확인 함수
  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await checkPassword(userInfo.userid, password);

      if (response.success) {
        setIsPasswordVerified(true);
      } else {
        setPasswordError("비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      setPasswordError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  // 개인정보 수정 관련 함수
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await updateUserInfo(userInfo.userid, editForm);

      if (response.success) {
        alert("개인정보가 성공적으로 수정되었습니다.");
      }

      // userInfo 업데이트
      setUserInfo((prev) => ({
        ...prev,
        ...editForm,
      }));
    } catch (error) {
      alert("개인정보 수정 중 오류가 발생했습니다.");
    }
  };

  // 비밀번호 변경 모달 관련 함수
  const handlePasswordModalOpen = () => {
    setIsPasswordModalOpen(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div>
      <Header />
      <div className="mp-my-page">
        <MyAccount loading={loading} userInfo={userInfo} currentPage={1} />
        {/* Main Content */}
        <div className="mp-main-content">
          <section className="mp-section">
            <div className="mp-section-header">
              <h2 className="mp-section-title">개인정보수정</h2>
            </div>
            {!isPasswordVerified ? (
              <div>
                <p className="mp-info-description">
                  개인정보 보호를 위해 비밀번호를 다시 한 번 입력해주세요.
                </p>
                <form
                  onSubmit={handlePasswordVerification}
                  className="mp-info-form"
                >
                  <div className="mp-info-form-group">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="mp-info-input"
                    />
                  </div>
                  {passwordError && (
                    <p className="mp-info-error">{passwordError}</p>
                  )}
                  <button type="submit" className="mp-info-submit-btn">
                    확인
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* 프로필 섹션 */}
                <div className="mp-info-profile-section">
                  <div className="mp-info-profile-header">
                    <div className="mp-info-profile-avatar-large">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="#999"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="mp-info-profile-info-section">
                      <div className="mp-info-profile-id">
                        {userInfo?.userid}
                      </div>
                      <div className="mp-info-profile-buttons">
                        <button className="mp-info-profile-btn">
                          이미지등록
                        </button>
                        <span className="mp-form-note">
                          ※ 개인정보가 포함된 이미지 등록을 자제하여 주시기
                          바랍니다.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 기본정보 폼 */}
                <div className="mp-info-form-container">
                  <div className="mp-info-form-header">
                    기본정보{" "}
                    <span style={{ color: "#ff4757", fontSize: "12px" }}>
                      * 필수
                    </span>
                  </div>
                  <form onSubmit={handleEditSubmit}>
                    <div className="mp-info-form-body">
                      <div className="mp-form-field">
                        <label className="mp-form-label required">이름</label>
                        <div className="mp-form-input-wrapper">
                          {editForm.username}
                          <button type="button" className="mp-form-button">
                            이름변경
                          </button>
                          <span className="mp-form-note">
                            ※ 개명으로 이름이 변경된 경우, 회원정보의 이름을
                            변경할 수 있습니다.
                          </span>
                        </div>
                      </div>

                      <div className="mp-form-field">
                        <label className="mp-form-label required">
                          생년월일
                        </label>
                        <div className="mp-form-input-wrapper">
                          {location.state.userInfo.birth}
                        </div>
                      </div>

                      <MyPageTelChange
                        editForm={editForm}
                        setEditForm={setEditForm}
                      />

                      <div className="mp-form-field">
                        <label className="mp-form-label required">이메일</label>
                        <div className="mp-form-input-wrapper">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              handleEditChange("email", e.target.value)
                            }
                            className="mp-form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="mp-form-field">
                        <label className="mp-form-label required">
                          비밀번호
                        </label>
                        <div className="mp-form-input-wrapper">
                          <button
                            type="button"
                            className="mp-form-button"
                            onClick={handlePasswordModalOpen}
                          >
                            비밀번호 변경
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mp-form-actions">
                      <button type="submit" className="mp-save-btn">
                        저장하기
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <MyPagePasswordChange
          userInfo={userInfo}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          setIsPasswordModalOpen={setIsPasswordModalOpen}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyInfo;

