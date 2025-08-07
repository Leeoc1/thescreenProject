import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackNavigationModal from "../../../utils/BackNavigationModal";
import { getCurrentUserIdForPayment } from "../../../utils/tokenUtils";
import { getUserInfo } from "../../../api/userApi";
import { saveReservation, savePayment } from "../../../api/reservationApi";
import { useCoupon as applyCoupon } from "../../../api/couponApi";
import {
  cleanupOnReservationCancel,
  logSessionState,
} from "../../../utils/sessionCleanup";
import "./paycss/pay.css";

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: 0,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [customerKey, setCustomerKey] = useState(null);
  const [orderId] = useState(generateRandomString());
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // 결제 페이지 접근 시 로그인 상태 로깅
  useEffect(() => {
    // 세션 상태 로깅
    logSessionState("(결제 페이지 접근)");
  }, []);

  // 뒤로가기 방지 및 세션 보안 처리 (결제 위젯 페이지)
  useEffect(() => {
    // 결제 위젯에서 뒤로가기 방지 (더 엄격하게)
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

  // 페이지 로드 시 body 백그라운드 설정
  useEffect(() => {
    document.body.style.backgroundColor = "#e8f3ff";

    // 컴포넌트 언마운트 시 원래 스타일로 복원
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const reservationInfo = JSON.parse(
      sessionStorage.getItem("finalReservationInfo") || "{}"
    );
    // finalPrice가 있으면 그 값을 사용, 없으면 totalPrice 사용
    const price =
      reservationInfo.finalPrice !== undefined
        ? reservationInfo.finalPrice
        : reservationInfo.totalPrice;
    setAmount({
      currency: "KRW",
      value: price || 0,
    });
  }, []);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userid = await getCurrentUserIdForPayment();
      if (userid) {
        setCustomerKey(userid);
        const userData = await getUserInfo(userid);
        setUserInfo(userData);
        
        // 0원 결제인 경우 위젯 없이도 ready 상태로 설정
        if (amount.value === 0) {
          setReady(true);
        }
      }
    };

    fetchUserInfo();
  }, [amount.value]);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      if (!customerKey) return;

      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({
        customerKey,
      });
      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }

      // 0원 결제인 경우 위젯 렌더링 스킵하고 바로 ready 상태로 변경
      if (amount.value === 0) {
        setReady(true);
        return;
      }

      // ------  주문서의 결제 금액 설정 ------
      // TODO: 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
      // TODO: renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
      await widgets.setAmount(amount);

      // ------  결제 UI 렌더링 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        // 렌더링하고 싶은 결제 UI의 variantKey
        // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
        // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
        variantKey: "DEFAULT",
      });

      // ------  이용약관 UI 렌더링 ------
      // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, amount.value]);

  // 모달 핸들러 함수들
  const handleBackModalClose = () => {
    setShowBackModal(false);
  };

  const handleBackModalConfirm = () => {
    // 체계적인 세션 정리
    cleanupOnReservationCancel();

    navigate("/", { replace: true }); // 홈으로 이동
  };

  // 확인 모달 핸들러 함수들
  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmModalConfirm = async () => {
    setShowConfirmModal(false);
    
    try {
      setIsPaymentLoading(true);
      await processFreePayment(orderId, navigate);
    } catch (error) {
      alert("예매 처리 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // 결제 처리 함수
  const handlePaymentClick = async () => {
    if (isPaymentLoading || amount.value < 0 || !userInfo) {
      return;
    }

    try {
      setIsPaymentLoading(true);

      // 0원 결제 처리 - 확인 모달 표시
      if (amount.value === 0) {
        setIsPaymentLoading(false); // 모달 표시 전에 로딩 해제
        setShowConfirmModal(true);
        return;
      }

      // 유료 결제 처리
      if (!widgets) {
        alert("결제 시스템을 준비하는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const paymentData = {
        orderId: orderId,
        orderName: "영화 예매",
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail",
        customerEmail: userInfo?.email || "guest@example.com",
        customerName: userInfo?.username || "게스트",
        customerMobilePhone: userInfo?.phone?.replace(/[-\s]/g, "") || "01012341234",
      };

      sessionStorage.setItem("paymentRequestData", JSON.stringify(paymentData));
      await widgets.requestPayment(paymentData);

    } catch (error) {
      let errorMessage = "결제 요청 중 오류가 발생했습니다.";

      if (error.code === "USER_CANCEL") {
        errorMessage = "결제가 취소되었습니다.";
      } else if (error.code === "INVALID_CARD") {
        errorMessage = "유효하지 않은 카드 정보입니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="pay-body">
      <div className="wrapper">
        <div className="box_section">
          {/* 0원인 경우 쿠폰 사용 안내 */}
          {amount.value === 0 && (
            <div className="coupon-payment-notice" style={{
              padding: "20px",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "20px",
              border: "1px solid #28a745"
            }}>
              <h4 style={{ color: "#28a745", margin: "0 0 8px 0" }}>🎫 쿠폰 적용으로 예매</h4>
            </div>
          )}

          {/* 0원이 아닌 경우에만 결제 UI 표시 */}
          {amount.value > 0 && (
            <>
              {/* 결제 UI */}
              <div id="payment-method" />
              {/* 이용약관 UI */}
              <div id="agreement" />
            </>
          )}

          {/* 최종 결제 금액 표시 */}
          <div
            className="checkout-final-amount"
            style={{ 
              fontSize: "24px", 
              fontWeight: "bold", 
              marginTop: "30px",
              color: amount.value === 0 ? "#28a745" : "#333"
            }}
          >
            최종 결제 금액: {amount.value.toLocaleString()}원
            {amount.value === 0 && <span>✨</span>}
          </div>

          {/* 결제하기 버튼 */}
          <button
            className="button"
            style={{ marginTop: "30px" }}
            disabled={isPaymentLoading || amount.value < 0 || !userInfo || (amount.value > 0 && (!ready || !widgets))}
            onClick={handlePaymentClick}
          >
            {isPaymentLoading 
              ? "처리 중..." 
              : amount.value === 0 
                ? "예매하기" 
                : "결제하기"
            }
          </button>
        </div>
      </div>

      {/* 뒤로가기 확인 모달 */}
      <BackNavigationModal
        isOpen={showBackModal}
        onClose={handleBackModalClose}
        onConfirm={handleBackModalConfirm}
        title="🚫 결제를 취소하시겠습니까?"
        message="결제를 취소하시겠습니까?"
        submessage="모든 선택 정보가 초기화되고 홈으로 이동합니다."
        confirmText="결제 취소"
        cancelText="계속 진행"
      />

      {/* 0원 결제 확인 모달 */}
      <BackNavigationModal
        isOpen={showConfirmModal}
        onClose={handleConfirmModalClose}
        onConfirm={handleConfirmModalConfirm}
        title="🎫 예매 확인"
        message="정말 예매하시겠습니까?"
        submessage="쿠폰이 사용되어 예매가 완료됩니다."
        confirmText="네"
        cancelText="아니오"
      />
    </div>
  );
}

// 0원 결제 처리 함수
async function processFreePayment(orderId, navigate) {
  const reservationInfo = JSON.parse(
    sessionStorage.getItem("finalReservationInfo") || "{}"
  );
  const userid = await getCurrentUserIdForPayment();

  // 1. 결제 정보 저장
  const paymentResult = await savePayment({
    orderId: orderId,
    method: "쿠폰",
    amount: 0,
  });

  if (!paymentResult?.paymentcd) {
    throw new Error("결제 정보 저장에 실패했습니다.");
  }

  // 2. 쿠폰 사용 처리
  if (reservationInfo.usedCoupon && !reservationInfo.couponAlreadyUsed) {
    try {
      await applyCoupon(userid, reservationInfo.usedCoupon.couponnum);
      reservationInfo.couponAlreadyUsed = true;
      sessionStorage.setItem("finalReservationInfo", JSON.stringify(reservationInfo));
    } catch (couponError) {
      // 쿠폰 사용 실패해도 예약은 계속 진행
      console.warn("쿠폰 사용 실패:", couponError);
    }
  }

  // 3. 예약 정보 저장
  const reservationResult = await saveReservation({
    schedulecd: reservationInfo.schedulecd,
    seatcd: reservationInfo.selectedSeats,
    paymentcd: paymentResult.paymentcd,
    userid,
  });

  if (reservationResult?.success === false) {
    throw new Error(`예약 저장에 실패했습니다: ${reservationResult.message || '알 수 없는 오류'}`);
  }

  // 4. 예약 완료 처리
  reservationInfo.reservationCompleted = true;
  sessionStorage.setItem("finalReservationInfo", JSON.stringify(reservationInfo));
  
  navigate("/reservation/success", { replace: true });
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
