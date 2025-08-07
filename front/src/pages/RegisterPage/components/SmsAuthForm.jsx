import React, { useState, useEffect } from "react";
import { sendVerificationCode, verifyCode } from "../../../api/smsApi";
import "../styles/SmsAuthForm.css";

function SmsAuthForm({
  formData,
  setFormData,
  validationState,
  setValidationState,
}) {
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0); // 타이머 초 단위
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 전화번호 입력 처리
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // 숫자만 허용
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, phone: numbersOnly }));
    setMessage("");
  };

  // 인증번호 입력 처리
  const handleCodeChange = (e) => {
    setFormData((prev) => ({ ...prev, verificationCode: e.target.value }));
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
    if (!formData.phone) {
      setMessage("전화번호를 입력해주세요.");
      return;
    }
    // 전화번호 유효성 검사 (010으로 시작, 10~11자리)
    if (!/^01[0-1,7][0-9]{7,8}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      setMessage("유효한 전화번호를 입력해주세요 (예: 01012345678).");
      return;
    }

    try {
      await sendVerificationCode(formData.phone);
      setValidationState((prev) => ({ ...prev, verificationSent: true }));
      setTimer(300); // 5분 = 300초
      setIsTimerActive(true);
      setMessage("인증번호가 전송되었습니다.");
    } catch (error) {
      setMessage(`전송 실패: ${error.message}`);
    }
  };

  // 인증번호 검증
  const handleVerificationCodeCheck = async () => {
    if (!formData.verificationCode) {
      setMessage("인증번호를 입력해주세요.");
      return;
    }

    try {
      await verifyCode(formData.phone, formData.verificationCode);
      setValidationState((prev) => ({ ...prev, phoneVerified: true }));
      setIsTimerActive(false); // 인증 성공 시 타이머 중지
      setTimer(0);
      setMessage("전화번호 인증이 완료되었습니다.");
    } catch (error) {
      setMessage(`인증 실패: ${error.message}`);
    }
  };

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
    <div className="sms-auth-form">
      <div className="rg-form-group">
        <label htmlFor="phone">전화번호</label>
        <div className="rg-input-with-button">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="전화번호를 - 없이 입력하세요"
            maxLength="11"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            disabled={validationState.phoneVerified}
          />
          <button
            type="button"
            className="rg-verify-btn"
            onClick={handlePhoneVerification}
            disabled={validationState.phoneVerified || isTimerActive}
          >
            {validationState.phoneVerified ? "인증완료" : "인증번호전송"}
          </button>
        </div>
      </div>

      {validationState.verificationSent && !validationState.phoneVerified && (
        <div className="rg-form-group">
          <div className="rg-input-with-button">
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleCodeChange}
              placeholder="인증번호를 입력하세요"
              disabled={timer === 0}
            />
            <button
              type="button"
              className="rg-check-btn"
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
  );
}

export default SmsAuthForm;

