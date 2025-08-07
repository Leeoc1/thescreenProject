import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAllNotices, fetchAllFaqs } from "../../../api/userApi";
import Pagination from "./Pagination";
import NoticeItem from "./NoticeItem";
import TabNavigation from "./TabNavigation";
import "../styles/NoticePage.css";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";

const NoticePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeTab, setActiveTab] = useState("notice"); // 기본 탭을 공지사항으로 설정
  const [currentPage, setCurrentPage] = useState(1);
  const [openedFaqIndex, setOpenedFaqIndex] = useState(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAllNotices().then(setNotices);
    fetchAllFaqs().then(setFaqs);
  }, []);

  // 경로에 따라 탭 설정
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/notice/faq") {
      setActiveTab("faq");
    } else if (pathname === "/notice/notice" || pathname === "/notice") {
      setActiveTab("notice");
    }
  }, [location.pathname]);

  const getCurrentData = () => {
    const data = activeTab === "notice" ? notices : faqs;
    const sortKey = activeTab === "notice" ? "noticenum" : "faqnum";
    return data.sort((a, b) => b[sortKey] - a[sortKey]);
  };

  const currentData = getCurrentData().slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(getCurrentData().length / ITEMS_PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenedFaqIndex(null); // 탭 변경 시 열린 FAQ 닫기

    // URL 변경
    if (tab === "faq") {
      navigate("/notice/faq");
    } else {
      navigate("/notice/notice");
    }
  };

  // 글로벌 인덱스(전체 데이터 기준)로 드롭다운 상태 관리
  const handleFaqToggle = (globalIndex) => {
    if (openedFaqIndex === globalIndex) {
      setOpenedFaqIndex(null);
    } else {
      setOpenedFaqIndex(globalIndex);
    }
  };

  // 전체 데이터에서의 글로벌 인덱스 계산
  const baseIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // 전체 건수 표시 텍스트 (필터링된 데이터 기준)
  const totalCount = getCurrentData().length;

  return (
    <div className="notice-page">
      <Header />
      <div className="notice-container">
        <h1 className="notice-page-title">고객센터</h1>

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="tab-content">
          {/* 전체 건수 표시 */}
          <span className="notice-total-count">전체 {totalCount}건</span>
          <div className="notice-list">
            {currentData.map((item, index) => {
              const globalIndex = baseIndex + index;
              const key = activeTab === "notice" ? item.noticenum : item.faqnum;
              return (
                <NoticeItem
                  key={key}
                  item={item}
                  index={globalIndex}
                  type={activeTab}
                  isExpanded={openedFaqIndex === globalIndex}
                  onToggle={handleFaqToggle}
                />
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NoticePage;

