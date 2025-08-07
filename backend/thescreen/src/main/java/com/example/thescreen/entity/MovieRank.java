package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "movierank")
public class MovieRank {

    @Id
    private String movierankcd;

    @Column
    private String moviename;

    @Column
    private Integer movierank;

    @Column
    private Integer rankchange;

    @Column
    private Long audiacc; // 누적관객수 추가
}
