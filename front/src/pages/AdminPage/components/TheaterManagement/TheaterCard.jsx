import React, { useState } from "react";
import MovieRegistrationModal from "./MRModal/MovieRegistrationModal";

const TheaterCard = ({ theater, onDetailClick, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieRegistration = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="thm-theater-card">
      <h3>{theater.cinemanm}</h3>
      <div className="thm-theater-info">
        <p>
          <strong>주소:</strong> {theater.address}
        </p>
        <p>
          <strong>전화번호:</strong> {theater.tel}
        </p>
      </div>
      <div className="thm-theater-actions">
        <button className="adp-btn-view" onClick={onDetailClick}>
          상세보기
        </button>
        <button className="adp-btn-edit" onClick={handleMovieRegistration}>
          영화 등록
        </button>
        <button className="adp-btn-delete" onClick={() => onDelete(theater)}>
          삭제
        </button>
      </div>

      {isModalOpen && (
        <MovieRegistrationModal theater={theater} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default TheaterCard;

