package com.example.thescreen.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "screen_view")
@Getter
@Setter
@org.hibernate.annotations.Immutable
public class ScreenView {
    @Id
    private String screencd;
    private String allseat;
    private String cinemacd;
    private int reservationseat;
    private String screenname;
    private String screenstatus;
    private String screentype;
    private String cinemanm;
    private String regioncd;
    private String regionnm;

}
