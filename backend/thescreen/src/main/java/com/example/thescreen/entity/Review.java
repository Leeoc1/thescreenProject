package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reviewnum;

    private LocalDateTime reviewdate;

    @Column(length = 20)
    private String userid;

    @Column(length = 20)
    private String moviecd;

    @Column(name = "reviewcontents", columnDefinition = "TEXT")
    private String reviewcontents;

    private Byte rating;

    private Integer likes;

    @Column(length = 100)
    private String viewingpoints;

}
