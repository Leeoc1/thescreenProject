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

    @Column(length = 20)
    private String runningscreen;

    @Column(length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'N'")
    private String movieinfo = "N";

    @Enumerated(EnumType.STRING)
    private IsAdult isadult;

    public enum IsAdult {
        Y, N
    }
}