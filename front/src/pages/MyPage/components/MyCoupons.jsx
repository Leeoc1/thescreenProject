import { useState, useEffect } from "react";
import "../styles/MyCoupons.css";
import { getUserCoupons } from "../../../api/couponApi";

const MyCoupons = ({ showCouponModal, handleCloseCouponModal, userInfo }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // 쿠폰 코드에 따른 쿠폰명 매핑
  const getCouponName = (couponcd) => {
    const couponMap = {
      101: "할인쿠폰",
      102: "웰컴 쿠폰",
      103: "학생 할인 쿠폰",
      104: "시니어 할인 쿠폰",
      105: "영화관람권",
      106: "환영 쿠폰",
    };
    return couponMap[couponcd] || "알 수 없는 쿠폰";
  };

  // 쿠폰 상태에 따른 텍스트 반환
  const getCouponStatusText = (couponstatus, couponexpiredate) => {
    const today = new Date();
    const expireDate = new Date(couponexpiredate);

    if (!couponstatus) {
      return "사용완료";
    } else if (expireDate < today) {
      return "만료됨";
    } else {
      return "사용가능";
    }
  };

  // 쿠폰 상태에 따른 CSS 클래스 반환
  const getCouponStatusClass = (couponstatus, couponexpiredate) => {
    const today = new Date();
    const expireDate = new Date(couponexpiredate);

    if (!couponstatus) {
      return "mp-coupon-status-used";
    } else if (expireDate < today) {
      return "mp-coupon-status-expired";
    } else {
      return "mp-coupon-status-available";
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 쿠폰 목록 조회
  const fetchCoupons = async () => {
    if (!userInfo?.userid) return;

    setLoading(true);
    try {
      const response = await getUserCoupons(userInfo.userid);
      setCoupons(response || []);
    } catch (error) {
      
      setCoupons([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 쿠폰 데이터 조회
  useEffect(() => {
    if (showCouponModal && userInfo) {
      fetchCoupons();
    }
  }, [showCouponModal, userInfo]);

  if (!showCouponModal) return null;

  return (
    <div className="mp-modal-overlay" onClick={handleCloseCouponModal}>
      <div
        className="mp-modal-content mp-coupon-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-modal-header">
          <h2 className="mp-modal-title">내 쿠폰함</h2>
          <button className="mp-modal-close" onClick={handleCloseCouponModal}>
            ×
          </button>
        </div>

        <div className="mp-coupon-modal-body">
          {loading ? (
            <div className="mp-loading">쿠폰 정보를 불러오는 중...</div>
          ) : coupons.length > 0 ? (
            <div className="mp-coupon-list">
              {coupons.map((coupon) => (
                <div key={coupon.couponnum} className="mp-coupon-item">
                  <div className="mp-coupon-content">
                    <div className="mp-coupon-main-info">
                      <h3 className="mp-coupon-name">
                        {getCouponName(coupon.couponcd)}
                      </h3>
                      <div className="mp-coupon-details">
                        <p className="mp-coupon-discount">
                          할인금액:{" "}
                          {coupon.discount
                            ? `${coupon.discount.toLocaleString()}원`
                            : "0원"}
                        </p>
                        <p className="mp-coupon-expire">
                          만료일: {formatDate(coupon.couponexpiredate)}
                        </p>
                        {coupon.couponusedate && (
                          <p className="mp-coupon-use-date">
                            사용일: {formatDate(coupon.couponusedate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mp-coupon-status">
                      <span
                        className={`mp-coupon-status-badge ${getCouponStatusClass(
                          coupon.couponstatus,
                          coupon.couponexpiredate
                        )}`}
                      >
                        {getCouponStatusText(
                          coupon.couponstatus,
                          coupon.couponexpiredate
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mp-no-coupons">
              <p>보유한 쿠폰이 없습니다.</p>
            </div>
          )}
        </div>

        <div className="mp-coupon-modal-footer">
          <button
            className="mp-btn mp-btn-close"
            onClick={handleCloseCouponModal}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCoupons;

