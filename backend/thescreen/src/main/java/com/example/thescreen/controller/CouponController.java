package com.example.thescreen.controller;

import com.example.thescreen.entity.Coupon;
import com.example.thescreen.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
@RequiredArgsConstructor
public class CouponController {
    
    private final CouponService couponService;
    
    /**
     * 사용자별 쿠폰 목록 조회
     */
    @GetMapping("/users/{userid}/coupons")
    public ResponseEntity<?> getUserCoupons(@PathVariable String userid) {
        try {
            List<Coupon> coupons = couponService.getUserCoupons(userid);
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            System.err.println("쿠폰 목록 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "쿠폰 목록을 불러오는데 실패했습니다."));
        }
    }
    
    /**
     * 사용자별 사용 가능한 쿠폰 목록 조회
     */
    @GetMapping("/users/{userid}/coupons/available")
    public ResponseEntity<?> getAvailableCoupons(@PathVariable String userid) {
        try {
            List<Coupon> coupons = couponService.getAvailableCoupons(userid);
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            System.err.println("사용 가능한 쿠폰 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "사용 가능한 쿠폰을 불러오는데 실패했습니다."));
        }
    }
    
    /**
     * 쿠폰 사용
     */
    @PutMapping("/users/{userid}/coupons/{couponnum}/use")
    public ResponseEntity<?> useCoupon(@PathVariable String userid, @PathVariable Integer couponnum) {
        try {
            boolean result = couponService.useCoupon(userid, couponnum);
            if (result) {
                return ResponseEntity.ok(Map.of("success", true, "message", "쿠폰이 성공적으로 사용되었습니다."));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "error", "쿠폰 사용에 실패했습니다."));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("쿠폰 사용 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "쿠폰 사용 중 서버 오류가 발생했습니다."));
        }
    }
    
    /**
     * 쿠폰 상세 조회
     */
    @GetMapping("/users/{userid}/coupons/{couponnum}")
    public ResponseEntity<?> getCouponDetail(@PathVariable String userid, @PathVariable Integer couponnum) {
        try {
            Optional<Coupon> coupon = couponService.getCouponDetail(userid, couponnum);
            if (coupon.isPresent()) {
                return ResponseEntity.ok(coupon.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("쿠폰 상세 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "쿠폰 정보를 불러오는데 실패했습니다."));
        }
    }
    
    /**
     * 사용된 쿠폰 목록 조회
     */
    @GetMapping("/users/{userid}/coupons/used")
    public ResponseEntity<?> getUsedCoupons(@PathVariable String userid) {
        try {
            List<Coupon> coupons = couponService.getUsedCoupons(userid);
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            System.err.println("사용된 쿠폰 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "사용된 쿠폰 목록을 불러오는데 실패했습니다."));
        }
    }
    
    /**
     * 쿠폰 발급 (관리자 기능)
     */
    @PostMapping("/coupons/issue")
    public ResponseEntity<?> issueCoupon(@RequestBody Map<String, Object> request) {
        try {
            String userid = (String) request.get("userid");
            Integer couponcd = (Integer) request.get("couponcd");
            String couponexpiredate = (String) request.get("couponexpiredate");
            
            if (userid == null || couponcd == null || couponexpiredate == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "error", "필수 파라미터가 누락되었습니다."));
            }
            
            String couponname = couponService.getCouponNameByCode(couponcd);
            Integer discount = couponService.getDiscountByCode(couponcd);
            LocalDate expireDate = LocalDate.parse(couponexpiredate);
            
            Coupon issuedCoupon = couponService.issueCoupon(userid, couponcd, couponname, discount, expireDate);
            
            return ResponseEntity.ok(Map.of("success", true, "coupon", issuedCoupon, "message", "쿠폰이 성공적으로 발급되었습니다."));
            
        } catch (Exception e) {
            System.err.println("쿠폰 발급 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "쿠폰 발급 중 서버 오류가 발생했습니다."));
        }
    }
}
