import Header from "../../../shared/Header";
import "../styles/TheaterBox.css";
import RegionTheaterSection from "./RegionTheaterSection";
import TheaterFilter from "./TheaterFilter";
import { useState, useEffect } from "react";
import { getCinemas } from "../../../api/cinemaApi";

const TheaterBox = () => {
  const [selectedRegion, setSelectedRegion] = useState("00");
  const [cinemas, setCinemas] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색 박스 상태 실시간 관리

  useEffect(() => {
    const fetchCinemas = async () => {
      const data = await getCinemas();
      // 'CGV 이름'과 'CGV이름'을 동일하게 취급하여 정렬
      const normalizeCGV = (name) => name.replace(/^CGV\s*/, "CGV");
      // 이름을 정규화하여 비교 후 정렬
      const sorted = data.slice().sort((a, b) => {
        const nameA = normalizeCGV(a.cinemanm);
        const nameB = normalizeCGV(b.cinemanm);
        return nameA.localeCompare(nameB, "ko");
      });
      setCinemas(sorted);
    };
    fetchCinemas();
  }, []);

  const getMoviesByTab = () => {
    // 검색어가 있을 경우, 공백 제거 후 부분 일치로 필터링
    const filterByKeyword = (cinemas) => {
      if (!searchKeyword.trim()) return cinemas;
      const keyword = searchKeyword.replace(/\s/g, "").toLowerCase();
      return cinemas.filter((cinema) => {
        const address = (cinema.address || "").toLowerCase();
        return address.includes(keyword);
      });
    };

    // 즐겨찾기는 RegionTheaterSection에서 처리하므로 전체 영화관 목록 반환
    if (selectedRegion === "favorite") {
      return filterByKeyword(cinemas);
    }

    const filteredCinemas =
      selectedRegion === "00"
        ? cinemas
        : cinemas.filter((cinema) => cinema.regioncd === selectedRegion);

    return filterByKeyword(filteredCinemas);
  };

  return (
    <div className="rts-page">
      <Header isOtherPage={true} isScrolled={true} />
      <div className="rts-content">
        <div className="rts-main">
          <div className="rts-container">
            <TheaterFilter
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
            {/* 검색박스: 오른쪽 상단에 배치 */}
            <div className="mvs-searchbox-wrap">
              <div className="mvs-searchbox-container">
                <input
                  type="text"
                  placeholder="극장 검색"
                  className="mvs-searchbox-input"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <span className="mvs-searchbox-icon">
                  {/* SVG 돋보기 아이콘 */}
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
            <RegionTheaterSection
              getMoviesByTab={getMoviesByTab}
              selectedRegion={selectedRegion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterBox;

