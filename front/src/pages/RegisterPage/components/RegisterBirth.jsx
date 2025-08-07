import React from "react";
import { useState, useEffect } from "react";
import "../styles/Register.css";

const RegisterBirth = ({ birthDate, setBirthDate }) => {
  const [formBirth, setFormBirth] = useState({
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  });

  useEffect(() => {
    // 한자리 숫자면 앞에 0 추가
    const padZero = (val) => (val && val.length === 1 ? `0${val}` : val);
    const formattedMonth = padZero(formBirth.birthMonth);
    const formattedDay = padZero(formBirth.birthDay);
    // 생년월일 형식: YYYY-MM-DD
    const newBirthDate = `${formBirth.birthYear}-${formattedMonth}-${formattedDay}`;
    setBirthDate(newBirthDate);
  }, [formBirth, setBirthDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormBirth((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="rg-birth-container">
      <input
        className="rg-birth-year"
        type="number"
        id="birthYear"
        name="birthYear"
        value={formBirth.birthYear}
        onChange={handleInputChange}
        placeholder="년(4자리)"
        min="1900"
        max="2100"
        required
      />
      <select
        className="rg-birth-month"
        id="birthMonth"
        name="birthMonth"
        value={formBirth.birthMonth}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled hidden>
          월
        </option>
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      <input
        className="rg-birth-day"
        type="number"
        id="birthDay"
        name="birthDay"
        value={formBirth.birthDay}
        onChange={handleInputChange}
        placeholder="일"
        min="1"
        max="31"
        required
      />
    </div>
  );
};

export default RegisterBirth;

