import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../shared/Header";
import "../styles/NoticeContentPage.css";

const NoticeContents = () => {
  const { noticenum } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/notice/${noticenum}`)
      .then((res) => {
        if (!res.ok) throw new Error("공지사항을 찾을 수 없습니다");
        return res.json();
      })
      .then((data) => {
        setNotice(data[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setLoading(false);
      });
  }, [noticenum]);

  if (loading) return <div className="notice-contents-loading">로딩 중...</div>;
  if (error || !notice)
    return (
      <div className="notice-contents-error">공지사항을 찾을 수 없습니다.</div>
    );

  return (
    <div className="rts-page notice-contents-bg">
      <Header />
      <div className="rts-content notice-detail-content">
        <div className="rts-main notice-detail-main">
          <div className="rts-container notice-contents-container">
            <section className="notice-detail-section">
              <div className="notice-contents-title">{notice.noticesub}</div>
              <div className="notice-contents-date">{notice.noticedate}</div>
              <div className="notice-contents-content">
                {notice.noticecontents}
              </div>
            </section>
            <button
              className="notice-back-btn"
              onClick={() => navigate("/notice")}
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeContents;
