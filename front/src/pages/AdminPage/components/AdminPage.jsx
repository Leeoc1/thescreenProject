import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SalesOverview from "./adminmain/SalesOverview";
import StaffManagement from "./StaffManagement/StaffManagement";
import UserManagement from "./UserManagement";
import MovieManagement from "./MovieManagement";
import ReservationManagement from "./ReservationManagement";
import Inquiries from "./Inquiries";
import EventManagement from "./EventManagement";
import AdminSidebar from "./AdminSideBar";
import AdminHeader from "./AdminHeader";
import TheaterManagement from "./TheaterManagement/TheaterManagement";
import { NotificationProvider } from "../utils/NotificationContext";
import { getAdminToken, decodeUserid } from "../../../api/adminApi";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const navigate = useNavigate();
  const location = useLocation();

  // 관리자 토큰 발급
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // localStorage에서 userid와 관리자 로그인 여부 확인
        const storedUserid = localStorage.getItem("userid");
        const isAdminLogin = localStorage.getItem("isAdminLogin") === "true";

        if (!storedUserid) {
          
          alert("로그인이 필요합니다.");
          navigate("/");
          return;
        }

        let realUserid;

        if (isAdminLogin) {
          // 관리자 로그인인 경우 - 평문 userid 사용
          realUserid = storedUserid;
        } else {
          // 일반 사용자 로그인인 경우 - 암호화된 userid 디코딩
          realUserid = await decodeUserid(storedUserid);
        }

        // 실제 userid로 관리자 토큰 발급

        const token = await getAdminToken(realUserid);
        localStorage.setItem("adminToken", token);
      } catch (e) {
        
        
        alert(`관리자 인증 토큰 발급 실패: ${e.message}`);
        navigate("/");
      }
    };

    // 토큰 발급
    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // URL에서 탭 정보 추출
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const tabFromUrl = pathSegments[pathSegments.length - 1];

    const validTabs = [
      "dashboard",
      "staff",
      "users",
      "theaters",
      "movies",
      "reservations",
      "inquiries",
      "events",
    ];

    if (validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (location.pathname === "/admin") {
      setActiveTab("dashboard");
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <SalesOverview />;
      case "staff":
        return <StaffManagement />;
      case "users":
        return <UserManagement />;
      case "theaters":
        return <TheaterManagement />;
      case "movies":
        return <MovieManagement />;
      case "reservations":
        return <ReservationManagement />;
      case "inquiries":
        return <Inquiries />;
      case "events":
        return <EventManagement />;
      default:
        return <SalesOverview />;
    }
  };

  return (
    <NotificationProvider>
      <div className="adp-dashboard">
        <AdminHeader />
        <div className="adp-layout">
          <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />
          <div className="adp-main">{renderContent()}</div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default AdminPage;

