import React from "react";
import { useNavigate } from "react-router-dom";
import { toggleWishlist } from "../../../api/movieApi";
import { getCurrentUserId } from "../../../utils/tokenUtils";
import "../styles/MyPageLike.css";
import "../styles/MyPageMain.css"; // section 스타일
import "../styles/MyPageMain.css"; // section 스타일

const MyPageLike = ({ loading, wishlist, setWishlist }) => {
  const navigate = useNavigate();

  // 찜 해제 핸들러
  const handleRemoveFromWishlist = async (moviecd) => {
    try {
      const userid = localStorage.getItem("userid");
      if (userid) {
        // 토큰에서 실제 userid 추출
        const userid = await getCurrentUserId();

        await toggleWishlist(userid, moviecd);
        // 찜 목록에서 해당 영화 제거
        setWishlist((prev) => prev.filter((wish) => wish.moviecd !== moviecd));
      }
    } catch (error) {}
  };

  // 예매하기 핸들러
  const handleReservationFromWishlist = (movie) => {
    // 세션 스토리지에 영화 정보 저장
    sessionStorage.setItem("moviecd", movie.moviecd);
    sessionStorage.setItem("movienm", movie.movienm);

    const movieData = {
      moviecd: movie.moviecd,
      movienm: movie.movienm,
      posterurl: movie.posterurl,
    };
    sessionStorage.setItem("selectedMovie", JSON.stringify(movieData));

    // 예매 페이지로 이동
    navigate("/reservation/movie/${movie.moviecd}");
  };

  return (
    <section className="mp-section">
      <div className="mp-section-header">
        <h2 className="mp-section-title">내가 찜한 영화</h2>
      </div>
      <div className="mp-movie-list">
        {loading ? (
          <div className="mp-loading">찜한 영화를 불러오는 중...</div>
        ) : wishlist.length > 0 ? (
          wishlist.map((wish, idx) => (
            <div key={wish.moviecd || idx} className="mp-movie-item">
              <div className="mp-movie-poster-small">
                {wish.posterurl ? (
                  <img
                    src={wish.posterurl}
                    alt={wish.movienm}
                    style={{
                      width: "60px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <span className="mp-poster-text-small">No Image</span>
                )}
              </div>
              <div className="mp-movie-info">
                <div className="mp-movie-main-info">
                  <h3 className="mp-movie-title">{wish.movienm}</h3>
                  <div className="mp-movie-actions">
                    <button
                      className="mp-btn mp-btn-reservation"
                      onClick={() => handleReservationFromWishlist(wish)}
                    >
                      예매하기
                    </button>
                    <button
                      className="mp-btn mp-btn-remove-wishlist"
                      onClick={() => handleRemoveFromWishlist(wish.moviecd)}
                    >
                      찜 해제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="mp-no-reservations">
            <p>찜한 영화가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPageLike;
