package com.example.thescreen.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_view")
@Getter
@Setter
public class ReservationView {
    @Id
    private String reservationcd;
    private String seatcd;
    private LocalDateTime reservationtime;
    private String starttime;
    private String movienm;
    private String reservationstatus;
    private Integer runningtime;
    private String screenname;
    private String cinemanm;
    private String userid;
    private String paymenttime;
    private String paymentmethod;
    private Long amount;
}
