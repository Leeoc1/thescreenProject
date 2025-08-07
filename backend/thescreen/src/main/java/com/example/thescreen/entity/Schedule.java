package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "schedule")
@Getter
@Setter
@NoArgsConstructor
public class Schedule {

    @Id
    @Column(length = 20)
    private String schedulecd; // 상영 정보 코드 (PK)

    @Column(length = 20)
    private String moviecd; // 영화 코드

    @Column(length = 20)
    private String screencd; // 상영관 코드

    @Column
    private LocalDate startdate; // 상영 시작 날짜

    @Column
    private LocalDateTime starttime; // 상영 시작 시간

    @Column
    private LocalDateTime endtime; // 상영 종료 시간
}
