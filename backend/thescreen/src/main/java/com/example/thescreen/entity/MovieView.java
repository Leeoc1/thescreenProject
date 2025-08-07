package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "movie_view")
@Getter
@Setter
@org.hibernate.annotations.Immutable
public class MovieView {
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

    @Column(length = 50)
    private String movieinfo;

    @Enumerated(EnumType.STRING)
    private IsAdult isadult;
    
    // 박스오피스 관련 필드
    @Column
    private Integer movierank; // 박스오피스 순위
    
    @Column
    private Long audiacc; // 누적 관객수
    
    @Column(name = "last_updated")
    private LocalDate lastUpdated; // 마지막 업데이트 날짜

    public enum IsAdult {
        Y, N
    }
}
