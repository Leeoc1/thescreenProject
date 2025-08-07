package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "staff") // user 테이블 매핑
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Staff {
    @Id
    @Column(length = 20) // 기본 키: staffid
    private String staffid;

    @Column(length = 20) // staffname
    private String staffname;

    @Column(length = 20) // dept(소속 팀)
    private String dept;

    @Column(length = 10) // position(매니저/대리/사원)
    private String position;

    @Column(length = 20) // 전화번호
    private String phone;

    @Column(length = 50) // email
    private String email;

    @Column(length = 20) // theater
    private String theater;

    @Column
    private LocalDate hiredate; //hireDate

    @Column(length = 10) // shiftType
    private String shifttype;

    @Column(length = 20) // role(지점 관리/매표/안내/상영관 관리/매점 판매/고객 응대)
    private String role;

    @Column(length = 10) // status(근무중/휴가/퇴근/퇴사)
    private String status;


}