package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation") // reservation 테이블 매핑
@Getter
@Setter
public class Reservation {
    @Id
    private String reservationcd;

    @ManyToOne
    @JoinColumn(name = "userid") // 외래 키: userid
    private User user;

    @Column(length = 20) // schedulecd, 길이 20, 선택 입력
    private String schedulecd;

    private LocalDateTime reservationtime; // reservationtime, datetime, 선택 입력

    @Column(length = 20) // reservationstatus, 길이 20, 선택 입력
    private String reservationstatus;

    @Column
    private String seatcd; // 좌석 코드

    @Column(length = 20) // paymentcd, 길이 20, 선택 입력
    private String paymentcd;
}