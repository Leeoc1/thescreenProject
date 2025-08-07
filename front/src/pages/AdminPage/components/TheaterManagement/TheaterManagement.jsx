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

  return (
    <div className="adp-content">
      <div className="adp-header">
        <h2>극장 관리</h2>
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
