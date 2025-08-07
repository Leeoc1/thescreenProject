package com.example.thescreen.repository;

import com.example.thescreen.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    
    // 사용자별 쿠폰 목록 조회
    List<Coupon> findByUseridOrderByCouponexpiredateAsc(String userid);
    
    // 사용자별 사용 가능한 쿠폰 목록 조회
    @Query("SELECT c FROM Coupon c WHERE c.userid = :userid AND c.couponstatus = true AND c.couponexpiredate >= CURRENT_DATE ORDER BY c.couponexpiredate ASC")
    List<Coupon> findAvailableCouponsByUserid(@Param("userid") String userid);
    
    // 특정 쿠폰 조회 (사용자 확인 포함)
    Optional<Coupon> findByCouponnumAndUserid(Integer couponnum, String userid);
    
    // 쿠폰 코드별 조회
    List<Coupon> findByCouponcd(Integer couponcd);
    
    // 사용된 쿠폰 목록 조회
    List<Coupon> findByUseridAndCouponstatusOrderByCouponusedateDesc(String userid, Boolean couponstatus);
}
