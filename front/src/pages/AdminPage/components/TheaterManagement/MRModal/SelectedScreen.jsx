import React, { useEffect, useState } from "react";
import "../style/modal.css";
import "../style/SelectedScreen.css";
import "../../../../../api/api";
import "../../../../../api/cinemaApi";
import { getScreenView } from "../../../../../api/api";
import { registerMovie } from "../../../../../api/cinemaApi";

const SelectedScreen = ({
  movies,
  theater,
  onClose,
  onCloseParent,
  existingSchedules = [],
}) => {
  const [screenList, setScreenList] = useState([]);
  const [selectedScreens, setSelectedScreens] = useState([]);

  useEffect(() => {
    const fetchScreenView = async () => {
      try {
        const screens = await getScreenView();
        setScreenList(
          screens.filter((screen) => screen.cinemacd === theater.cinemacd)
        );
      } catch (error) {
        
      }
    };

    fetchScreenView();
  }, []);

  const handleScreenSelect = (screen) => {
    // 이미 상영중인 상영관인지 확인
    const isExistingScreen = existingSchedules.some(
      (schedule) => schedule.screenname === screen.screenname
    );
    if (isExistingScreen) {
      return; // 이미 상영중인 상영관은 선택 불가
    }

    setSelectedScreens((prev) => {
      const isSelected = prev.some((s) => s.screencd === screen.screencd);
      if (isSelected) {
        // 이미 선택된 경우 제거
        return prev.filter((s) => s.screencd !== screen.screencd);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, screen];
      }
    });
  };

  const handleRegister = async () => {
    if (selectedScreens.length === 0) {
      alert("상영관을 선택해주세요.");
      return;
    }

    const screencds = selectedScreens.map((screen) => screen.screencd);
    let successCount = 0;
    let failureMessages = [];

    // 선택된 모든 영화에 대해 스케줄 등록
    for (const movie of movies) {
      try {
        const result = await registerMovie(movie.moviecd, screencds);
        successCount++;

      } catch (error) {
        failureMessages.push(`${movie.movienm}: ${error.message}`);
      }
    }

    // 결과 메시지 표시
    if (successCount === movies.length) {
      alert(`모든 영화(${successCount}개) 등록이 완료되었습니다.`);
    } else if (successCount > 0) {
      alert(
        `${successCount}개 영화 등록 성공, ${
          failureMessages.length
        }개 실패\n실패: ${failureMessages.join(", ")}`
      );
    } else {
      alert(`모든 영화 등록에 실패했습니다.\n${failureMessages.join(", ")}`);
    }

    // 모든 모달 닫기
    if (onCloseParent) {
      onCloseParent(); // 부모 모달까지 모두 닫기
    } else {
      onClose(); // 현재 모달만 닫기
    }
  };

  const isScreenSelected = (screencd) => {
    return selectedScreens.some((screen) => screen.screencd === screencd);
  };

  const isExistingScreen = (screenname) => {
    return existingSchedules.some(
      (schedule) => schedule.screenname === screenname
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ss-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>선택한 영화들 등록 ({movies.length}개)</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ss-modal-body">
          <div className="ss-selected-movies">
            <p>
              <strong>선택된 영화:</strong>{" "}
              {movies.map((movie) => movie.movienm).join(", ")}
            </p>
          </div>

          {existingSchedules.length > 0 && (
            <div className="ss-existing-schedules">
              <p>
                <strong>현재 상영중인 상영관:</strong>{" "}
                {[...new Set(existingSchedules.map((s) => s.screenname))].join(
                  ", "
                )}
              </p>
            </div>
          )}

          <p>
            <strong>상영관:</strong> {theater.cinemanm}
          </p>

          <div className="ss-grid">
            {screenList.map((screen) => {
              const isExisting = isExistingScreen(screen.screenname);
              return (
                <div
                  key={screen.screencd}
                  className={`ss-grid-card ${
                    isScreenSelected(screen.screencd) ? "active" : ""
                  } ${isExisting ? "disabled" : ""}`}
                  onClick={() => handleScreenSelect(screen)}
                  style={{
                    opacity: isExisting ? 0.5 : 1,
                    cursor: isExisting ? "not-allowed" : "pointer",
                  }}
                >
                  <p>{screen.screenname}</p>
                  {isExisting && <small>상영중</small>}
                </div>
              );
            })}
          </div>

          <div className="ss-button-group">
            <button className="ss-btn-cancel" onClick={onClose}>
              닫기
            </button>
            <button className="ss-btn-register" onClick={handleRegister}>
              등록 ({selectedScreens.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedScreen;

