import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../shared/Header";
import Footer from "../../../shared/Footer";
import { saveReservation } from "../../../api/reservationApi";
import {
  getUserCoupons,
  useCoupon as applyCoupon,
} from "../../../api/couponApi";
import { getCurrentUserIdForPayment } from "../../../utils/tokenUtils";
import ProgressBar from "./ProgressBar";
import BackNavigationModal from "../../../utils/BackNavigationModal";
import "../style/ReservationPaymentPage.css";

const ReservationPaymentPage = () => {
  const navigate = useNavigate();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [userCoupons, setUserCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackModal, setShowBackModal] = useState(false);

  // 뒤로가기 방지 및 세션 보안 처리
  useEffect(() => {
    // 결제 페이지에서 뒤로가기 방지
    const handlePopState = (event) => {
      event.preventDefault();

      // 모달을 표시하고 히스토리를 다시 푸시
      setShowBackModal(true);
      window.history.pushState(null, "", window.location.href);
    };

    // 히스토리 조작으로 뒤로가기 차단
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // 사용자 쿠폰 목록 로드
  const loadUserCoupons = async () => {
    try {
      // 토큰에서 실제 userid 추출
      const userid = await getCurrentUserIdForPayment();

      if (userid) {
        const coupons = await getUserCoupons(userid);

        if (coupons && coupons.length > 0) {
        }

        // 사용 가능한 쿠폰만 필터링 (만료되지 않고, 사용되지 않은 쿠폰)
        const availableCoupons = coupons.filter((coupon) => {
          const isActive = coupon.couponstatus;
          const isNotExpired = new Date(coupon.couponexpiredate) > new Date();
          return isActive && isNotExpired;
        });

        setUserCoupons(availableCoupons);

        // 현재 선택된 쿠폰이 더 이상 사용 가능한 목록에 없다면 선택 해제
        if (
          selectedCoupon &&
          !availableCoupons.find(
            (c) => c.couponnum === selectedCoupon.couponnum
          )
        ) {
          setSelectedCoupon(null);
        }
      } else {
      }
    } catch (error) {
      console.error("쿠폰 목록 로드 실패:", error);
      console.error("에러 상세:", error.message);
      console.error("에러 스택:", error.stack);
      setUserCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 쿠폰 목록 로드 useEffect
  useEffect(() => {
    // 브라우저 저장소 전체 확인

    loadUserCoupons();
  }, []);

  // 쿠폰 할인 금액 계산
  const getCouponDiscount = () => {
    return selectedCoupon ? selectedCoupon.discount : 0;
  };

  // 할인 금액 계산 함수들 제거 - 기프트콘 관련 제거

  // finalReservationInfo에서 데이터 가져오기
  const reservationInfo = JSON.parse(
    sessionStorage.getItem("finalReservationInfo") || "{}"
  );

  // 필수 데이터가 없으면 좌석 선택 페이지로 이동
  if (!reservationInfo.selectedSeats || !reservationInfo.guestCount) {
    navigate("/reservation/seat");
    return null;
  }

  // 관람 인원 합계
  const totalGuests = reservationInfo.totalGuests || 0;

  // 예매 정보 추출
  const movieTitle = reservationInfo.movienm || "영화 미선택";
  const theater = reservationInfo.cinemanm || "극장 미선택";
  const date = reservationInfo.starttime
    ? new Date(reservationInfo.starttime).toLocaleDateString()
    : "날짜 미선택";
  const time = reservationInfo.starttime
    ? reservationInfo.starttime.substring(11, 16)
    : "시간 미선택";
  const seats = reservationInfo.selectedSeats
    ? reservationInfo.selectedSeats.join(", ")
    : "좌석 미선택";
  const price = reservationInfo.totalPrice ? reservationInfo.totalPrice : "0";

  // 결제 처리
  const handlePay = async () => {
    try {
      // 쿠폰 사용 처리 (결제 시작 시점)
      if (selectedCoupon) {
        const userid = await getCurrentUserIdForPayment(); // 토큰화된 userid 디코딩
        if (userid) {
          try {
            await applyCoupon(userid, selectedCoupon.couponnum);
          } catch (couponError) {
            console.error("쿠폰 사용 처리 중 오류:", couponError);
            alert("쿠폰 사용 중 오류가 발생했습니다. 다시 시도해주세요.");
            return; // 쿠폰 사용 실패 시 결제 중단
          }
        }
      }

      // 기존 예약 정보 불러오기
      const info = JSON.parse(
        sessionStorage.getItem("finalReservationInfo") || "{}"
      );
      // 최종 결제 금액과 사용된 쿠폰 정보를 info에 추가
      info.finalPrice = finalPrice;
      info.usedCoupon = selectedCoupon;
      info.couponAlreadyUsed = selectedCoupon ? true : false; // 쿠폰이 이미 사용되었음을 표시
      // 다시 저장
      sessionStorage.setItem("finalReservationInfo", JSON.stringify(info));
      // 체크아웃 페이지로 이동
      navigate("/checkout");
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  // 아코디언 토글 함수 제거 - 더 이상 필요 없음

  // 최종 결제 금액
  // 음수가 되지 않게 0으로 막아둠 그 밑으로 내려가도
  const finalPrice = Math.max(0, price - getCouponDiscount());

  // 모달 핸들러 함수들
  const handleBackModalClose = () => {
    setShowBackModal(false);
  };

  const handleBackModalConfirm = () => {
    // 사용자가 확인했을 때만 예매 관련 정보 정리하고 이동 (로그인 정보는 유지)
    sessionStorage.removeItem("finalReservationInfo");
    sessionStorage.removeItem("selectedSeats");
    sessionStorage.removeItem("reservationInfo");
    navigate("/movie", { replace: true });
  };

  return (
    <div className="reservation-payment-page">
      <Header isOtherPage={true} isScrolled={true} />
      <div className="reservation-payment-content">
        <div className="reservation-payment-container">
          {/* 진행바 */}
          <ProgressBar currentStep={2} />
          <div className="payment-title">결제</div>
          <div className="payment-container">
            <div className="payment-accordion">
              <div className="coupon-section">
                <h3>할인쿠폰 ({userCoupons.length}개 보유)</h3>
                <div className="coupon-options">
                  {isLoading ? (
                    <div>쿠폰 목록을 불러오는 중...</div>
                  ) : (
                    <>
                      <label>
                        <input
                          type="radio"
                          name="coupon"
                          value="none"
                          checked={selectedCoupon === null}
                          onChange={() => setSelectedCoupon(null)}
                        />
                        할인쿠폰 사용 안함
                      </label>
                      {userCoupons.length === 0 ? (
                        <div className="no-coupons">
                          사용 가능한 쿠폰이 없습니다.
                        </div>
                      ) : (
                        userCoupons.map((coupon) => (
                          <label key={coupon.couponnum} className="coupon-item">
                            <div className="coupon-radio-container">
                              <input
                                type="radio"
                                name="coupon"
                                value={coupon.couponnum}
                                checked={
                                  selectedCoupon?.couponnum === coupon.couponnum
                                }
                                onChange={() => setSelectedCoupon(coupon)}
                              />
                            </div>
                            <div className="coupon-info">
                              <div className="coupon-left-info">
                                <div className="coupon-name">
                                  {coupon.couponname}
                                </div>
                                <div className="coupon-discount-info">
                                  {coupon.discount.toLocaleString()}원 할인
                                </div>
                              </div>
                              <div className="coupon-expire">
                                만료일:{" "}
                                {new Date(
                                  coupon.couponexpiredate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="payment-final-amount-box">
              <div className="payment-summary">
                <div className="payment-original-price">
                  <span>원래 금액: </span>
                  <span>{price.toLocaleString()}원</span>
                </div>
                {selectedCoupon && (
                  <div className="payment-discount-item">
                    <span>쿠폰 할인: </span>
                    <span className="discount-amount">
                      -{selectedCoupon.discount.toLocaleString()}원
                    </span>
                  </div>
                )}
                <div className="payment-divider"></div>
              </div>
              <div className="payment-final-label">결제하실 금액</div>
              <div className="payment-final-amount">
                {finalPrice.toLocaleString()}원
              </div>
            </div>

            <div className="payment-bottom-btns">
              <button className="payment-back-btn" onClick={() => navigate(-1)}>
                돌아가기
              </button>
              <button className="payment-main-btn" onClick={handlePay}>
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* 뒤로가기 확인 모달 */}
      <BackNavigationModal
        isOpen={showBackModal}
        onClose={handleBackModalClose}
        onConfirm={handleBackModalConfirm}
        title="🚫 결제를 취소하시겠습니까?"
        message="결제를 취소하고 영화 선택 페이지로 이동하시겠습니까?"
        submessage="현재까지의 선택 정보가 모두 초기화됩니다."
        confirmText="결제 취소"
        cancelText="계속 진행"
      />
    </div>
  );
};

export default ReservationPaymentPage;
