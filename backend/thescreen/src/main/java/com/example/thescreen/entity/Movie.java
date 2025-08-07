package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "movie")
@Getter
@Setter
public class Movie {
    @Id
    @Column(length = 20)
    private String moviecd;

    @Column(length = 100)
    private String movienm;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String genre;

    @Column(length = 50)
    private String director;

    @Column(columnDefinition = "TEXT")
    private String actors;

    private Integer runningtime;

    private LocalDate releasedate;

    @Column(length = 200)
    private String posterurl;

    @Column(length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'N'")
    private String movieinfo = "N";

    @Enumerated(EnumType.STRING)
    private IsAdult isadult;
    
    // 박스오피스 관련 필드 추가
    @Column
    private Integer movierank; // 박스오피스 순위
    
    @Column
    private Long audiacc; // 누적 관객수
    
    @Column(name = "last_updated")
    private LocalDate lastUpdated; // 마지막 업데이트 날짜

    public enum IsAdult {
        Y, N
    }
    
    /**
     * 엔티티가 저장되기 전에 자동으로 lastUpdated 설정
     */
    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.lastUpdated = LocalDate.now();
    }
}