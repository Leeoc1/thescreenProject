import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cleanupOnPaymentFailure } from "../../../utils/sessionCleanup";

export function FailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentRequestData, setPaymentRequestData] = useState(() => {
    const savedRequestData = sessionStorage.getItem("paymentRequestData");
    return savedRequestData ? JSON.parse(savedRequestData) : null;
  });
  const [showRequestData, setShowRequestData] = useState(false);

  // 페이지 로드 시 body 백그라운드 설정
  useEffect(() => {
    document.body.style.backgroundColor = "#e8f3ff";

    // 컴포넌트 언마운트 시 원래 스타일로 복원
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // 결제 실패 시 예매 관련 세션 정보 정리
  useEffect(() => {
    // 사용자가 오류 메시지를 확인할 수 있도록 3초 후 정리
    const timeoutId = setTimeout(() => {
      cleanupOnPaymentFailure();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // 홈으로 돌아가기 함수
  const goToHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="pay-body">
      <div id="info" className="box_section" style={{ width: "600px" }}>
        <img
          width="100px"
          src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
          alt="에러 이미지"
        />
        <h2>결제를 실패했어요</h2>

        <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
          <div className="p-grid-col text--left">
            <b>에러메시지</b>
          </div>
          <div
            className="p-grid-col text--right"
            id="message"
          >{`${searchParams.get("message")}`}</div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
          <div className="p-grid-col text--left">
            <b>에러코드</b>
          </div>
          <div
            className="p-grid-col text--right"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setShowRequestData(!showRequestData)}
            id="code"
          >{`${searchParams.get("code")}`}</div>
        </div>

        <div className="p-grid-col">
          <button
            className="button p-grid-col5"
            onClick={goToHome}
            style={{
              backgroundColor: "#1b64da",
              color: "white",
              marginRight: "10px",
            }}
          >
            홈으로 돌아가기
          </button>
          <Link to="https://docs.tosspayments.com/guides/v2/payment-widget/integration">
            <button className="button p-grid-col5">연동 문서</button>
          </Link>
          <Link to="https://discord.gg/A4fRFXQhRu">
            <button
              className="button p-grid-col5"
              style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}
            >
              실시간 문의
            </button>
          </Link>
        </div>
      </div>
      {showRequestData && (
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
      )}
    </div>
  );
}

