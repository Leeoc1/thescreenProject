package com.example.thescreen.controller;

import com.example.thescreen.entity.Reservation;
import com.example.thescreen.entity.User;
import com.example.thescreen.repository.ReservationRepository;
import com.example.thescreen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservation")
@CrossOrigin(origins = "http://localhost:3000")
public class ReservationController {

    private ReservationRepository reservationRepository;
    private UserRepository userRepository;

    @Autowired
    public ReservationController(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/seat")
    public List<Reservation> getSeat() {
        return reservationRepository.findAll();
    }

    // 예매 정보 저장 (post)
    @PostMapping
    public ResponseEntity<?> saveReservation(@RequestBody Map<String, Object> requestData) {
        try {
            // 필수 데이터 검증
            if (requestData.get("schedulecd") == null || requestData.get("seatcd") == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "필수 데이터가 누락되었습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Reservation 엔티티 생성
            Reservation reservation = new Reservation();
            reservation.setSchedulecd((String) requestData.get("schedulecd"));

            // seatcd 처리 - 배열을 문자열로 변환
            Object seatcdObj = requestData.get("seatcd");
            String seatcd;
            if (seatcdObj instanceof java.util.List) {
                // 배열을 쉼표로 구분된 문자열로 변환
                java.util.List<?> seatList = (java.util.List<?>) seatcdObj;
                seatcd = String.join(",", seatList.stream().map(Object::toString).toList());
            } else {
                seatcd = (String) seatcdObj;
            }
            reservation.setSeatcd(seatcd);

            reservation.setReservationtime(LocalDateTime.now());
            reservation.setReservationstatus("예약완료");
            
            // userid 설정 - 요청 데이터에서 가져오기
            String userid = (String) requestData.get("userid");
            if (userid != null && !userid.trim().isEmpty()) {
                // User 엔티티 조회 후 설정
                User user = userRepository.findByUserid(userid).orElse(null);
                reservation.setUser(user);
            } else {
                reservation.setUser(null);
            }
            
            // paymentcd는 결제 완료 후 설정 (임시로 null)
            Object paymentcdObj = requestData.get("paymentcd");
            if (paymentcdObj != null) {
                reservation.setPaymentcd(paymentcdObj.toString());
            } else {
                reservation.setPaymentcd(null);
            }

            Long maxId = reservationRepository.findMaxReservationId();
            Long newId = (maxId != null) ? maxId + 1 : 1;
            String formattedId = String.format("%012d", newId);
            reservation.setReservationcd(formattedId);
            // 저장
            Reservation savedReservation = reservationRepository.save(reservation);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "예약이 성공적으로 저장되었습니다.");
            response.put("reservationId", savedReservation.getReservationcd());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "예약 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // 예약 취소 API (PUT)
    @PutMapping("/cancel")
    public ResponseEntity<?> cancelReservation(@RequestBody Map<String, Object> requestData) {
        try {
            String reservationcd = (String) requestData.get("reservationcd");
            String reservationstatus = (String) requestData.get("reservationstatus");

            // 필수 데이터 검증
            if (reservationcd == null || reservationstatus == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "예매번호와 예약상태는 필수입니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 예약 정보 조회
            java.util.Optional<Reservation> optionalReservation = reservationRepository.findById(reservationcd);
            if (optionalReservation.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "해당 예매번호를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

            Reservation reservation = optionalReservation.get();
            
            // 이미 취소된 예약인지 확인
            if ("예약취소".equals(reservation.getReservationstatus())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "이미 취소된 예약입니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 예약 상태 업데이트
            reservation.setReservationstatus(reservationstatus);
            reservation.setSeatcd(null);
            reservationRepository.save(reservation);


            Map<String, Object> response = new HashMap<>();
            response.put("message", "예약이 성공적으로 취소되었습니다.");
            response.put("reservationcd", reservationcd);
            response.put("status", reservationstatus);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "예약 취소 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
