package com.example.thescreen.service;

import com.example.thescreen.entity.Coupon;
import com.example.thescreen.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {
    
    private final CouponRepository couponRepository;
    
    /**
     * 사용자별 쿠폰 목록 조회
     */
    public List<Coupon> getUserCoupons(String userid) {
        return couponRepository.findByUseridOrderByCouponexpiredateAsc(userid);
    }
    
    /**
     * 사용자별 사용 가능한 쿠폰 목록 조회
     */
    public List<Coupon> getAvailableCoupons(String userid) {
        return couponRepository.findAvailableCouponsByUserid(userid);
    }
    
    /**
     * 쿠폰 사용
     */
    @Transactional
    public boolean useCoupon(String userid, Integer couponnum) {
        Optional<Coupon> couponOpt = couponRepository.findByCouponnumAndUserid(couponnum, userid);
        
        if (couponOpt.isEmpty()) {
            throw new IllegalArgumentException("해당 쿠폰을 찾을 수 없습니다.");
        }
        
        Coupon coupon = couponOpt.get();
        
        // 이미 사용된 쿠폰인지 확인
        if (!coupon.getCouponstatus()) {
            throw new IllegalStateException("이미 사용된 쿠폰입니다.");
        }
        
        // 만료된 쿠폰인지 확인
        if (coupon.getCouponexpiredate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("만료된 쿠폰입니다.");
        }
        
        // 쿠폰 사용 처리
        coupon.setCouponstatus(false);
        coupon.setCouponusedate(LocalDate.now());
        couponRepository.save(coupon);
        
        return true;
    }
    
    /**
     * 쿠폰 발급
     */
    @Transactional
    public Coupon issueCoupon(String userid, Integer couponcd, String couponname, Integer discount, LocalDate expiredate) {
        Coupon coupon = new Coupon();
        coupon.setUserid(userid);
        coupon.setCouponcd(couponcd);
        coupon.setCouponname(couponname);
        coupon.setDiscount(discount);
        coupon.setCouponstatus(true);
        coupon.setCouponexpiredate(expiredate);
        
        return couponRepository.save(coupon);
    }
    
    /**
     * 환영 쿠폰 자동 발급 (회원가입 시 호출)
     */
    @Transactional
    public void issueWelcomeCoupon(String userid) {
        try {
            // 환영 쿠폰 코드: 106, 할인금액: 5000원, 만료일: 3개월 후
            Integer couponcd = 106;
            String couponname = getCouponNameByCode(couponcd);
            Integer discount = getDiscountByCode(couponcd);
            LocalDate expiredate = LocalDate.now().plusMonths(3);
            
            issueCoupon(userid, couponcd, couponname, discount, expiredate);
            System.out.println("환영 쿠폰 발급 완료 - userid: " + userid);
        } catch (Exception e) {
            System.err.println("환영 쿠폰 발급 실패 - userid: " + userid + ", error: " + e.getMessage());
            // 쿠폰 발급 실패가 회원가입을 막지 않도록 예외를 던지지 않음
        }
    }
    
    /**
     * 쿠폰 상세 조회
     */
    public Optional<Coupon> getCouponDetail(String userid, Integer couponnum) {
        return couponRepository.findByCouponnumAndUserid(couponnum, userid);
    }
    
    /**
     * 사용된 쿠폰 목록 조회
     */
    public List<Coupon> getUsedCoupons(String userid) {
        return couponRepository.findByUseridAndCouponstatusOrderByCouponusedateDesc(userid, false);
    }
    
    /**
     * 쿠폰 코드에 따른 쿠폰명 반환
     */
    public String getCouponNameByCode(Integer couponcd) {
        switch (couponcd) {
            case 101: return "할인쿠폰";
            case 102: return "웰컴 쿠폰";
            case 103: return "학생 할인 쿠폰";
            case 104: return "시니어 할인 쿠폰";
            case 105: return "영화관람권";
            case 106: return "환영 쿠폰";
            default: return "알 수 없는 쿠폰";
        }
    }
    
    /**
     * 쿠폰 코드에 따른 할인율/할인금액 반환
     */
    public Integer getDiscountByCode(Integer couponcd) {
        switch (couponcd) {
            case 101: return 3000;   // 할인쿠폰 - 3000원 할인
            case 102: return 2000;   // 웰컴 쿠폰 - 2000원 할인
            case 103: return 1500;   // 학생 할인 쿠폰 - 1500원 할인
            case 104: return 1500;   // 시니어 할인 쿠폰 - 1500원 할인
            case 105: return 10000;  // 영화관람권 - 10000원 할인
            case 106: return 5000;   // 환영 쿠폰 - 5000원 할인
            default: return 0;
        }
    }
}
