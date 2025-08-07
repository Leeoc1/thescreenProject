package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Table(name = "moviewithschedule")
@Entity
@NoArgsConstructor
public class MovieWithSchedule {
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

    @Column(length = 50)
    private String movieinfo;

    @Enumerated(EnumType.STRING)
    private Movie.IsAdult isadult;

    @Column(name = "movierank", length = 30)
    private String movierank; // varchar(30)
}