import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginRequiredModal from "../../LoginPage/components/LoginRequiredModal";
import {
  getmycinema,
  updateMyCinema,
  deleteMyCinema,
} from "../../../api/cinemaApi";
import { getCurrentUserId } from "../../../utils/tokenUtils";

const RegionTheaterSection = ({ getMoviesByTab, selectedRegion }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [starFills, setStarFills] = useState({}); // 각 영화관의 별 색상 상태
  const [favoriteCinemas, setFavoriteCinemas] = useState([]); // 즐겨찾기 영화관 목록

  // 초기 즐겨찾기 상태 로드
  useEffect(() => {
    const fetchFavorites = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) return;

      // 토큰에서 실제 userid 추출
      const userid = await getCurrentUserId();

      if (!userid) {
        return;
      }

      try {
        const favorites = await getmycinema(userid);

        const starFillsData = favorites.reduce((acc, item) => {
          acc[item.cinemacd] = "#fbbf24"; // DB에 있으면 노란색
          return acc;
        }, {});

        setStarFills(starFillsData);
        setFavoriteCinemas(favorites); // 즐겨찾기 영화관 목록 저장
      } catch (error) {
        
      }
    };
    fetchFavorites();
  }, []);

  const handleScheduleClick = (cinema) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    sessionStorage.setItem("cinemacd", cinema.cinemacd);
    sessionStorage.setItem("cinemanm", cinema.cinemanm);
    navigate(`/reservation/theater/${cinema.cinemacd}`);
  };

  const handleMapClick = (cinema) => {
    const state = {
      cinemacd: cinema.cinemacd,
      cinemanm: cinema.cinemanm,
      address: cinema.address,
      tel: cinema.tel,
    };
    navigate("/theater", { state });
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleStarClick = async (cinema) => {
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

    const cinemacd = cinema.cinemacd;
    const isFavorite = starFills[cinemacd] === "#fbbf24";

    try {
      if (isFavorite) {
        // 별이 노란색 -> 검정색 (즐겨찾기 삭제)
        await deleteMyCinema(userid, cinemacd);
        setStarFills((prev) => ({
          ...prev,
          [cinemacd]: "currentColor",
        }));
        // 즐겨찾기 목록에서도 제거
        setFavoriteCinemas((prev) =>
          prev.filter((item) => item.cinemacd !== cinemacd)
        );
      } else {
        // 별이 검정색 -> 노란색 (즐겨찾기 추가)
        await updateMyCinema(userid, cinemacd);
        setStarFills((prev) => ({
          ...prev,
          [cinemacd]: "#fbbf24",
        }));
        // 즐겨찾기 목록에 추가
        setFavoriteCinemas((prev) => [...prev, { cinemacd, userid }]);
      }
    } catch (error) {
      
      alert("즐겨찾기 업데이트에 실패했습니다.");
    }
  };

  // 즐겨찾기 필터링 함수
  const getFilteredCinemas = () => {
    if (selectedRegion === "favorite") {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return []; // 로그인하지 않았으면 빈 배열 반환
      }

      const allCinemas = getMoviesByTab();

      const favoriteCinemaCds = favoriteCinemas.map((item) => item.cinemacd);

      const filteredResult = allCinemas.filter((cinema) =>
        favoriteCinemaCds.includes(cinema.cinemacd)
      );

      return filteredResult;
    }
    return getMoviesByTab();
  };

  return (
    <section className="rts-section">
      <div className="rts-grid">
        {selectedRegion === "favorite" &&
          localStorage.getItem("isLoggedIn") !== "true" && (
            <div className="rts-login-message">
              로그인 후 즐겨찾기 극장을 확인할 수 있습니다.
            </div>
          )}
        {getFilteredCinemas()
          .slice(0, visibleCount)
          .map((cinema) => (
            <div key={cinema.cinemacd} className="rts-card">
              <div className="rts-info">
                <div className="rts-header">
                  <h3 className="rts-name">{cinema.cinemanm}</h3>
                  <svg
                    className={`rts-star ${
                      starFills[cinema.cinemacd] === "#fbbf24" ? "active" : ""
                    }`}
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    onClick={() => handleStarClick(cinema)}
                  >
                    <path
                      d="M12 2 L15 9 L22 9 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9 L9 9 Z"
                      fill={starFills[cinema.cinemacd] || "currentColor"}
                    />
                  </svg>
                </div>
                <p className="rts-address">{cinema.address}</p>
                <p className="rts-phone">{cinema.tel}</p>
              </div>
              <div className="rts-actions">
                <button
                  className="rts-btn primary"
                  onClick={() => handleScheduleClick(cinema)}
                >
                  상영시간표
                </button>
                <button
                  className="rts-btn secondary"
                  onClick={() => handleMapClick(cinema)}
                >
                  길찾기
                </button>
              </div>
            </div>
          ))}
      </div>

      {getFilteredCinemas().length > visibleCount && (
        <div className="rts-showmore-wrap">
          <button className="mvs-showmore-btn" onClick={handleShowMore}>
            더보기
          </button>
        </div>
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default RegionTheaterSection;

