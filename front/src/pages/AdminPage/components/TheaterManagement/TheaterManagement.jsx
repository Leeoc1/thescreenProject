import React, { useEffect, useState } from "react";
import {
  getCinemas,
  getScreenView,
  updateScreenStatus,
} from "../../../../api/api";
import "../../styles/TheaterManagement.css";
import "../../styles/AdminPage.css";
import ScreenStatus from "./ScreenStatus";
import TheaterGrid from "./TheaterGrid";
import { scheduleData } from "../../../../api/cinemaApi";

const TheaterManagement = () => {
  const [cinemas, setCinemas] = useState([]);
  const [openDetailIdx, setOpenDetailIdx] = useState(null);
  const [screenList, setScreenList] = useState([]);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      const response = await getCinemas();
      setCinemas(response);
    };
    fetchCinemas();
  }, []);

  // 드롭다운이 열릴 때 해당 극장 상영관 정보 불러오기
  useEffect(() => {
    if (openDetailIdx !== null && cinemas[openDetailIdx]) {
      getScreenView().then((allScreens) => {
        const filtered = allScreens.filter(
          (screen) => screen.cinemacd === cinemas[openDetailIdx].cinemacd
        );
        setScreenList(filtered);
      });
    } else {
      setScreenList([]);
    }
  }, [openDetailIdx, cinemas]);

  const getStatusClass = (status) => {
    switch (status) {
      case "운영중":
        return "adp-active";
      case "점검중":
        return "adp-maintenance";
      case "비활성":
        return "adp-terminated";
      default:
        return "adp-pending";
    }
  };

  const handleStatusChange = async (screen, newStatus) => {
    try {
      const response = await updateScreenStatus({
        screencd: screen.screencd,
        screenstatus: newStatus,
      });

      if (response) {
        setScreenList((prevScreens) =>
          prevScreens.map((s) =>
            s.screencd === screen.screencd
              ? { ...s, screenstatus: newStatus }
              : s
          )
        );
      }
    } catch (error) {
      // 에러 처리 (알림 등)
    }

    setShowStatusPopup(false);
    setSelectedScreen(null);
  };

  const openStatusPopup = (screen) => {
    setSelectedScreen(screen);
    setShowStatusPopup(true);
  };

  const closeStatusPopup = () => {
    setShowStatusPopup(false);
    setSelectedScreen(null);
  };

  // 극장 수정 핸들러
  const handleEdit = (theater) => {
    // TODO: 극장 수정 모달 또는 페이지로 이동
  };

  // 극장 삭제 핸들러
  const handleDelete = (theater) => {
    if (window.confirm(`"${theater.cinemanm}"을 삭제하시겠습니까?`)) {
      // TODO: 극장 삭제 API 호출
    }
  };

  // 영화 데이터 가져오기 핸들러
  const handleFetchMovies = async () => {
    try {
      console.log("영화 데이터 가져오기 시작...");
      const response = await fetch(
        "http://localhost:8080/movies/fetch-movies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("영화 데이터 가져오기 결과:", result);

      if (result.success) {
        alert(`영화 데이터를 성공적으로 가져왔습니다: ${result.message}`);
      } else {
        alert(`영화 데이터 가져오기 실패: ${result.message}`);
      }
    } catch (error) {
      console.error("영화 데이터 가져오기 에러:", error);
      alert(`영화 데이터 가져오기 실패: ${error.message}`);
    }
  };

  // 극장 추가 핸들러
  const handleAddTheater = async () => {
    try {
      console.log("스케줄 자동 등록 시작...");
      const result = await scheduleData();
      console.log("스케줄 등록 결과:", result);

      // result가 배열인 경우 (에러 처리로 빈 배열이 반환됨)
      if (Array.isArray(result) && result.length === 0) {
        alert(
          "스케줄 등록에 실패했습니다. 서버에서 500 에러가 발생했습니다. 백엔드 콘솔을 확인해주세요."
        );
        return;
      }

      // result가 객체인 경우 (정상 응답)
      if (result && typeof result === "object" && result.success) {
        alert(`스케줄이 성공적으로 등록되었습니다: ${result.message}`);
      } else if (result && typeof result === "object" && !result.success) {
        alert(
          "스케줄 등록에 실패했습니다: " + (result.message || "알 수 없는 오류")
        );
      } else {
        alert("예상하지 못한 응답 형식입니다: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("스케줄 등록 에러:", error);
      alert("스케줄 등록에 실패했습니다: " + error.message);
    }
  };

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>극장 관리</h2>
        <div>
          <button className="adp-btn-primary" onClick={handleAddTheater}>
            스케줄 자동 등록
          </button>
        </div>
      </div>
      <TheaterGrid
        cinemas={cinemas}
        openDetailIdx={openDetailIdx}
        setOpenDetailIdx={setOpenDetailIdx}
        screenList={screenList}
        onStatusClick={openStatusPopup}
        getStatusClass={getStatusClass}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {showStatusPopup && selectedScreen && (
        <ScreenStatus
          screen={selectedScreen}
          onStatusChange={handleStatusChange}
          onClose={closeStatusPopup}
        />
      )}
    </div>
  );
};

export default TheaterManagement;
