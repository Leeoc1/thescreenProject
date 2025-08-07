import React from "react";
import { getRating } from "../../../../../utils/data/MovieInfo";

const AvailableMoviesList = ({ movieList, selectedMovies, onMovieSelect }) => (
  <div className="mrm-movie-list">
    {movieList.map((movie) => {
      const isSelected = selectedMovies.some(
        (m) => m.moviecd === movie.moviecd
      );
      return (
        <div
          key={movie.moviecd}
          className={`mrm-movie-item ${isSelected ? "selected" : ""} clickable`}
          onClick={() => onMovieSelect(movie)}
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
              </div>
            </div>
          </div>
          <div className="mrm-selection-indicator">
            {isSelected ? "✓ 선택됨" : "클릭하여 선택"}
          </div>
        </div>
      );
    })}
  </div>
);

export default AvailableMoviesList;

