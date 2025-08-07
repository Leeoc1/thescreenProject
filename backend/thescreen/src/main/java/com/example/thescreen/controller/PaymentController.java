package com.example.thescreen.controller;

import com.example.thescreen.entity.Payment;
import com.example.thescreen.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class PaymentController {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @PostMapping("/payment/save")
    public ResponseEntity<?> savePayment(@RequestBody Map<String, Object> paymentData) {
        try {
            Payment payment = new Payment();
            
            // 결제 코드 설정 (orderId 사용)
            String orderId = (String) paymentData.get("orderId");
            if (orderId != null && !orderId.trim().isEmpty()) {
                payment.setPaymentcd(orderId);
            } else {
                // orderId가 없는 경우에만 UUID 생성
                String paymentcd = "PAY" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                payment.setPaymentcd(paymentcd);
            }
            
            // 결제 수단 설정
            String method = (String) paymentData.get("method");
            payment.setPaymentmethod(method);
            
            // 결제 시간 설정
            payment.setPaymenttime(LocalDateTime.now());
            
            // 결제 금액 설정
            Object amountObj = paymentData.get("amount");
            if (amountObj != null) {
                Long amount;
                if (amountObj instanceof Integer) {
                    amount = ((Integer) amountObj).longValue();
                } else if (amountObj instanceof String) {
                    amount = Long.parseLong((String) amountObj);
                } else {
                    amount = (Long) amountObj;
                }
                payment.setAmount(amount);
            }
            
            // 결제 상태 설정
            payment.setPaymentstatus("SUCCESS");
            
            // 저장
            Payment savedPayment = paymentRepository.save(payment);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "paymentcd", savedPayment.getPaymentcd(),
                "message", "결제 정보가 성공적으로 저장되었습니다."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "결제 정보 저장 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
} 