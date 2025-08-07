import { useState, useRef, useEffect } from "react";
import ArrowLeft from "../../../images/arrow-left.svg";
import ArrowRight from "../../../images/arrow-right.svg";
import { useNavigate } from "react-router-dom";
import { getTopTenMovies } from "../../../api/movieApi";
import "../styles/MovieChart.css";
import LoginRequiredModal from "../../LoginPage/components/LoginRequiredModal";

const MovieChart = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movies, setMovies] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const sliderRef = useRef(null);
  const cardWidth = 180; // 카드 1장 width(px)
  const gap = 20; // 카드 사이 gap(px)
  const visibleCards = 5;

  // API에서 영화 데이터 가져오기
  useEffect(() => {
    const fetchMovies = async () => {
      const top10Movies = await getTopTenMovies();
      // movierank 오름차순 정렬
      const sorted = [...top10Movies].sort(
        (a, b) => Number(a.movierank) - Number(b.movierank)
      );
      setMovies(sorted);
    };
    fetchMovies();
  }, []);

  const totalCards = movies.length;
  const maxIndex = Math.ceil(totalCards / visibleCards) - 1;

  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const navigate = useNavigate();

  const updateSlider = () => {
    if (sliderRef.current) {
      const totalWidth = totalCards * cardWidth + (totalCards - 1) * gap;
      const maxTranslateX = Math.max(0, totalWidth - 980);
      let translateX = currentIndex * visibleCards * (cardWidth + gap);
      if (translateX > maxTranslateX) translateX = maxTranslateX;
      sliderRef.current.style.transform = `translateX(-${translateX}px)`;
    }
  };

  useEffect(() => {
    updateSlider();
  }, [currentIndex]);

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    const endX = e.clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < maxIndex) {
        nextSlide();
      } else if (diffX < 0 && currentIndex > 0) {
        prevSlide();
      }
    }
    setIsDragging(false);
  };

  // 상세정보 페이지로 이동
  const handleMovieDetailClick = (movie, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    navigate(`/moviedetail?movieno=${movie.moviecd}`);
  };

  // 예매하기 버튼 클릭
  const handleReservationClick = (movie, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // 영화 정보를 세션 스토리지에 저장
    sessionStorage.setItem("moviecd", movie.moviecd);
    sessionStorage.setItem("movienm", movie.movienm);

    const movieData = {
      moviecd: movie.moviecd,
      movienm: movie.movienm,
      posterurl: movie.posterurl,
      genre: movie.genre,
      runningtime: movie.runningtime,
      isadult: movie.isadult,
    };
    sessionStorage.setItem("selectedMovie", JSON.stringify(movieData));

    navigate(`/reservation/movie/${movie.moviecd}`);
  };

  return (
    <section className="mcs-section">
      <div className="mcs-container">
        <div className="mcs-header">
          <h2 className="mcs-title">박스오피스 TOP 10</h2>
          <p className="mcs-subtitle">
            현재 가장 인기 있는 영화들을 만나보세요
          </p>
        </div>
        <div className="mcs-slider-wrapper">
          <button
            onClick={prevSlide}
            className="mcs-slider-nav-arrow mcs-slider-nav-prev"
            aria-label="이전"
          >
            <img src={ArrowLeft} alt="이전" className="mcs-slider-nav-img" />
          </button>
          <div className="mcs-slider-container">
            <div
              ref={sliderRef}
              className="mcs-slider"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {movies.map((movie) => (
                <div key={movie.moviecd} className="mcs-movie-card">
                  <div className="mcs-poster-container">
                    <img
                      src={movie.posterurl}
                      alt={movie.movienm}
                      className="mcs-movie-poster"
                    />
                    <div className="mcs-overlay">
                      <div className="mcs-buttons">
                        <button
                          className="mcs-btn"
                          onClick={(e) => handleMovieDetailClick(movie, e)}
                        >
                          상세정보
                        </button>
                        <button
                          className="mcs-btn"
                          onClick={(e) => handleReservationClick(movie, e)}
                        >
                          예매하기
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mcs-movie-info">
                    <h3 className="mcs-movie-title">{movie.movienm}</h3>
                    <p className="mcs-movie-genre">{movie.genre}</p>
                    <div className="mcs-movie-meta">
                      <div className="mcs-movie-rating">
                        <span
                          className={`mcs-age-icon ${
                            movie.isadult === "Y" ? "mcs-age-19" : "mcs-age-all"
                          }`}
                        >
                          {movie.isadult === "Y" ? "19" : "ALL"}
                        </span>
                        <span className="mcs-movie-rating-text">
                          {movie.isadult === "Y"
                            ? "청소년 관람불가"
                            : "전체관람가"}
                        </span>
                      </div>
                      <span className="mcs-movie-rank">{movie.movierank}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="mcs-slider-nav-arrow mcs-slider-nav-next"
            aria-label="다음"
          >
            <img src={ArrowRight} alt="다음" className="mcs-slider-nav-img" />
          </button>
        </div>
      </div>
      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default MovieChart;

