import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentMovies,
  getMoviesForAdmin,
  getTopTenMovies,
} from "../../../api/movieApi";
import LoginRequiredModal from "../../LoginPage/components/LoginRequiredModal";
import "../styles/Movies.css";

const Movies = ({ activeTab: parentActiveTab, showDetailButton = true }) => {
  const [activeTab, setActiveTab] = useState(parentActiveTab || "boxoffice");
  const [currentMovies, setCurrentMovies] = useState([]);
  const [upcomingMoviesData, setUpcomingMoviesData] = useState([]);
  const [topTenMovies, setTopTenMovies] = useState([]); // 박스오피스 TOP 10 추가
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(16);
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색 박스 상태 실시간 관리

  // 부모에서 전달받은 activeTab이 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    if (parentActiveTab) {
      setActiveTab(parentActiveTab);
    }
  }, [parentActiveTab]);

  const handleReservationClick = (movie) => {
    // 로그인 상태 체크
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      // 로그인되지 않은 경우 모달 표시
      setShowLoginModal(true);
      return;
    }

    // 로그인된 경우 기존 로직 실행
    // 홈페이지와 동일한 방식으로 영화 정보를 세션 스토리지에 저장
    sessionStorage.setItem("moviecd", movie.moviecd);
    sessionStorage.setItem("movienm", movie.movienm);

    // 예매 페이지와 동일한 방식으로 전체 영화 객체도 저장
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // 병렬로 API 호출하여 로딩 시간 단축
        const [currentData, adminData, topTen] = await Promise.all([
          getCurrentMovies(),
          getMoviesForAdmin(),
          getTopTenMovies(),
        ]);

        // 간단한 정렬만 적용
        setTopTenMovies(
          topTen.sort((a, b) => Number(a.movierank) - Number(b.movierank))
        );
        setCurrentMovies(
          currentData.sort(
            (a, b) => new Date(b.releasedate) - new Date(a.releasedate)
          )
        );

        const upcomingData = adminData.currentMovies.filter(
          (movie) => movie.movieinfo === "E"
        );
        setUpcomingMoviesData(
          upcomingData.sort(
            (a, b) => new Date(a.releasedate) - new Date(b.releasedate)
          )
        );
      } catch (error) {
        
      }
    };
    fetchMovies();
  }, []);

  const goMovieDetail = (moviecd) => {
    navigate(`/moviedetail?movieno=${moviecd}`);
  };

  const handleShowMore = () => {
    setVisibleCount(currentMovies.length);
  };

  // 각 탭에 맞는 영화 목록을 반환하는 함수 (검색어 필터링 포함)
  const getMoviesByTab = () => {
    // 검색어가 있을 경우, 공백 제거 후 부분 일치로 필터링
    const filterByKeyword = (movies) => {
      if (!searchKeyword.trim()) return movies;
      const keyword = searchKeyword.replace(/\s/g, "").toLowerCase();
      return movies.filter((movie) => {
        const title = (movie.movienm || movie.title || "")
          .replace(/\s/g, "")
          .toLowerCase();
        return title.includes(keyword);
      });
    };

    switch (activeTab) {
      case "boxoffice": {
        const topTenMovieCodes = topTenMovies.map((movie) => movie.moviecd);
        const topTenFromCurrent = currentMovies.filter((movie) =>
          topTenMovieCodes.includes(movie.moviecd)
        );
        const otherMovies = currentMovies.filter(
          (movie) => !topTenMovieCodes.includes(movie.moviecd)
        );
        const sortedTopTen = topTenFromCurrent.sort((a, b) => {
          const rankA =
            topTenMovies.find((tm) => tm.moviecd === a.moviecd)?.movierank ||
            999;
          const rankB =
            topTenMovies.find((tm) => tm.moviecd === b.moviecd)?.movierank ||
            999;
          return Number(rankA) - Number(rankB);
        });
        return filterByKeyword([...sortedTopTen, ...otherMovies]).slice(
          0,
          visibleCount
        );
      }
      case "latest":
        return filterByKeyword(currentMovies).slice(0, visibleCount);
      case "upcoming":
        return filterByKeyword(upcomingMoviesData);
      default:
        return filterByKeyword(currentMovies.slice(0, visibleCount));
    }
  };

  return (
    <div className="mvs-section">
      {/* 검색박스: 오른쪽 상단에 배치 */}
      <div className="mvs-searchbox-wrap">
        <div className="mvs-searchbox-container">
          <input
            type="text"
            placeholder="영화 제목 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="mvs-searchbox-input"
          />
          <span className="mvs-searchbox-icon">
            <svg
              className="mvs-searchbox-svg"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9"
                cy="9"
                r="7"
                className="mvs-searchbox-svg-circle"
              />
              <line
                x1="15.2"
                y1="15.2"
                x2="18"
                y2="18"
                className="mvs-searchbox-svg-line"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="mvs-grid">
        {getMoviesByTab().map((movie) => (
          <div className="mvs-card" key={movie.moviecd}>
            <div className="mvs-poster">
              <img
                src={movie.posterurl || "/images/movie.jpg"}
                alt={movie.movienm || movie.title}
              />
              <div className="mvs-overlay">
                <div className="mvs-buttons">
                  {showDetailButton && (
                    <button
                      className="mvs-btn"
                      onClick={() => goMovieDetail(movie.moviecd)}
                    >
                      상세정보
                    </button>
                  )}
                  {activeTab !== "upcoming" && (
                    <button
                      className="mvs-btn"
                      onClick={() => handleReservationClick(movie)}
                    >
                      예매하기
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mvs-info">
              <h3 className="mvs-title">{movie.movienm || movie.title}</h3>
              <p className="mvs-genre">{movie.genre}</p>
              {activeTab === "latest" && (
                <p className="mvs-release-date">개봉일: {movie.releasedate}</p>
              )}
              {activeTab === "upcoming" ? (
                <p className="mvs-release-date">
                  개봉 예정일: {movie.releaseDate || movie.releasedate}
                </p>
              ) : (
                <>
                  <div className="mvs-rating">
                    <span
                      className={`mvs-age-icon ${
                        movie.isadult === "Y" ? "mvs-age-19" : "mvs-age-all"
                      }`}
                    >
                      {movie.isadult === "Y" ? "19" : "ALL"}
                    </span>
                    <span className="mvs-rating-text">
                      {movie.isadult === "Y" ? "청소년 관람불가" : "전체관람가"}
                    </span>
                  </div>
                  <p className="mvs-duration">{movie.runningtime}분</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      {activeTab === "boxoffice" && currentMovies.length > visibleCount && (
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
          <button className="mvs-showmore-btn" onClick={handleShowMore}>
            더보기
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;

