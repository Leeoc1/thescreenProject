import React, { useState, useEffect } from "react";
import { getMoviesForAdmin } from "../../../../../api/movieApi";
import { getSchedules } from "../../../../../api/api";
import "../style/modal.css";
import "../style/MovieRegistrationModal.css";
import MovieTabs from "./MovieTabs";
import SelectedScreen from "./SelectedScreen";

const MovieRegistrationModal = ({ theater, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [movies, setMovies] = useState({
    available: [],
    current: [],
    ended: [],
  });
  const [loading, setLoading] = useState(true);

  const categorizeMovies = async () => {
    const [movieData, scheduleData] = await Promise.all([
      getMoviesForAdmin(),
      getSchedules(),
    ]);

    const { currentMovies = [] } = movieData;
    const schedules = scheduleData || [];

    const currentTheaterSchedules = schedules.filter(
      (schedule) => schedule.cinemanm === theater.cinemanm
    );
    const scheduledMovieNames = [
      ...new Set(currentTheaterSchedules.map((schedule) => schedule.movienm)),
    ];

    return {
      available: currentMovies.filter(
        (movie) =>
          movie.movieinfo === "Y" &&
          !scheduledMovieNames.includes(movie.movienm)
      ),
      current: currentMovies.filter((movie) =>
        scheduledMovieNames.includes(movie.movienm)
      ),
      ended: currentMovies.filter((movie) => movie.screeningstatus === "N"),
    };
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const categorizedMovies = await categorizeMovies();
        setMovies(categorizedMovies);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [theater.cinemanm]);

  const handleMovieSelect = (movie) => {
    setSelectedMovies((prev) => {
      const isSelected = prev.some((m) => m.moviecd === movie.moviecd);
      return isSelected
        ? prev.filter((m) => m.moviecd !== movie.moviecd)
        : [...prev, movie];
    });
  };

  const handleRegisterMovies = () => {
    if (selectedMovies.length === 0) {
      alert("등록할 영화를 선택해주세요.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMovies([]);

    const refreshMovies = async () => {
      try {
        setLoading(true);
        const categorizedMovies = await categorizeMovies();
        setMovies(categorizedMovies);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    refreshMovies();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{theater.cinemanm}에 영화 등록</h2>
          <div className="modal-header-actions">
            {selectedMovies.length > 0 && (
              <button
                className="mrm-btn-register-movies"
                onClick={handleRegisterMovies}
              >
                선택한 영화 등록 ({selectedMovies.length}개)
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">
          <MovieTabs
            movies={movies}
            loading={loading}
            selectedMovies={selectedMovies}
            onMovieSelect={handleMovieSelect}
            theater={theater}
            onCloseParent={onClose}
          />
        </div>

        {isModalOpen && selectedMovies.length > 0 && (
          <SelectedScreen
            isModalOpen={isModalOpen}
            movies={selectedMovies}
            theater={theater}
            onClose={handleModalClose}
            onCloseParent={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default MovieRegistrationModal;

