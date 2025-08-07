import React, { useState, useEffect } from "react";
import { getSchedules } from "../../../../api/api";
import { getCurrentMovies } from "../../../../api/movieApi";

const TheaterMovieList = ({ cinemacd, onMovieCountChange, theater }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cinemacd && theater) {
      fetchTheaterMovies();
    }
  }, [cinemacd, theater]);

  const fetchTheaterMovies = async () => {
    setLoading(true);
    try {
      // 현재 상영중인 모든 영화 조회
      const allMovies = await getCurrentMovies();

      // 해당 극장의 스케줄 조회 (오늘 날짜)
      const today = new Date().toISOString().split("T")[0];
      const schedules = await getSchedules(cinemacd, today);

      // 선택한 극장에서 상영하는 영화만 필터링
      const theaterSchedules = schedules.filter(
        (schedule) => schedule.cinemanm === theater.cinemanm
      );

      const scheduledMovieNames = [
        ...new Set(theaterSchedules.map((schedule) => schedule.movienm)),
      ];

      const theaterMovies = allMovies.filter((movie) =>
        scheduledMovieNames.includes(movie.movienm)
      );

      setMovies(theaterMovies);

      // 영화 개수를 부모 컴포넌트에 전달
      if (onMovieCountChange) {
        onMovieCountChange(theaterMovies.length);
      }
    } catch (error) {
      
      setMovies([]);
      if (onMovieCountChange) {
        onMovieCountChange(0);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="thm-theater-movies">
        <h5>상영 영화</h5>
        <div className="thm-movies-loading">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="thm-theater-movies">
      <div className="thm-movies-list">
        {movies.length === 0 ? (
          <ul>
            <li>상영중인 영화가 없습니다.</li>
          </ul>
        ) : (
          <ul>
            {movies.map((movie, index) => (
              <li key={movie.moviecd} className="thm-movie-list-item">
                <div className="thm-movie-list-info">
                  <div className="thm-movie-poster-inline">
                    <img
                      src={movie.posterurl || "/images/movie.jpg"}
                      alt={`${movie.movienm} 포스터`}
                      onError={(e) => {
                        e.target.src = "/images/movie.jpg";
                      }}
                    />
                  </div>
                  <div className="thm-movie-details-inline">
                    <strong>{movie.movienm}</strong> | {movie.genre} |{" "}
                    {movie.runningtime}분 |
                    {movie.isadult === "Y" ? " 청소년관람불가" : " 전체관람가"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TheaterMovieList;

