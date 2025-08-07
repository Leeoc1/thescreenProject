package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "coupon")
@Getter
@Setter
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "couponnum")
    private Integer couponnum;

    @Column(name = "userid", length = 20, nullable = false)
    private String userid;

    @Column(name = "couponcd", nullable = false)
    private Integer couponcd;

    @Column(name = "couponname", columnDefinition = "TEXT", nullable = false)
    private String couponname;

    @Column(name = "discount", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer discount = 0;

    @Column(name = "couponstatus", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean couponstatus = true;

    @Column(name = "couponusedate")
    private LocalDate couponusedate;

    @Column(name = "couponexpiredate", nullable = false)
    private LocalDate couponexpiredate;
}
