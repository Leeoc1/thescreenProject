package com.example.thescreen.entity;

import lombok.Data;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.util.Date;

@Entity
@Table(name = "view_movie_with_rank")
@Immutable
@Data
public class MovieView {
    @Id
    @Column(name = "moviecd", length = 20, nullable = false)
    private String moviecd; // varchar(20)

    @Column(name = "movienm", length = 100)
    private String movienm; // varchar(100)

    @Column(name = "genre", length = 255)
    private String genre; // varchar(255)

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "director", length = 50)
    private String director; // varchar(50)

    @Column(name = "actors", columnDefinition = "text")
    private String actors; // text

    @Column(name = "runningtime", columnDefinition = "int(11)")
    private Integer runningtime; // int(11)

    @Column(name = "releasedate", columnDefinition = "date")
    private Date releasedate; // date

    @Column(name = "posterurl", length = 200)
    private String posterurl; // varchar(200)

    @Column(name = "runningscreen", length = 20)
    private String runningscreen; // varchar(20)

    @Column(name = "movieinfo", length = 50)
    private String movieinfo; // varchar(50)

    @Column(name = "isadult", length = 1)
    private String isadult; // enum('N','Y')

    @Column(length = 30) // movierankcd의 길이를 적절히 설정 (MovieRank의 movierankcd와 일치)
    private String movierankcd; // MovieRank와의 연관성을 위한 필드

    @Column(name = "movierank", length = 30)
    private String movierank; // varchar(30)

    @Column(name = "rankchange", columnDefinition = "int(11)")
    private Integer rankchange; // int(11)
}