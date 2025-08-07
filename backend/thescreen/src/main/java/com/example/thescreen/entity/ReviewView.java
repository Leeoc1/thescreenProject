package com.example.thescreen.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "review_view")
@Getter
@Setter
public class ReviewView {

    @Id
    private Integer reviewnum;

    @Column(length = 20)
    private String userid;

    @Column(length = 100)
    private String movienm;

    private Byte rating;

    private Integer likes;
}
