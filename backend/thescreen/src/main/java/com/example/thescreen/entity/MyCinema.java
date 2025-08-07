package com.example.thescreen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "mycinema")

public class MyCinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer wishlistnum;

    @Column(nullable = false, length = 20)
    private String userid;

    @Column(nullable = false)
    private String cinemacd;
}
