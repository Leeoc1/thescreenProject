import React, { useState } from "react";
import ScreenList from "./ScreenList";
import TheaterMovieList from "./TheaterMovieList";

const TheaterDetail = ({
  cinema,
  screenList,
  onStatusClick,
  getStatusClass,
}) => {
  const [movieCount, setMovieCount] = useState(0);

  const handleMovieCountChange = (count) => {
    setMovieCount(count);
  };

  return (
    <div className="thm-theater-detail-dropdown">
      {/* 지점명, 주소 */}
      <div className="thm-theater-detail-header">
        <h4>{cinema?.cinemanm}</h4>
        <p>{cinema?.address}</p>
      </div>
      {/* 상영관과 영화 목록을 나란히 배치 */}
      <div className="thm-theater-detail-content">
        {/* 왼쪽: 상영관 리스트 */}
        <div className="thm-theater-detail-section">
          <h5>상영관 목록</h5>
          <ScreenList
            screenList={screenList}
            onStatusClick={onStatusClick}
            getStatusClass={getStatusClass}
          />
        </div>
        {/* 가운데 구분선 */}
        <div className="thm-theater-detail-divider"></div>
        {/* 오른쪽: 상영 영화 리스트 */}
        <div className="thm-theater-detail-section">
          <h5>상영 영화 ({movieCount}편)</h5>
          <TheaterMovieList
            cinemacd={cinema?.cinemacd}
            cinemanm={cinema?.cinemanm}
            theater={cinema}
            onMovieCountChange={handleMovieCountChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TheaterDetail;

