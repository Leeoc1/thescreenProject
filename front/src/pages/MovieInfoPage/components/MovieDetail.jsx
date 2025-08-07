import { useEffect, useState } from "react";
import "../styles/MovieDetail.css";
import Header from "../../../shared/Header";
import { useSearchParams } from "react-router-dom";
import {
  getMovieDetail,
  getWishlistStatus,
  toggleWishlist,
} from "../../../api/movieApi";
import { getCurrentUserId } from "../../../utils/tokenUtils";
import { useNavigate } from "react-router-dom";
import LoginRequiredModal from "../../LoginPage/components/LoginRequiredModal";

export default function MovieDetail() {
  const navigate = useNavigate();
  // 영화 번호 가져오기
  const [searchParams] = useSearchParams();
  const movieno = searchParams.get("movieno");
  const [movie, setMovie] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 찜 관련 상태
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (movieno) {
        const data = await getMovieDetail(movieno);
        setMovie(data);
        // 영화 정보를 받아온 후 찜 상태도 조회
        const userid = localStorage.getItem("userid");
        if (userid && data.moviecd) {
          try {
            // 토큰에서 실제 userid 추출
            const userid = await getCurrentUserId();
            const wishlistData = await getWishlistStatus(userid, data.moviecd);
            setWishlistCount(wishlistData.count);
            setIsWished(wishlistData.wished);
          } catch (error) {}
        }
      }
    };

    fetchMovieDetail();
  }, [movieno]);

  const handleReservationClick = () => {
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

  // 찜 버튼 클릭 핸들러
  const handleWishlistClick = async () => {
    // 로그인 상태 체크
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    // 토큰에서 실제 userid 추출
    const userid = await getCurrentUserId();

    if (!userid) {
      setShowLoginModal(true);
      return;
    }
    try {
      // 찜 상태 토글 API 호출
      const result = await toggleWishlist(userid, movie.moviecd);
      // 상태 업데이트
      setIsWished(result.wished);
      setWishlistCount(result.count);
    } catch (error) {}
  };

  return (
    <div>
      <Header />
      {movie && (
        <div className="mvd-movie-detail-page">
          {/* Movie Detail Section */}
          <section className="mvd-movie-detail-section">
            <div className="mvd-container">
              <div className="mvd-movie-content">
                {/* Movie Poster */}
                <div className="mvd-movie-poster">
                  <img src={movie.posterurl} alt={movie.movienm} />
                </div>

                {/* Movie Info */}
                <div className="mvd-movie-info">
                  <h1 className="mvd-movie-title">{movie.movienm}</h1>

                  <div className="mvd-movie-meta">
                    <div className="mvd-meta-item">
                      <span className="mvd-meta-label">개봉일</span>
                      <span className="mvd-meta-value">
                        {movie.releasedate}
                      </span>
                    </div>
                    <div className="mvd-meta-item">
                      <span className="mvd-meta-label">관람등급</span>
                      <span className="mvd-meta-value">
                        {movie.isadult === "Y"
                          ? "청소년 관람불가"
                          : "전체 관람가"}
                      </span>
                    </div>
                    <div className="mvd-meta-item">
                      <span className="mvd-meta-label">상영시간</span>
                      <span className="mvd-meta-value">
                        {movie.runningtime}분
                      </span>
                    </div>
                  </div>

                  <div className="mvd-movie-details">
                    <div className="mvd-detail-row">
                      <span className="mvd-detail-label">장르</span>
                      <span className="mvd-detail-value">{movie.genre}</span>
                    </div>
                    <div className="mvd-detail-row">
                      <span className="mvd-detail-label">감독</span>
                      <span className="mvd-detail-value">{movie.director}</span>
                    </div>
                    <div className="mvd-detail-row">
                      <span className="mvd-detail-label">출연</span>
                      <span className="mvd-detail-value">{movie.actors}</span>
                    </div>
                  </div>

                  <div className="mvd-movie-booking-info">
                    <div className="mvd-booking-info-item">
                      <span className="mvd-booking-info-label">예매율</span>
                      <span className="mvd-booking-info-value">
                        {movie.movierank
                          ? `${movie.movierank}위`
                          : "순위 정보 없음"}
                      </span>
                    </div>
                    <div className="mvd-booking-info-item">
                      <span className="mvd-booking-info-label">누적관객수</span>
                      <span className="mvd-booking-info-value">
                        {movie.audiacc
                          ? movie.audiacc.toLocaleString() + "명"
                          : "정보 없음"}
                      </span>
                    </div>
                  </div>

                  {/* 찜 버튼과 예매 버튼 */}
                  <div className="mvd-wishlist-section">
                    <div className="mvd-wishlist-container">
                      <button
                        className={`mvd-wishlist-heart-button ${
                          isWished ? "wished" : ""
                        }`}
                        onClick={handleWishlistClick}
                      >
                        {isWished ? "♥" : "♡"}
                      </button>
                      <span className="mvd-wishlist-count">
                        {wishlistCount}
                      </span>
                    </div>

                    <button
                      className="mvd-booking-button"
                      onClick={handleReservationClick}
                    >
                      예매하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Synopsis Section */}
          <section className="mvd-synopsis-section">
            <div className="mvd-container">
              <h2 className="mvd-synopsis-title">줄거리</h2>
              <div className="mvd-synopsis-content">
                <p>{movie.description}</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
