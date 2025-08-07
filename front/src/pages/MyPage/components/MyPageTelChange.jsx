import React from "react";
import { sendVerificationCode, verifyCode } from "../../../api/smsApi";
import "../styles/MyInfo.css";
import { useState, useEffect } from "react";

const MyPageTelChange = ({ editForm, setEditForm }) => {
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0); // 타이머 초 단위
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 휴대폰번호 변경 관련 state
  const [isPhoneChangeMode, setIsPhoneChangeMode] = useState(false);
  const [phoneForm, setPhoneForm] = useState({
    newPhone: "",
    verificationCode: "",
  });

  const [validationState, setValidationState] = useState({
    phoneVerified: false,
    verificationSent: false,
  });

  // 휴대폰번호 변경 관련 함수
  const handlePhoneChangeMode = () => {
    setIsPhoneChangeMode(true);
    setPhoneForm({
      newPhone: "",
      verificationCode: "",
    });
  };

  // 전화번호 입력 처리
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // 숫자만 허용
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setPhoneForm({ ...phoneForm, newPhone: numbersOnly });
    setMessage("");
  };

  // 인증번호 입력 처리
  const handleCodeChange = (e) => {
    setPhoneForm({ ...phoneForm, verificationCode: e.target.value });
    setMessage("");
  };

  // 타이머 포맷팅 (MM:SS)
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 인증번호 전송
  const handlePhoneVerification = async () => {
    if (!phoneForm.newPhone) {
      setMessage("전화번호를 입력해주세요.");
      return;
    }
    // 전화번호 유효성 검사 (010으로 시작, 10~11자리)
    if (
      !/^01[0-1,7][0-9]{7,8}$/.test(phoneForm.newPhone.replace(/[^0-9]/g, ""))
    ) {
      setMessage("유효한 전화번호를 입력해주세요 (예: 01012345678).");
      return;
    }

    try {
      await sendVerificationCode(phoneForm.newPhone);
      setValidationState({ ...validationState, verificationSent: true });
      setTimer(300); // 5분 = 300초
      setIsTimerActive(true);
      setMessage("인증번호가 전송되었습니다.");
    } catch (error) {
      setMessage(`전송 실패: ${error.message}`);
    }
  };

  // 인증번호 검증
  const handleVerificationCodeCheck = async () => {
    if (!phoneForm.verificationCode) {
      setMessage("인증번호를 입력해주세요.");
      return;
    }

    try {
      await verifyCode(phoneForm.newPhone, phoneForm.verificationCode);
      setValidationState({ ...validationState, phoneVerified: true });
      setIsTimerActive(false); // 인증 성공 시 타이머 중지
      setTimer(0);
      setMessage("전화번호 인증이 완료되었습니다.");
    } catch (error) {
      setMessage(`인증 실패: ${error.message}`);
    }
  };

  // 전화번호 인증 완료 시 editForm 업데이트
  useEffect(() => {
    if (validationState.phoneVerified && phoneForm.newPhone) {
      setEditForm((prev) => ({
        ...prev,
        phone: phoneForm.newPhone,
      }));
    }
  }, [validationState.phoneVerified, phoneForm.newPhone, setEditForm]);

  // 타이머 카운트다운
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      setMessage("인증번호가 만료되었습니다. 다시 전송해주세요.");
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  return (
    <div className="mp-form-field">
      <label className="mp-form-label required">휴대폰</label>
      <div className="mp-form-input-wrapper">
        {!isPhoneChangeMode ? (
          <>
            {editForm.phone}
            <button
              type="button"
              className="mp-form-button"
              onClick={handlePhoneChangeMode}
            >
              휴대폰번호 변경
            </button>
          </>
        ) : (
          <div className="mp-phone-change-section">
            <div className="mp-phone-input-group">
              <input
                type="tel"
                value={phoneForm.newPhone}
                onChange={handlePhoneChange}
                className="mp-form-input"
                placeholder="새 휴대폰번호를 입력하세요"
                maxLength="11"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={validationState.phoneVerified}
                required
              />
              <button
                type="button"
                className="mp-form-button"
                onClick={handlePhoneVerification}
                disabled={validationState.phoneVerified || isTimerActive}
              >
                {validationState.phoneVerified ? "인증완료" : "인증번호전송"}
              </button>
            </div>

            {validationState.verificationSent &&
              !validationState.phoneVerified && (
                <>
                  <div className="mp-verification-input-group">
                    <input
                      type="text"
                      value={phoneForm.verificationCode}
                      onChange={handleCodeChange}
                      className="mp-form-input"
                      placeholder="인증번호를 입력하세요"
                      disabled={timer === 0}
                      required
                    />
                    <button
                      type="button"
                      className="mp-form-button"
                      onClick={handleVerificationCodeCheck}
                      disabled={timer === 0}
                    >
                      확인
                    </button>
                  </div>
                  {timer > 0 && (
                    <p className="rg-validation-message rg-timer">
                      남은 시간: {formatTimer(timer)}
                    </p>
                  )}
                </>
              )}

            {/* <div className="mp-phone-change-actions">
              <button
                type="button"
                className="mp-save-btn"
                onClick={() => setIsPhoneChangeMode(false)}
              >
                수정
              </button>
            </div> */}
          </div>
        )}

        {message && (
          <p
            className={`rg-validation-message ${
              message.includes("실패") || message.includes("만료")
                ? "rg-error"
                : "rg-success"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyPageTelChange;

