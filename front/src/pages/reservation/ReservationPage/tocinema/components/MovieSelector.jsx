import { useEffect, useState } from "react";
import { getSchedules } from "../../../../../api/cinemaApi";

const MovieSelector = () => {
  const [movieList, setMovieList] = useState({});
  const [selectedMovieName, setSelectedMovieName] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    sessionStorage.getItem("selectedFullDate") || "날짜를 선택하세요"
  );
  const selectedCinemanm = sessionStorage.getItem("cinemanm");

  useEffect(() => {
    const fetchMovies = async () => {
      const schedule = await getSchedules();

      // 선택된 날짜로 필터링
      const filtered = schedule.filter((schedule) => {
        const dateMatch = schedule.startdate === selectedDate;
        const cinemaMatch = schedule.cinemanm === selectedCinemanm;
        return dateMatch && cinemaMatch;
      });

      // movienm 기준으로 스케줄 그룹화
      const groupedMovies = filtered.reduce((acc, curr) => {
        const movieName = curr.movienm;
        if (!acc[movieName]) {
          acc[movieName] = [];
        }
        acc[movieName].push(curr);
        return acc;
      }, {});

      // 상영 시작 시간순으로 정렬 (선택사항)
      Object.keys(groupedMovies).forEach((movieName) => {
        groupedMovies[movieName].sort(
          (a, b) => new Date(a.starttime) - new Date(b.starttime)
        );
      });

      setMovieList(groupedMovies);
    };
    fetchMovies();

    // 마운트 시 sessionStorage 확인
    const savedDate = sessionStorage.getItem("selectedFullDate");
    if (savedDate && savedDate !== selectedDate) {
      setSelectedDate(savedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleSessionStorageChange = (event) => {
      setSelectedDate(event.detail.selectedFullDate || "날짜를 선택하세요");
      const newMovieName = event.detail.selectedMovieName;
      if (newMovieName) {
        setSelectedMovieName(newMovieName);
      } else if (sessionStorage.getItem("selectedMovieName") === null) {
        // 날짜가 바뀌어서 영화 이름이 초기화된 경우
        setSelectedMovieName(null);
      }
    };

    window.addEventListener("sessionStorageChange", handleSessionStorageChange);
    return () =>
      window.removeEventListener(
        "sessionStorageChange",
        handleSessionStorageChange
      );
  }, []);

  const handleMovieSelect = (movieName) => {
    setSelectedMovieName(movieName);
    sessionStorage.setItem("selectedMovieName", movieName);
    const event = new CustomEvent("sessionStorageChange", {
      detail: {
        selectedFullDate: sessionStorage.getItem("selectedFullDate"),
        selectedMovieName: movieName,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="rptm-movie-list p-4">
      {Object.keys(movieList).length === 0 ? (
        <p className="text-gray-500">해당 날짜에 상영 중인 영화가 없습니다.</p>
      ) : (
        <div>
          {Object.keys(movieList).map((movieName) => (
            <button
              key={movieName}
              className={`rptm-movie-btn ${
                selectedMovieName === movieName ? "rptm-active" : ""
              }`}
              onClick={() => handleMovieSelect(movieName)}
            >
              {movieName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieSelector;

