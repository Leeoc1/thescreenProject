import React, { useState, useEffect } from "react";
import { getRating } from "../../../../../utils/data/MovieInfo";
import { getSchedules } from "../../../../../api/cinemaApi";
import SelectedScreen from "./SelectedScreen";

const CurrentMoviesList = ({
  movieList = [],
  selectedMovies = [],
  onMovieSelect = () => {},
  theater,
  onCloseParent,
}) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieSchedules, setMovieSchedules] = useState({});

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!theater || !movieList.length) return;

      const schedulesMap = {};

      for (const movie of movieList) {
        try {
          const screenData = await getSchedules(movie.moviecd);
          schedulesMap[movie.moviecd] = screenData;
        } catch (error) {
          
          schedulesMap[movie.moviecd] = [];
        }
      }

      setMovieSchedules(schedulesMap);
    };

    fetchSchedules();
  }, [theater, movieList]);

  const handleMovieClick = (movie) => {
    const schedules = movieSchedules[movie.moviecd] || [];
    const currentTheaterSchedules = schedules.filter(
      (s) => s.cinemanm === theater.cinemanm && s.movienm === movie.movienm
    );

    setSelectedMovie({
      ...movie,
      currentSchedules: currentTheaterSchedules,
    });
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <>
      <div className="mrm-movie-list">
        {movieList.map((movie) => {
          const isSelected = selectedMovies.some(
            (m) => m.moviecd === movie.moviecd
          );
          const schedules = movieSchedules[movie.moviecd] || [];

          // 현재 영화관과 현재 영화에 일치하는 스케줄만 필터링하고 상영관명 중복 제거
          const currentTheaterSchedules = schedules.filter(
            (s) =>
              s.cinemanm === theater.cinemanm && s.movienm === movie.movienm
          );
          const uniqueScreenNames = [
            ...new Set(currentTheaterSchedules.map((s) => s.screenname)),
          ];

          return (
            <div
              key={movie.moviecd}
              className={`mrm-movie-item ${
                isSelected ? "selected" : ""
              } clickable`}
              onClick={() => handleMovieClick(movie)}
            >
              <div className="mrm-movie-info">
                <h4>{movie.movienm}</h4>
                <div className="mrm-movie-summary">
                  <img
                    src={movie.posterurl}
                    alt={movie.movienm}
                    width={130}
                    height={180}
                  />
                  <div>
                    <p>
                      <strong>감독:</strong> {movie.director}
                    </p>
                    <p>
                      <strong>장르:</strong> {movie.genre}
                    </p>
                    <p>
                      <strong>상영시간:</strong> {movie.runningtime}분
                    </p>
                    <p>
                      <strong>등급:</strong> {getRating(movie.isadult)}
                    </p>
                    <p>
                      <strong>개봉일:</strong> {movie.releasedate}
                    </p>
                    <p>
                      <strong>상영관:</strong>{" "}
                      {uniqueScreenNames.length > 0
                        ? uniqueScreenNames.join(", ")
                        : "정보 없음"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mrm-selection-indicator">
                클릭하여 상영관 설정
              </div>
            </div>
          );
        })}
      </div>
      {selectedMovie && (
        <SelectedScreen
          movies={[selectedMovie]}
          theater={theater}
          onClose={handleCloseModal}
          onCloseParent={onCloseParent}
          existingSchedules={selectedMovie.currentSchedules || []}
        />
      )}
    </>
  );
};

export default CurrentMoviesList;

