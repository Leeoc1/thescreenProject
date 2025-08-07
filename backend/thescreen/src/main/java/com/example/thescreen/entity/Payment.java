package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment") // payment 테이블 매핑
@Getter
@Setter
public class Payment {
    @Id
    @Column(length = 20) // 기본 키: paymentcd, 길이 20
    private String paymentcd;

    @Column(length = 50) // paymentmethod, 길이 20
    private String paymentmethod;

    private LocalDateTime paymenttime; // paymenttime, datetime

    private Long amount; // amount

    @Column(length = 20) // paymentstatus, 길이 20
    private String paymentstatus;
}