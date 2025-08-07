import React, { useState, useEffect } from "react";
import {
  getSchedules,
  getRegions,
  getCinemas,
  getmycinema,
} from "../../../../../api/cinemaApi";
import { getCurrentUserId } from "../../../../../utils/tokenUtils";
import ScreenSelectorMovie from "./ScreenSelectorMovie";

const TheaterSelector = () => {
  const [availableRegions, setAvailableRegions] = useState([]);
  const [regionsData, setRegionsData] = useState([]); // 전체 regions 데이터 저장
  const [selectedRegion, setSelectedRegion] = useState("즐겨찾는 극장"); // 기본값을 즐겨찾기로 설정
  const [availableTheaters, setAvailableTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(false);

  useEffect(() => {
    fetchAllRegions();
    // 페이지 로드 시 즐겨찾기 극장 자동 로드
    loadFavoriteTheaters();
  }, []);

  // 즐겨찾기 극장 로드 함수
  const loadFavoriteTheaters = async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      return; // 로그인하지 않은 경우 아무것도 하지 않음
    }

    try {
      const userid = await getCurrentUserId();
      const favoriteTheaters = await getmycinema(userid);
      const favoriteCinemaCds = favoriteTheaters.map((item) => item.cinemacd);

      // 전체 영화관 목록에서 즐겨찾기 영화관만 가져오기
      const allCinemas = await getCinemas();
      const favoriteTheaterNames = allCinemas
        .filter((cinema) => favoriteCinemaCds.includes(cinema.cinemacd))
        .map((cinema) => cinema.cinemanm);

      setAvailableTheaters(favoriteTheaterNames);
    } catch (error) {}
  };

  // 세션 스토리지 변경 이벤트 감지
  useEffect(() => {
    const handleSessionStorageChange = (event) => {
      if (event.detail.selectedFullDate) {
        // 날짜가 변경되면 지역을 즐겨찾기로 리셋하고 상영관 선택 초기화
        setSelectedRegion("즐겨찾는 극장");
        setSelectedTheater(null);
        // 즐겨찾기 극장 다시 로드
        loadFavoriteTheaters();
      }
    };

    window.addEventListener("sessionStorageChange", handleSessionStorageChange);

    return () => {
      window.removeEventListener(
        "sessionStorageChange",
        handleSessionStorageChange
      );
    };
  }, []);

  const fetchAllRegions = async () => {
    try {
      const regions = await getRegions();
      // 디버깅용
      // 첫 번째 객체의 구조 확인
      // 객체의 키들 확인

      // regions가 배열인지 확인하고, 적절한 속성 추출
      if (Array.isArray(regions)) {
        setRegionsData(regions); // 전체 데이터 저장
        const regionNames = regions.map(
          (region) =>
            region.regionnm || region.regionNm || region.name || region
        );
        // 디버깅용

        // "즐겨찾는 극장"을 맨 위에 추가
        const regionsWithFavorite = ["즐겨찾는 극장", ...regionNames];
        setAvailableRegions(regionsWithFavorite);
      } else {
        setAvailableRegions(["즐겨찾는 극장"]);
      }
    } catch (error) {
      setAvailableRegions(["즐겨찾는 극장"]);
    }
  };

  const handleRegionClick = async (region) => {
    setSelectedRegion(region);
    setIsLoadingTheaters(true);

    // 지역 변경 시 상영관 선택 상태 초기화
    setSelectedTheater(null);

    // 지역 변경 시 cinemanm과 selectedMovieTime 초기화
    sessionStorage.removeItem("cinemanm");
    sessionStorage.removeItem("selectedMovieTime");

    // 초기화 이벤트 발생
    window.dispatchEvent(new CustomEvent("selectedMovieTimeCleared"));

    const selectedDate = sessionStorage.getItem("selectedFullDate");
    const movienm = sessionStorage.getItem("movienm");

    // 디버깅용: 데이터가 없으면 테스트용 데이터 설정
    if (!selectedDate) {
      const today = new Date().toISOString().split("T")[0];
      sessionStorage.setItem("selectedFullDate", today);
    }

    if (!movienm) {
      sessionStorage.setItem("movienm", "좀비딸");
    }

    // 업데이트된 값들 다시 가져오기
    const updatedDate = sessionStorage.getItem("selectedFullDate");
    const updatedMovienm = sessionStorage.getItem("movienm");

    if (!updatedDate || !updatedMovienm) {
      setAvailableTheaters([]);
      setIsLoadingTheaters(false);
      return;
    }

    try {
      // "즐겨찾는 극장" 처리
      if (region === "즐겨찾는 극장") {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (!isLoggedIn) {
          alert("로그인이 필요합니다.");
          setAvailableTheaters([]);
          setIsLoadingTheaters(false);
          return;
        }

        const userid = await getCurrentUserId();

        const favoriteTheaters = await getmycinema(userid);

        const favoriteCinemaCds = favoriteTheaters.map((item) => item.cinemacd);

        // 전체 영화관 목록에서 즐겨찾기 영화관만 가져오기
        const allCinemas = await getCinemas();
        const favoriteTheaterNames = allCinemas
          .filter((cinema) => favoriteCinemaCds.includes(cinema.cinemacd))
          .map((cinema) => cinema.cinemanm);

        setAvailableTheaters(favoriteTheaterNames);
        setIsLoadingTheaters(false);
        return;
      }

      // 일반 지역 처리
      const schedules = await getSchedules();

      const filteredSchedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.startdate);
        const selectedDateObj = new Date(updatedDate);

        const movieMatch = schedule.movienm === updatedMovienm;
        const dateMatch =
          scheduleDate.toDateString() === selectedDateObj.toDateString();
        const regionMatch = schedule.regionnm === region;
        const statusMatch = schedule.screenstatus === "사용중";

        return movieMatch && dateMatch && regionMatch && statusMatch;
      });

      const theaters = [
        ...new Set(filteredSchedules.map((schedule) => schedule.cinemanm)),
      ];

      setAvailableTheaters(theaters);
    } catch (error) {
      setAvailableTheaters([]);
    } finally {
      setIsLoadingTheaters(false);
    }
  };
  const handleTheaterClick = (theater) => {
    setSelectedTheater(theater);

    // 상영관 변경 시 selectedMovieTime 초기화
    sessionStorage.removeItem("selectedMovieTime");

    // 초기화 이벤트 발생
    window.dispatchEvent(new CustomEvent("selectedMovieTimeCleared"));

    sessionStorage.setItem("cinemanm", theater);

    // 세션 스토리지 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent("sessionStorageChange", {
        detail: {
          cinemanm: theater,
        },
      })
    );
  };

  return (
    <div className="selector-container">
      <div className="region-section">
        <h3>지역</h3>
        <div className="region-list">
          {availableRegions.map((region, index) => (
            <div
              key={index}
              className={`region-item ${
                selectedRegion === region ? "active" : ""
              }`}
              onClick={() => handleRegionClick(region)}
            >
              {region}
            </div>
          ))}
        </div>
      </div>

      {selectedRegion && (
        <div className="theater-section">
          <h3>상영관</h3>
          {availableTheaters.length > 0 ? (
            <div className="theater-list">
              {availableTheaters.map((theater, index) => (
                <div
                  key={index}
                  className={`theater-item ${
                    selectedTheater === theater ? "active" : ""
                  }`}
                  onClick={() => handleTheaterClick(theater)}
                >
                  {theater}
                </div>
              ))}
            </div>
          ) : !isLoadingTheaters ? (
            <div>선택한 조건에 맞는 상영관이 없습니다.</div>
          ) : null}
        </div>
      )}

      {selectedTheater && (
        <div className="screen-section">
          <h3>상영시간</h3>
          <ScreenSelectorMovie />
        </div>
      )}
    </div>
  );
};

export default TheaterSelector;
