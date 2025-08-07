import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { saveReservation, savePayment } from "../../../api/reservationApi";
import { useCoupon as applyCoupon } from "../../../api/couponApi";
import { getCurrentUserIdForPayment } from "../../../utils/tokenUtils";
import { cleanupSensitivePaymentData } from "../../../utils/sessionCleanup";

// 토스페이먼츠 결제 확인
async function confirmTossPayment(searchParams) {
  const requestData = {
    orderId: searchParams.get("orderId"),
    amount: searchParams.get("amount"),
    paymentKey: searchParams.get("paymentKey"),
  };

  const response = await fetch("/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });

  const json = await response.json();
  if (!response.ok) {
    throw { message: json.message, code: json.code };
  }

  return json;
}

// 결제 정보 DB 저장
async function processPaymentSave(paymentData) {
  const paymentInfo = {
    orderId: paymentData.orderId,
    method: paymentData.method || paymentData.easyPay?.provider || "기타",
    amount: paymentData.totalAmount || paymentData.balanceAmount || 0,
  };
  
  const result = await savePayment(paymentInfo);
  
  if (result?.success) {
    sessionStorage.setItem("paymentcd", result.paymentcd);
    return result.paymentcd;
  }
  
  throw new Error("결제 정보 저장에 실패했습니다.");
}

// 예약 정보 저장 (중복 방지)
async function processReservationSave() {
  const reservationInfo = JSON.parse(
    sessionStorage.getItem("finalReservationInfo") || "{}"
  );
  
  // 이미 예약 완료된 경우 스킵
  if (reservationInfo.reservationCompleted) {
    return;
  }

  const paymentcd = sessionStorage.getItem("paymentcd");
  if (!paymentcd) {
    throw new Error("paymentcd가 없어서 예약을 저장할 수 없습니다.");
  }

  const userid = await getCurrentUserIdForPayment();

  // 쿠폰 사용 처리
  if (reservationInfo.usedCoupon && !reservationInfo.couponAlreadyUsed) {
    try {
      await applyCoupon(userid, reservationInfo.usedCoupon.couponnum);
      reservationInfo.couponAlreadyUsed = true;
      sessionStorage.setItem("finalReservationInfo", JSON.stringify(reservationInfo));
    } catch (couponError) {
      console.warn("쿠폰 사용 실패:", couponError);
    }
  }

  // 예약 정보 저장
  const reservationResult = await saveReservation({
    schedulecd: reservationInfo.schedulecd,
    seatcd: reservationInfo.selectedSeats,
    paymentcd,
    userid,
  });
  
  if (reservationResult?.success === false) {
    throw new Error(`예약 저장에 실패했습니다: ${reservationResult.message || '알 수 없는 오류'}`);
  }

  // 예약 완료 플래그 설정
  reservationInfo.reservationCompleted = true;
  sessionStorage.setItem("finalReservationInfo", JSON.stringify(reservationInfo));
}

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState(() => {
    const savedResponseData = sessionStorage.getItem("paymentResponseData");
    return savedResponseData ? JSON.parse(savedResponseData) : null;
  });
  const [showResponseData, setShowResponseData] = useState(false);
  const [paymentRequestData, setPaymentRequestData] = useState(() => {
    const savedRequestData = sessionStorage.getItem("paymentRequestData");
    return savedRequestData ? JSON.parse(savedRequestData) : null;
  });
  const [showRequestData, setShowRequestData] = useState(false);

  // 뒤로가기 방지 및 보안 처리
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    const handleKeyDown = (event) => {
      // Alt + 왼쪽 화살표 (뒤로가기)
      if (event.altKey && event.keyCode === 37) {
        event.preventDefault();
        return false;
      }
      // Backspace로 뒤로가기 (input이나 textarea가 아닌 경우)
      if (
        event.keyCode === 8 &&
        !["INPUT", "TEXTAREA"].includes(event.target.tagName) &&
        !event.target.isContentEditable
      ) {
        event.preventDefault();
        return false;
      }
    };

    // 이벤트 리스너 등록
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);

    // 민감한 결제 정보 정리
    const timeoutId = setTimeout(cleanupSensitivePaymentData, 1000);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, []);

  // 페이지 스타일 설정
  useEffect(() => {
    document.body.style.backgroundColor = "#e8f3ff";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // 결제 확인 및 정보 저장
  useEffect(() => {
    if (responseData || sessionStorage.getItem("confirmRequested")) return;

    sessionStorage.setItem("confirmRequested", "true");

    const processPayment = async () => {
      try {
        // 1. 토스페이먼츠 결제 확인
        const paymentData = await confirmTossPayment(searchParams);
        setResponseData(paymentData);
        sessionStorage.setItem("paymentResponseData", JSON.stringify(paymentData));

        // 2. 결제 정보 DB 저장
        await processPaymentSave(paymentData);

        // 3. 예약 정보 저장
        await processReservationSave();

      } catch (error) {
        if (error.message?.includes("이미 예약된 좌석") || error.message?.includes("duplicate")) {
          // 중복 저장 시도는 정상 처리로 간주
          const reservationInfo = JSON.parse(
            sessionStorage.getItem("finalReservationInfo") || "{}"
          );
          reservationInfo.reservationCompleted = true;
          sessionStorage.setItem("finalReservationInfo", JSON.stringify(reservationInfo));
        } else if (error.code) {
          // 토스페이먼츠 에러
          navigate(`/fail?code=${error.code}&message=${error.message}`);
        } else {
          // 기타 에러
          alert("예약 처리 중 오류가 발생했습니다: " + error.message);
        }
      }
    };

    processPayment();
  }, []);

  const goToReservationSuccess = () => {
    navigate("/reservation/success");
  };

  return (
    <div className="pay-body">
      <div className="box_section" style={{ width: "600px" }}>
        <img
          width="100px"
          src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
        />
        <h2>결제를 완료했어요</h2>
        <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
          <div className="p-grid-col text--left">
            <b>결제금액</b>
          </div>
          <div className="p-grid-col text--right">
            {Number(searchParams.get("amount")).toLocaleString()}원
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
          <div className="p-grid-col text--left">
            <b>주문번호</b>
          </div>
          <div
            className="p-grid-col text--right"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setShowResponseData(!showResponseData)}
          >
            {searchParams.get("orderId")}
          </div>
        </div>
        <div className="p-grid-col">
          <button
            className="button p-grid-col5"
            style={{ backgroundColor: "#1b64da", color: "white" }}
            onClick={goToReservationSuccess}
          >
            예매확인
          </button>
        </div>
      </div>
      {showResponseData && (
        <>
          <div
            className="box_section"
            style={{ width: "600px", textAlign: "left" }}
          >
            <b>토스페이먼츠 결제 요청 데이터:</b>
            <div style={{ whiteSpace: "initial" }}>
              {paymentRequestData && (
                <pre>{JSON.stringify(paymentRequestData, null, 4)}</pre>
              )}
            </div>
          </div>
          <div
            className="box_section"
            style={{ width: "600px", textAlign: "left" }}
          >
            <b>토스페이먼츠 결제 응답 데이터:</b>
            <div style={{ whiteSpace: "initial" }}>
              {responseData && (
                <pre>{JSON.stringify(responseData, null, 4)}</pre>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { SuccessPage };

