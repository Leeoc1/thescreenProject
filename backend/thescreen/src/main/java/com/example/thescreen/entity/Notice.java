package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice") // notice 테이블 매핑
@Getter
@Setter
public class Notice {
    @Id
    private Long noticenum; // 기본 키: noticenum, bigint

    @Column(length = 20) // noticetype, 길이 20, 선택 입력
    private String noticetype;

    @Column(length = 50) // noticesub, 길이 50, 선택 입력
    private String noticesub;

    private LocalDateTime noticedate; // noticedate, datetime, 선택 입력

    @Column
    private String noticecontents;

    @Column
    private String writer;
}