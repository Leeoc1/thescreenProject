import { apiRequest, apiRequestWithErrorHandling } from "./apiUtils";

// ========== 예약 관련 API (reservation, reservation_view 테이블) ==========

// 예약 저장 (reservation 테이블)
export const saveReservation = (reservationData) =>
  apiRequestWithErrorHandling(
    "post", 
    "/reservation", 
    reservationData, 
    {}, 
    "Error saving reservation:", 
    null
  );

// 예약 정보 조회 (reservation_view)
export const getReservation = () =>
  apiRequestWithErrorHandling(
    "get", 
    "view/reservation/success", 
    null, 
    {}, 
    "Error fetching reservation:", 
    []
  );

// 예약 좌석 정보 조회 (reservation, seat 테이블 관련)
export const getReservationSeat = () =>
  apiRequestWithErrorHandling(
    "get", 
    "/reservation/seat", 
    null, 
    {}, 
    "Error fetching reservation seat:", 
    []
  );

// ========== 결제 관련 API (payment 테이블) ==========

// 결제 정보 저장 (payment 테이블)
export const savePayment = (paymentData) =>
  apiRequestWithErrorHandling(
    "post", 
    "/payment/save", 
    paymentData, 
    {}, 
    "Error saving payment:", 
    null
  );

// 주간 총 매출 조회 (payment 테이블 집계)
export const getTotalVolume = () =>
  apiRequestWithErrorHandling(
    "get", 
    "/reservation/week/sum", 
    null, 
    {}, 
    "Error fetching total volume:", 
    []
  );

// 극장별 매출 조회 (payment, reservation, Cinema 테이블 조인 집계)
export const getCinemaVolume = () =>
  apiRequestWithErrorHandling(
    "get", 
    "/reservation/cinema/amount", 
    null, 
    {}, 
    "Error fetching cinema volume:", 
    []
  );

// 예약 취소 (reservation 테이블)
export const cancelReservation = (reservationcd, reservationstatus = "환불 처리") =>
  apiRequestWithErrorHandling(
    "put", 
    "/reservation/cancel", 
    { reservationcd, reservationstatus }, 
    {}, 
    "Error canceling reservation:", 
    null
  );

